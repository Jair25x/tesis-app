package com.tesis.curriculum_service.repository;

import com.tesis.curriculum_service.model.SolutionStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repositorio JPA para la entidad {@link SolutionStep}.
 * Define operaciones CRUD, filtrado por estado y borrado en cascada.
 * Todas las consultas son nativas para mayor control.
 */
@Repository
public interface SolutionStepRepository extends JpaRepository<SolutionStep, UUID> {

  /**
   * Lista los pasos activos de un ejercicio, ordenados por step_number.
   */
  @Query(value = """
      SELECT * FROM solution_steps
      WHERE exercise_id = :exerciseId
        AND active = true
      ORDER BY step_number ASC
      """, nativeQuery = true)
  List<SolutionStep> findActiveByExerciseId(@Param("exerciseId") UUID exerciseId);

  /**
   * Lista todos los pasos (activos e inactivos) de un ejercicio,
   * ordenados por step_number (modo admin).
   */
  @Query(value = """
      SELECT * FROM solution_steps
      WHERE exercise_id = :exerciseId
      ORDER BY step_number ASC
      """, nativeQuery = true)
  List<SolutionStep> findAllByExerciseId(@Param("exerciseId") UUID exerciseId);

  /**
   * Recupera un paso activo por su ID y ejercicio asociado.
   */
  @Query(value = """
      SELECT * FROM solution_steps
      WHERE id = :id
        AND exercise_id = :exerciseId
        AND active = true
      """, nativeQuery = true)
  Optional<SolutionStep> findByIdAndExerciseId(@Param("id") UUID id, @Param("exerciseId") UUID exerciseId);

  /**
   * Recupera un paso por ID sin importar si está activo (para reactivación o
   * admin).
   */
  @Query(value = """
      SELECT * FROM solution_steps
      WHERE id = :id
        AND exercise_id = :exerciseId
      """, nativeQuery = true)
  Optional<SolutionStep> findIncludingInactiveByIdAndExerciseId(@Param("id") UUID id,
      @Param("exerciseId") UUID exerciseId);

  /**
   * Borrado manual en cascada: elimina todos los pasos de un ejercicio.
   * Útil si se desea hacer limpieza sin depender del cascade de JPA.
   */
  @Query(value = """
      DELETE FROM solution_steps
      WHERE exercise_id = :exerciseId
      """, nativeQuery = true)
  void deleteAllByExerciseId(@Param("exerciseId") UUID exerciseId);
}
