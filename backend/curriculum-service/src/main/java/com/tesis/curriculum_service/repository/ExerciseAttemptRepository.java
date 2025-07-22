package com.tesis.curriculum_service.repository;

import com.tesis.curriculum_service.model.ExerciseAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ExerciseAttemptRepository extends JpaRepository<ExerciseAttempt, Long> {

  /**
   * Lista los intentos activos de un usuario (ordenados por fecha descendente).
   */
  @Query(value = """
      SELECT * FROM exercise_attempts
      WHERE user_id = :userId
        AND active = true
      ORDER BY attempted_at DESC
      """, nativeQuery = true)
  List<ExerciseAttempt> findActiveByUserId(@Param("userId") Long userId);

  /**
   * Lista todos los intentos activos para un ejercicio dado.
   */
  @Query(value = """
      SELECT * FROM exercise_attempts
      WHERE exercise_id = :exerciseId
        AND active = true
      ORDER BY attempted_at DESC
      """, nativeQuery = true)
  List<ExerciseAttempt> findActiveByExerciseId(@Param("exerciseId") UUID exerciseId);

  /**
   * Lista todos los intentos activos de un usuario en un ejercicio específico.
   */
  @Query(value = """
      SELECT * FROM exercise_attempts
      WHERE exercise_id = :exerciseId
        AND user_id = :userId
        AND active = true
      ORDER BY attempted_at DESC
      """, nativeQuery = true)
  List<ExerciseAttempt> findActiveByExerciseIdAndUserId(
      @Param("exerciseId") UUID exerciseId,
      @Param("userId") Long userId);

  /**
   * Lista todos los intentos (activos e inactivos) de un usuario.
   */
  @Query(value = """
      SELECT * FROM exercise_attempts
      WHERE user_id = :userId
      ORDER BY attempted_at DESC
      """, nativeQuery = true)
  List<ExerciseAttempt> findAllByUserIdIncludingInactive(@Param("userId") Long userId);

  /**
   * Lista todos los intentos (activos e inactivos) de un ejercicio.
   */
  @Query(value = """
      SELECT * FROM exercise_attempts
      WHERE exercise_id = :exerciseId
      ORDER BY attempted_at DESC
      """, nativeQuery = true)
  List<ExerciseAttempt> findAllByExerciseIdIncludingInactive(@Param("exerciseId") UUID exerciseId);
}
