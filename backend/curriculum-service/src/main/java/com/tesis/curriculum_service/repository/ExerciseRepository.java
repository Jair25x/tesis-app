package com.tesis.curriculum_service.repository;

import com.tesis.curriculum_service.model.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repositorio JPA para la entidad {@link Exercise}.
 * Proporciona métodos CRUD, soporte para soft-delete
 * y consultas nativas por objetivo de aprendizaje.
 */
@Repository
public interface ExerciseRepository extends JpaRepository<Exercise, UUID> {

  /**
   * Recupera todos los ejercicios activos asociados a un objetivo de aprendizaje.
   */
  @Query(value = """
      SELECT * FROM exercises
       WHERE learning_objective_id = :learningObjectiveId
         AND active = true
       ORDER BY created_at DESC
      """, nativeQuery = true)
  List<Exercise> findByLearningObjectiveId(@Param("learningObjectiveId") UUID learningObjectiveId);

  /**
   * Recupera un ejercicio activo por su ID y objetivo de aprendizaje.
   */
  @Query(value = """
      SELECT * FROM exercises
       WHERE id = :id
         AND learning_objective_id = :learningObjectiveId
         AND active = true
      """, nativeQuery = true)
  Optional<Exercise> findByIdAndLearningObjectiveId(@Param("id") UUID id,
      @Param("learningObjectiveId") UUID learningObjectiveId);

  /**
   * Recupera un ejercicio sin importar si está activo o no (para reactivación).
   */
  @Query(value = """
      SELECT * FROM exercises
       WHERE id = :id
      """, nativeQuery = true)
  Optional<Exercise> findByIdIncludingInactive(@Param("id") UUID id);

  /**
   * Recupera todos los ejercicios (activos e inactivos) de un objetivo.
   */
  @Query(value = """
      SELECT * FROM exercises
       WHERE learning_objective_id = :learningObjectiveId
       ORDER BY created_at DESC
      """, nativeQuery = true)
  List<Exercise> findIncludingInactiveByLearningObjectiveId(@Param("learningObjectiveId") UUID learningObjectiveId);

  @Query(value = """
      SELECT * FROM exercises
       WHERE learning_objective_id = :learningObjectiveId
         AND active = false
       ORDER BY created_at DESC
      """, nativeQuery = true)
  List<Exercise> findInactiveByLearningObjectiveId(@Param("learningObjectiveId") UUID learningObjectiveId);

}
