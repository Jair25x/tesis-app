package com.tesis.progress_service.service;

import com.tesis.progress_service.client.CurriculumClient;
import com.tesis.progress_service.client.AdvisorClient; // ✅ nuevo
import com.tesis.progress_service.core.ProgressCalculator;
import com.tesis.progress_service.dto.AttemptEventRequest;
import com.tesis.progress_service.dto.AttemptRequest;
import com.tesis.progress_service.dto.AttemptResponse;
import com.tesis.progress_service.dto.CheckResultDto;
import com.tesis.progress_service.dto.SopDto;
import com.tesis.progress_service.dto.StreakDto;
import com.tesis.progress_service.model.Attempt;
import com.tesis.progress_service.model.Streak;
import com.tesis.progress_service.model.StudentObjectiveProgress;
import com.tesis.progress_service.model.enums.AttemptSource;
import com.tesis.progress_service.observability.AttemptMetricsRecorder;
import com.tesis.progress_service.repository.AttemptRepository;
import com.tesis.progress_service.repository.StreakRepository;
import com.tesis.progress_service.repository.StudentObjectiveProgressRepository;
import lombok.RequiredArgsConstructor;
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

        private final CurriculumClient curriculumClient;
        private final AttemptRepository attemptRepository;
        private final StudentObjectiveProgressRepository sopRepository;
        private final StreakRepository streakRepository;
        private final ProgressCalculator progressCalculator;
        private final AchievementService achievementService;
        private final AttemptMetricsRecorder attemptMetrics;

        // ✅ nuevo
        private final AdvisorClient advisorClient;

        // === FLUJO PÚBLICO ===
        @Transactional
        public AttemptResponse recordAttempt(UUID studentId, AttemptRequest req) {
                Timer.Sample sample = attemptMetrics.startAttemptTimer();
                Attempt attempt = null;
                boolean correct = false;

                try {
                        // 1) evaluar respuesta
                        CheckResultDto check = curriculumClient.checkAnswer(req.getExerciseId(), req.getAnswer());
                        correct = check.isCorrect();
                        BigDecimal scoreBD = check.getScore() != null ? check.getScore()
                                        : (correct ? BigDecimal.ONE : BigDecimal.ZERO);

                        // 2) persistir intento
                        attempt = attemptRepository.save(
                                        Attempt.builder()
                                                        .studentId(studentId)
                                                        .curriculumId(req.getCurriculumId())
                                                        .learningObjectiveId(req.getLearningObjectiveId())
                                                        .exerciseId(req.getExerciseId())
                                                        .templateType(req.getTemplateType())
                                                        .difficulty(req.getDifficulty())
                                                        .source(req.getSource() != null ? req.getSource()
                                                                        : AttemptSource.PRACTICE)
                                                        .sourceRefId(req.getSourceRefId())
                                                        .sessionId(req.getSessionId())
                                                        .answerPayload(req.getAnswer())
                                                        .checkResult(Map.of("correct", correct, "score", scoreBD,
                                                                        "feedback", check.getFeedback()))
                                                        .correct(correct)
                                                        .score(scoreBD)
                                                        .hintsUsed(req.getHintsUsed() != null ? req.getHintsUsed() : 0)
                                                        .durationMs(req.getDurationMs())
                                                        .build());

                        // 3) counters por intento
                        boolean fromReco = attempt.getSourceRefId() != null;
                        attemptMetrics.recordAttempt(attempt.getTemplateType(), attempt.getDifficulty(),
                                        attempt.isCorrect(), fromReco);

                        // 4) SOP + racha + logros
                        StudentObjectiveProgress sop = sopRepository
                                        .findByStudentIdAndLearningObjectiveId(studentId, req.getLearningObjectiveId())
                                        .orElseGet(() -> StudentObjectiveProgress.builder()
                                                        .studentId(studentId)
                                                        .curriculumId(req.getCurriculumId())
                                                        .learningObjectiveId(req.getLearningObjectiveId())
                                                        .build());
                        sop = progressCalculator.applyAttempt(sop, attempt);
                        sopRepository.save(sop);

                        Streak streak = streakRepository.findByStudentId(studentId)
                                        .orElseGet(() -> Streak.builder().studentId(studentId).current(0).longest(0)
                                                        .build());
                        streak = progressCalculator.updateStreak(streak, LocalDate.now());
                        streakRepository.save(streak);

                        var unlocked = achievementService.evaluateAndGrant(studentId, attempt, sop, streak);

                        // 5) invalidación (única y post-persistencia) con métrica
                        try {
                                var invSample = attemptMetrics.startInvalidationTimer();
                                advisorClient.invalidateRecommendations(studentId);
                                attemptMetrics.stopInvalidationTimer(invSample, "success");
                        } catch (Exception ex) {
                                attemptMetrics.stopInvalidationTimer(attemptMetrics.startInvalidationTimer(), "error");
                                // fail-open
                        }

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
                        String tpl = (attempt != null) ? attempt.getTemplateType() : req.getTemplateType();
                        String dif = (attempt != null) ? attempt.getDifficulty() : req.getDifficulty();
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

                Attempt attempt = attemptRepository.save(
                                Attempt.builder()
                                                .studentId(studentId)
                                                .curriculumId(req.getCurriculumId())
                                                .learningObjectiveId(req.getObjectiveId())
                                                .exerciseId(req.getExerciseId())
                                                .source(src)
                                                .answerPayload(null)
                                                .checkResult(Map.of(
                                                                "from", "assessment",
                                                                "correct", req.getCorrect(),
                                                                "score", req.getScore(),
                                                                "points", req.getPoints(),
                                                                "metadata", req.getMetadata()))
                                                .correct(req.getCorrect())
                                                .score(req.getScore())
                                                .hintsUsed(0)
                                                .durationMs(null)
                                                .build());

                StudentObjectiveProgress sop = sopRepository
                                .findByStudentIdAndLearningObjectiveId(studentId, req.getObjectiveId())
                                .orElseGet(() -> StudentObjectiveProgress.builder()
                                                .studentId(studentId)
                                                .curriculumId(req.getCurriculumId())
                                                .learningObjectiveId(req.getObjectiveId())
                                                .build());
                sop = progressCalculator.applyAttempt(sop, attempt);
                sopRepository.save(sop);

                Streak streak = streakRepository.findByStudentId(studentId)
                                .orElseGet(() -> Streak.builder().studentId(studentId).current(0).longest(0).build());
                streak = progressCalculator.updateStreak(streak, LocalDate.now());
                streakRepository.save(streak);

                achievementService.evaluateAndGrant(studentId, attempt, sop, streak);

                try {
                        var invSample = attemptMetrics.startInvalidationTimer();
                        advisorClient.invalidateRecommendations(studentId);
                        attemptMetrics.stopInvalidationTimer(invSample, "success");
                } catch (Exception ex) {
                        attemptMetrics.stopInvalidationTimer(attemptMetrics.startInvalidationTimer(), "error");
                }
        }
}
