package com.tesis.curriculum_service.service;

import com.tesis.curriculum_service.dto.ExerciseAttemptRequest;
import com.tesis.curriculum_service.dto.ExerciseAttemptResponse;
import com.tesis.curriculum_service.exception.ResourceNotFoundException;

import java.util.List;
import java.util.UUID;

/**
 * Servicio para manejar los intentos de resolución de ejercicios por parte de
 * los estudiantes.
 */
public interface ExerciseAttemptService {

  /**
   * Registra un intento de resolución de ejercicio por un estudiante autenticado.
   *
   * @param userId  ID del estudiante (extraído del JWT)
   * @param request Datos del intento (ejercicio, pistas, tiempo, respuesta, etc.)
   * @return DTO con los datos del intento guardado
   * @throws ResourceNotFoundException si el ejercicio no existe
   */
  ExerciseAttemptResponse saveAttempt(Long userId, ExerciseAttemptRequest request)
      throws ResourceNotFoundException;

  /**
   * Obtiene todos los intentos activos realizados por el estudiante autenticado.
   *
   * @param userId ID del estudiante
   * @return Lista de intentos activos
   */
  List<ExerciseAttemptResponse> getAttemptsByUser(Long userId);

  /**
   * Obtiene todos los intentos activos de un ejercicio realizados por un
   * estudiante.
   *
   * @param exerciseId UUID del ejercicio
   * @param userId     ID del estudiante
   * @return Lista de intentos realizados por el estudiante en ese ejercicio
   */
  List<ExerciseAttemptResponse> getAttemptsByExerciseAndUser(UUID exerciseId, Long userId);

  /**
   * Obtiene todos los intentos activos de un ejercicio (de todos los
   * estudiantes).
   * Útil para visualización de docentes o estadísticas.
   *
   * @param exerciseId UUID del ejercicio
   * @return Lista de intentos activos en ese ejercicio
   */
  List<ExerciseAttemptResponse> getAttemptsByExercise(UUID exerciseId);

  /**
   * Obtiene todos los intentos (activos e inactivos) de un estudiante, incluyendo
   * eliminados.
   * Solo para modo admin o auditoría.
   *
   * @param userId ID del estudiante
   * @return Lista completa de intentos
   */
  List<ExerciseAttemptResponse> getAllAttemptsByUserIncludingInactive(Long userId);

  /**
   * Obtiene todos los intentos (activos e inactivos) de un ejercicio, incluyendo
   * eliminados.
   * Solo para modo admin o auditoría.
   *
   * @param exerciseId UUID del ejercicio
   * @return Lista completa de intentos
   */
  List<ExerciseAttemptResponse> getAllAttemptsByExerciseIncludingInactive(UUID exerciseId);
}
