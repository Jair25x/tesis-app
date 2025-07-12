// src/main/java/com/tesis/curriculum_service/repository/ExerciseRepository.java
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
 * Proporciona métodos CRUD y consultas por LearningObjective.
 */
@Repository
public interface ExerciseRepository extends JpaRepository<Exercise, UUID> {

  /**
   * Recupera todos los ejercicios activos de un objetivo de aprendizaje dado.
   *
   * @param learningObjectiveId UUID del objetivo de aprendizaje padre
   * @return Lista de ejercicios activos
   */
  List<Exercise> findByLearningObjectiveId(UUID learningObjectiveId);

  /**
   * Recupera un ejercicio activo por su ID y su objetivo de aprendizaje padre.
   *
   * @param id                  UUID del ejercicio
   * @param learningObjectiveId UUID del objetivo de aprendizaje
   * @return Optional con el ejercicio si existe y está activo
   */
  Optional<Exercise> findByIdAndLearningObjectiveId(UUID id, UUID learningObjectiveId);

  /**
   * Recupera un ejercicio sin filtrar por estado (incluye soft-deleted),
   * para operaciones de reactivación.
   *
   * @param id UUID del ejercicio
   * @return Optional con el ejercicio, esté activo o no
   */
  @Query("SELECT e FROM Exercise e WHERE e.id = :id")
  Optional<Exercise> findByIdIncludingInactive(@Param("id") UUID id);

  /**
   * Recupera todos los ejercicios (activos o inactivos) de un objetivo de
   * aprendizaje,
   * para operaciones de reactivación en cascada.
   *
   * @param learningObjectiveId UUID del objetivo de aprendizaje
   * @return Lista de ejercicios, independientemente de su flag 'active'
   */
  @Query("""
        SELECT e
          FROM Exercise e
         WHERE e.learningObjective.id = :learningObjectiveId
      """)
  List<Exercise> findIncludingInactiveByLearningObjectiveId(
      @Param("learningObjectiveId") UUID learningObjectiveId);
}
