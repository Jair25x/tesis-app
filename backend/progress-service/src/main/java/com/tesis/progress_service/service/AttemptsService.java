package com.tesis.progress_service.service;

import com.tesis.progress_service.client.CurriculumClient;
import com.tesis.progress_service.core.ProgressCalculator;
import com.tesis.progress_service.dto.AttemptEventRequest;
import com.tesis.progress_service.dto.AttemptRequest;
import com.tesis.progress_service.dto.AttemptResponse;
import com.tesis.progress_service.dto.CheckResultDto;
import com.tesis.progress_service.dto.SopDto;
import com.tesis.progress_service.dto.StreakDto;
import com.tesis.progress_service.dto.ExerciseMetaDto;
import com.tesis.progress_service.exception.InvalidAttemptException;
import com.tesis.progress_service.model.Attempt;
import com.tesis.progress_service.model.Streak;
import com.tesis.progress_service.model.StudentObjectiveProgress;
import com.tesis.progress_service.model.enums.AttemptSource;
import com.tesis.progress_service.observability.AttemptMetricsRecorder;
import com.tesis.progress_service.repository.AttemptRepository;
import com.tesis.progress_service.repository.StreakRepository;
import com.tesis.progress_service.repository.StudentObjectiveProgressRepository;
import com.tesis.progress_service.service.events.AttemptPersistedEvent;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

import io.micrometer.core.instrument.Timer;

@Service
@RequiredArgsConstructor
public class AttemptsService {

        private static final Logger log = LoggerFactory.getLogger(AttemptsService.class);

        private final CurriculumClient curriculumClient;
        private final AttemptRepository attemptRepository;
        private final StudentObjectiveProgressRepository sopRepository;
        private final StreakRepository streakRepository;
        private final ProgressCalculator progressCalculator;
        private final AchievementService achievementService;
        private final AttemptMetricsRecorder attemptMetrics;
        private final ApplicationEventPublisher events; // ⬅️ para invalidación post-commit

