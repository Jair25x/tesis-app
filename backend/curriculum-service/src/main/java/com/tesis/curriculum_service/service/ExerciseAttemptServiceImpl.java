package com.tesis.curriculum_service.service;

import com.tesis.curriculum_service.dto.ExerciseAttemptRequest;
import com.tesis.curriculum_service.dto.ExerciseAttemptResponse;
import com.tesis.curriculum_service.exception.ResourceNotFoundException;
import com.tesis.curriculum_service.model.Exercise;
import com.tesis.curriculum_service.model.ExerciseAttempt;
import com.tesis.curriculum_service.repository.ExerciseAttemptRepository;
import com.tesis.curriculum_service.repository.ExerciseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ExerciseAttemptServiceImpl implements ExerciseAttemptService {

    private final ExerciseRepository exerciseRepository;
    private final ExerciseAttemptRepository attemptRepository;

    @Override
    @Transactional
    public ExerciseAttemptResponse saveAttempt(Long userId, ExerciseAttemptRequest request) {
        UUID exerciseId = request.getExerciseId();

        Exercise exercise = exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new ResourceNotFoundException("Ejercicio no encontrado con ID: " + exerciseId));

        ExerciseAttempt attempt = ExerciseAttempt.builder()
                .userId(userId)
                .exercise(exercise)
                .correct(request.isCorrect())
                .hintsUsed(request.getHintsUsed())
                .timeSpent(request.getTimeSpent())
                .submittedAnswer(request.getSubmittedAnswer())
                .attemptedAt(LocalDateTime.now())
                .build();

        ExerciseAttempt saved = attemptRepository.save(attempt);

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExerciseAttemptResponse> getAttemptsByUser(Long userId) {
        return attemptRepository.findActiveByUserId(userId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExerciseAttemptResponse> getAttemptsByExerciseAndUser(UUID exerciseId, Long userId) {
        return attemptRepository.findActiveByExerciseIdAndUserId(exerciseId, userId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExerciseAttemptResponse> getAttemptsByExercise(UUID exerciseId) {
        return attemptRepository.findActiveByExerciseId(exerciseId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExerciseAttemptResponse> getAllAttemptsByUserIncludingInactive(Long userId) {
        return attemptRepository.findAllByUserIdIncludingInactive(userId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExerciseAttemptResponse> getAllAttemptsByExerciseIncludingInactive(UUID exerciseId) {
        return attemptRepository.findAllByExerciseIdIncludingInactive(exerciseId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    /**
     * Convierte una entidad ExerciseAttempt a su correspondiente DTO.
     */
    private ExerciseAttemptResponse mapToResponse(ExerciseAttempt attempt) {
        return ExerciseAttemptResponse.builder()
                .id(attempt.getId())
                .exerciseId(attempt.getExercise().getId())
                .correct(attempt.isCorrect())
                .hintsUsed(attempt.getHintsUsed())
                .timeSpent(attempt.getTimeSpent())
                .submittedAnswer(attempt.getSubmittedAnswer())
                .attemptedAt(attempt.getAttemptedAt())
                .build();
    }
}
