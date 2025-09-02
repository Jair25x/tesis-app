package com.tesis.progress_service.service;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.tesis.progress_service.client.CurriculumClient;
import com.tesis.progress_service.core.ProgressCalculator;
import com.tesis.progress_service.dto.AttemptRequest;
import com.tesis.progress_service.dto.AttemptEventRequest;
import com.tesis.progress_service.dto.AttemptResponse;
import com.tesis.progress_service.dto.CheckResultDto;
import com.tesis.progress_service.dto.SopDto;
import com.tesis.progress_service.dto.StreakDto;
import com.tesis.progress_service.model.Attempt;
import com.tesis.progress_service.model.Streak;
import com.tesis.progress_service.model.StudentObjectiveProgress;
import com.tesis.progress_service.model.enums.AttemptSource;
import com.tesis.progress_service.repository.AttemptRepository;
import com.tesis.progress_service.repository.StreakRepository;
import com.tesis.progress_service.repository.StudentObjectiveProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Mantiene el flujo público (recordAttempt) y agrega recordAttemptEvent para
 * S2S.
 */
@Service
@RequiredArgsConstructor
public class AttemptsService {

        private final CurriculumClient curriculumClient;
        private final AttemptRepository attemptRepository;
        private final StudentObjectiveProgressRepository sopRepository;
        private final StreakRepository streakRepository;
        private final ProgressCalculator progressCalculator;
        private final AchievementService achievementService;

        // === FLUJO PÚBLICO (ya lo tienes) ===
        @Transactional
        public AttemptResponse recordAttempt(UUID studentId, AttemptRequest req) {
                CheckResultDto check = curriculumClient.checkAnswer(
                                req.getExerciseId(),
                                req.getAnswer());

                boolean correct = check.isCorrect();
                BigDecimal scoreBD = check.getScore() != null
                                ? check.getScore()
                                : (correct ? BigDecimal.ONE : BigDecimal.ZERO);

                Attempt attempt = Attempt.builder()
                                .studentId(studentId)
                                .curriculumId(req.getCurriculumId())
                                .learningObjectiveId(req.getLearningObjectiveId())
                                .exerciseId(req.getExerciseId())
                                .templateType(req.getTemplateType())
                                .difficulty(req.getDifficulty())
                                .source(req.getSource() != null ? req.getSource() : AttemptSource.PRACTICE)
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
                                .build();

                attempt = attemptRepository.save(attempt);

                // SOP
                StudentObjectiveProgress sop = sopRepository
                                .findByStudentIdAndLearningObjectiveId(studentId, req.getLearningObjectiveId())
                                .orElseGet(() -> StudentObjectiveProgress.builder()
                                                .studentId(studentId)
                                                .curriculumId(req.getCurriculumId())
                                                .learningObjectiveId(req.getLearningObjectiveId())
                                                .build());

                sop = progressCalculator.applyAttempt(sop, attempt);
                sopRepository.save(sop);

                // Racha
                Streak streak = streakRepository.findByStudentId(studentId)
                                .orElseGet(() -> Streak.builder().studentId(studentId).current(0).longest(0).build());

                streak = progressCalculator.updateStreak(streak, LocalDate.now());
                streakRepository.save(streak);

                // Logros
                var unlocked = achievementService.evaluateAndGrant(studentId, attempt, sop, streak);

                BigDecimal acc = (sop.getAttemptsCount() == null || sop.getAttemptsCount() == 0)
                                ? BigDecimal.ZERO
                                : new BigDecimal(sop.getCorrectCount() == null ? 0 : sop.getCorrectCount())
                                                .divide(new BigDecimal(sop.getAttemptsCount()), 3,
                                                                RoundingMode.HALF_UP);

                SopDto sopDto = SopDto.builder()
                                .learningObjectiveId(sop.getLearningObjectiveId())
                                .attemptsCount(sop.getAttemptsCount() == null ? 0 : sop.getAttemptsCount())
                                .correctCount(sop.getCorrectCount() == null ? 0 : sop.getCorrectCount())
                                .streakCorrect(sop.getStreakCorrect() == null ? 0 : sop.getStreakCorrect())
                                .accuracy(acc)
                                .status(sop.getStatus())
                                .masteryLevel(sop.getMasteryLevel())
                                .build();

                StreakDto streakDto = StreakDto.builder()
                                .current(streak.getCurrent() == null ? 0 : streak.getCurrent())
                                .longest(streak.getLongest() == null ? 0 : streak.getLongest())
                                .build();

                return AttemptResponse.builder()
                                .attemptId(attempt.getId())
                                .correct(correct)
                                .score(scoreBD)
                                .feedback(check.getFeedback())
                                .sop(sopDto)
                                .streak(streakDto)
                                .unlocked(unlocked)
                                .build();
        }

        // === FLUJO INTERNO (assessment → progress) ===
        @Transactional
        public void recordAttemptEvent(UUID studentId, AttemptEventRequest req) {
                // Mapear AttemptSource robusto
                AttemptSource src;
                try {
                        src = (req.getSource() == null) ? AttemptSource.PRACTICE
                                        : AttemptSource.valueOf(req.getSource());
                } catch (Exception ignored) {
                        src = AttemptSource.PRACTICE;
                }

                // Construimos un "resultado" sintético (no volvemos a chequear)
                var checkResult = Map.<String, Object>of(
                                "from", "assessment",
                                "correct", req.getCorrect(),
                                "score", req.getScore(),
                                "points", req.getPoints(),
                                "metadata", req.getMetadata());

                Attempt attempt = Attempt.builder()
                                .studentId(studentId)
                                .curriculumId(req.getCurriculumId())
                                .learningObjectiveId(req.getObjectiveId())
                                .exerciseId(req.getExerciseId())
                                .source(src)
                                .answerPayload(null) // no recibimos la respuesta cruda
                                .checkResult(checkResult) // dejamos traza
                                .correct(req.getCorrect())
                                .score(req.getScore())
                                .hintsUsed(0)
                                .durationMs(null)
                                .build();

                attempt = attemptRepository.save(attempt);

                // SOP
                StudentObjectiveProgress sop = sopRepository
                                .findByStudentIdAndLearningObjectiveId(studentId, req.getObjectiveId())
                                .orElseGet(() -> StudentObjectiveProgress.builder()
                                                .studentId(studentId)
                                                .curriculumId(req.getCurriculumId())
                                                .learningObjectiveId(req.getObjectiveId())
                                                .build());

                sop = progressCalculator.applyAttempt(sop, attempt);
                sopRepository.save(sop);

                // Racha
                Streak streak = streakRepository.findByStudentId(studentId)
                                .orElseGet(() -> Streak.builder().studentId(studentId).current(0).longest(0).build());
                streak = progressCalculator.updateStreak(streak, LocalDate.now());
                streakRepository.save(streak);

                // Logros
                achievementService.evaluateAndGrant(studentId, attempt, sop, streak);
        }
}