        // === FLUJO PÚBLICO ===
        @Transactional
        public AttemptResponse recordAttempt(UUID studentId, AttemptRequest req) {

                Timer.Sample sample = attemptMetrics.startAttemptTimer();
                Attempt attempt = null;
                boolean correct = false;

                try {
                        final UUID exerciseId = req.getExerciseId();

                        // 0) Obtener metadatos oficiales del ejercicio desde curriculum-service
                        ExerciseMetaDto meta = curriculumClient.getExerciseMeta(exerciseId);

                        // 0.1) Validar coherencia de IDs enviados en el request vs los oficiales
                        if (meta.curriculumId() == null || meta.learningObjectiveId() == null) {
                                log.error("Exercise meta incompleto para exerciseId={} → {}", exerciseId, meta);
                                throw new InvalidAttemptException(
                                                "Metadatos de ejercicio incompletos para el intento");
                        }

                        if (!meta.curriculumId().equals(req.getCurriculumId())
                                        || !meta.learningObjectiveId().equals(req.getLearningObjectiveId())) {

                                log.warn("Intento con IDs incoherentes. Payload c={}, lo={}, ex={} vs meta c={}, lo={}, ex={}",
                                                req.getCurriculumId(), req.getLearningObjectiveId(), exerciseId,
                                                meta.curriculumId(), meta.learningObjectiveId(), meta.exerciseId());

                                throw new InvalidAttemptException(
                                                "Relación currículo / objetivo de aprendizaje / ejercicio no válida");
                        }

                        // 1) evaluar respuesta (usa el exerciseId, que ya validamos)
                        CheckResultDto check = curriculumClient.checkAnswer(exerciseId, req.getAnswer());
                        correct = check.isCorrect();
                        BigDecimal scoreBD = (check.getScore() != null)
                                        ? check.getScore()
                                        : (correct ? BigDecimal.ONE : BigDecimal.ZERO);

                        // 2) persistir intento usando SIEMPRE los IDs oficiales
                        attempt = attemptRepository.save(
                                        Attempt.builder()
                                                        .studentId(studentId)
                                                        .curriculumId(meta.curriculumId())
                                                        .learningObjectiveId(meta.learningObjectiveId())
                                                        .exerciseId(meta.exerciseId())
                                                        .templateType(req.getTemplateType())
                                                        .difficulty(req.getDifficulty())
                                                        .source(req.getSource() != null ? req.getSource()
                                                                        : AttemptSource.PRACTICE)
                                                        .sourceRefId(req.getSourceRefId())
                                                        .sessionId(req.getSessionId())
                                                        .answerPayload(req.getAnswer())
                                                        .checkResult(Map.of(
                                                                        "correct", correct,
                                                                        "score", scoreBD,
                                                                        "feedback", check.getFeedback()))
                                                        .correct(correct)
                                                        .score(scoreBD)
                                                        .hintsUsed(req.getHintsUsed() != null ? req.getHintsUsed() : 0)
                                                        .durationMs(req.getDurationMs())
                                                        .build());

                        // 3) counters por intento
                        boolean fromReco = attempt.getSourceRefId() != null;
                        String tpl = safeTag(attempt.getTemplateType());
                        String dif = safeTag(attempt.getDifficulty());
                        attemptMetrics.recordAttempt(tpl, dif, attempt.isCorrect(), fromReco);

                        // 4) SOP + racha + logros (usando IDs oficiales)
                        StudentObjectiveProgress sop = sopRepository
                                        .findByStudentIdAndLearningObjectiveId(studentId,
                                                        meta.learningObjectiveId())
                                        .orElseGet(() -> StudentObjectiveProgress.builder()
                                                        .studentId(studentId)
                                                        .curriculumId(meta.curriculumId())
                                                        .learningObjectiveId(meta.learningObjectiveId())
                                                        .build());

                        sop = progressCalculator.applyAttempt(sop, attempt);
                        sopRepository.save(sop);

                        Streak streak = streakRepository.findByStudentId(studentId)
                                        .orElseGet(() -> Streak.builder()
                                                        .studentId(studentId)
                                                        .current(0)
                                                        .longest(0)
                                                        .build());

                        streak = progressCalculator.updateStreak(streak, LocalDate.now());
                        streakRepository.save(streak);

                        var unlocked = achievementService.evaluateAndGrant(studentId, attempt, sop, streak);

                        // 5) invalidación post-commit (publicar evento)
                        events.publishEvent(new AttemptPersistedEvent(this, studentId));

                        // 6) response
                        BigDecimal acc = (sop.getAttemptsCount() == null || sop.getAttemptsCount() == 0)
                                        ? BigDecimal.ZERO
                                        : new BigDecimal(sop.getCorrectCount() == null ? 0 : sop.getCorrectCount())
                                                        .divide(new BigDecimal(sop.getAttemptsCount()), 3,
                                                                        RoundingMode.HALF_UP);

                        return AttemptResponse.builder()
                                        .attemptId(attempt.getId())
                                        .correct(correct)
                                        .score(scoreBD)
                                        .feedback(check.getFeedback())
                                        .sop(SopDto.builder()
                                                        .learningObjectiveId(sop.getLearningObjectiveId())
                                                        .attemptsCount(sop.getAttemptsCount() == null ? 0
                                                                        : sop.getAttemptsCount())
                                                        .correctCount(sop.getCorrectCount() == null ? 0
                                                                        : sop.getCorrectCount())
                                                        .streakCorrect(sop.getStreakCorrect() == null ? 0
                                                                        : sop.getStreakCorrect())
                                                        .accuracy(acc)
                                                        .status(sop.getStatus())
                                                        .masteryLevel(sop.getMasteryLevel())
                                                        .build())
                                        .streak(StreakDto.builder()
                                                        .current(streak.getCurrent() == null ? 0 : streak.getCurrent())
                                                        .longest(streak.getLongest() == null ? 0 : streak.getLongest())
                                                        .build())
                                        .unlocked(unlocked)
                                        .build();

                } finally {
                        // saneo de tags para evitar NPE/cardinalidad rara
                        String tpl = safeTag(attempt != null ? attempt.getTemplateType() : req.getTemplateType());
                        String dif = safeTag(attempt != null ? attempt.getDifficulty() : req.getDifficulty());
                        attemptMetrics.stopAttemptTimer(sample, tpl, dif, correct);
                }
        }

