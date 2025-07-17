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

/**
 * Implementación del servicio para registrar intentos de ejercicios por parte
 * de los estudiantes.
 */
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

    return ExerciseAttemptResponse.builder()
        .id(saved.getId())
        .exerciseId(saved.getExercise().getId())
        .correct(saved.isCorrect())
        .hintsUsed(saved.getHintsUsed())
        .timeSpent(saved.getTimeSpent())
        .submittedAnswer(saved.getSubmittedAnswer())
        .attemptedAt(saved.getAttemptedAt())
        .build();
  }

  @Override
  @Transactional(readOnly = true)
  public List<ExerciseAttemptResponse> getAttemptsByUser(Long userId) {
    return attemptRepository.findByUserId(userId).stream()
        .map(attempt -> ExerciseAttemptResponse.builder()
            .id(attempt.getId())
            .exerciseId(attempt.getExercise().getId())
            .correct(attempt.isCorrect())
            .hintsUsed(attempt.getHintsUsed())
            .timeSpent(attempt.getTimeSpent())
            .submittedAnswer(attempt.getSubmittedAnswer())
            .attemptedAt(attempt.getAttemptedAt())
            .build())
        .toList();
  }

  @Override
  @Transactional(readOnly = true)
  public List<ExerciseAttemptResponse> getAttemptsByExerciseAndUser(UUID exerciseId, Long userId) {
    return attemptRepository.findByExerciseIdAndUserId(exerciseId, userId).stream()
        .map(attempt -> ExerciseAttemptResponse.builder()
            .id(attempt.getId())
            .exerciseId(attempt.getExercise().getId())
            .correct(attempt.isCorrect())
            .hintsUsed(attempt.getHintsUsed())
            .timeSpent(attempt.getTimeSpent())
            .submittedAnswer(attempt.getSubmittedAnswer())
            .attemptedAt(attempt.getAttemptedAt())
            .build())
        .toList();
  }
}
