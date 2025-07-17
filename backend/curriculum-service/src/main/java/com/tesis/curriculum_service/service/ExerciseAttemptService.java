package com.tesis.curriculum_service.service;

import java.util.List;
import java.util.UUID;

import com.tesis.curriculum_service.dto.ExerciseAttemptRequest;
import com.tesis.curriculum_service.dto.ExerciseAttemptResponse;

/**
 * Servicio para manejar los intentos de resolución de ejercicios por parte de
 * los estudiantes.
 */
public interface ExerciseAttemptService {

  /**
   * Registra un intento de resolución de ejercicio por un estudiante autenticado.
   *
   * @param userId  ID del estudiante (extraído del JWT)
   * @param request datos del intento
   * @return datos del intento registrado
   */
  ExerciseAttemptResponse saveAttempt(Long userId, ExerciseAttemptRequest request);

  List<ExerciseAttemptResponse> getAttemptsByUser(Long userId);

  List<ExerciseAttemptResponse> getAttemptsByExerciseAndUser(UUID exerciseId, Long userId);
  
}