        // === FLUJO INTERNO (assessment → progress) ===
        @Transactional
        public void recordAttemptEvent(UUID studentId, AttemptEventRequest req) {

                AttemptSource src;
                try {
                        src = (req.getSource() == null) ? AttemptSource.PRACTICE
                                        : AttemptSource.valueOf(req.getSource());
                } catch (Exception ignored) {
                        src = AttemptSource.PRACTICE;
                }

                final UUID exerciseId = req.getExerciseId();

                // ✅ Validar también los IDs de event contra el currículo oficial
                ExerciseMetaDto meta = curriculumClient.getExerciseMeta(exerciseId);

                if (meta.curriculumId() == null || meta.learningObjectiveId() == null) {
                        log.error("Exercise meta incompleto (event) para exerciseId={} → {}", exerciseId, meta);
                        throw new InvalidAttemptException(
                                        "Metadatos de ejercicio incompletos para el intento (assessment)");
                }

                if (!meta.curriculumId().equals(req.getCurriculumId())
                                || !meta.learningObjectiveId().equals(req.getObjectiveId())) {

                        log.warn("AttemptEvent con IDs incoherentes. Payload c={}, lo={}, ex={} vs meta c={}, lo={}, ex={}",
                                        req.getCurriculumId(), req.getObjectiveId(), exerciseId,
                                        meta.curriculumId(), meta.learningObjectiveId(), meta.exerciseId());

                        throw new InvalidAttemptException(
                                        "Relación currículo / objetivo de aprendizaje / ejercicio no válida (assessment)");
                }

                // 1) score normalizado 0..1
                BigDecimal scoreNorm = null;
                if (req.getNormalizedScore() != null) {
                        scoreNorm = req.getNormalizedScore();
                } else if (req.getAwardedPoints() != null && req.getMaxPoints() != null && req.getMaxPoints() > 0) {
                        scoreNorm = new BigDecimal(req.getAwardedPoints())
                                        .divide(new BigDecimal(req.getMaxPoints()), 3, RoundingMode.HALF_UP);
                } else {
                        // sin info: 0
                        scoreNorm = BigDecimal.ZERO;
                        LoggerFactory.getLogger(AttemptsService.class)
                                        .warn("recordAttemptEvent: missing score fields; defaulting to 0 (studentId={}, exerciseId={})",
                                                        studentId, exerciseId);
                }

                // 2) Persistir Attempt (respuesta ya corregida por assessment),
                //    usando SIEMPRE los IDs oficiales
                Attempt attempt = attemptRepository.save(
                                Attempt.builder()
                                                .studentId(studentId)
                                                .curriculumId(meta.curriculumId())
                                                .learningObjectiveId(meta.learningObjectiveId())
                                                .exerciseId(meta.exerciseId())
                                                .source(src)
                                                .answerPayload(null)
                                                .checkResult(Map.of(
                                                                "from", "assessment",
                                                                "correct", req.getCorrect(),
                                                                "normalizedScore", scoreNorm, // <- 0..1
                                                                "awardedPoints", req.getAwardedPoints(),
                                                                "maxPoints", req.getMaxPoints(),
                                                                "metadata", req.getMetadata()))
                                                .correct(Boolean.TRUE.equals(req.getCorrect()))
                                                .score(scoreNorm) // <- 0..1
                                                .hintsUsed(0)
                                                .durationMs(null)
                                                .build());

                // 3) SOP + racha + logros (igual que antes, usando IDs oficiales)
                StudentObjectiveProgress sop = sopRepository
                                .findByStudentIdAndLearningObjectiveId(studentId, meta.learningObjectiveId())
                                .orElseGet(() -> StudentObjectiveProgress.builder()
                                                .studentId(studentId)
                                                .curriculumId(meta.curriculumId())
                                                .learningObjectiveId(meta.learningObjectiveId())
                                                .build());

                sop = progressCalculator.applyAttempt(sop, attempt);
                sopRepository.save(sop);

                Streak streak = streakRepository.findByStudentId(studentId)
                                .orElseGet(() -> Streak.builder()
                                                .studentId(studentId)
                                                .current(0)
                                                .longest(0)
                                                .build());
                streak = progressCalculator.updateStreak(streak, LocalDate.now());
                streakRepository.save(streak);

                achievementService.evaluateAndGrant(studentId, attempt, sop, streak);

                // invalidación post-commit
                events.publishEvent(new AttemptPersistedEvent(this, studentId));
        }

        /** Normaliza tag de métrica para evitar null/blank y cardinalidad excesiva. */
        private static String safeTag(String v) {
                if (v == null)
                        return "unknown";
                String t = v.trim();
                return t.isEmpty() ? "unknown" : t;
        }
}
