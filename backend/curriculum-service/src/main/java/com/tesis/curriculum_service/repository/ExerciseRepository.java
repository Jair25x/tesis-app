// src/main/java/com/tesis/curriculum_service/repository/ExerciseRepository.java
package com.tesis.curriculum_service.repository;

import com.tesis.curriculum_service.model.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
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

  @Query(nativeQuery = true, value = """
        SELECT * FROM exercises
        WHERE is_diagnostic = true AND active = true
      """)
  List<Exercise> findAllByDiagnosticTrueAndActiveTrue();

  /**
   * Filtro por objetivo, activo y dificultad (opcional), orden DESC por created_at, con LIMIT.
   */
  @Query(value = """
      SELECT * FROM exercises
       WHERE learning_objective_id = :objectiveId
         AND active = :active
         AND (:difficulty IS NULL OR difficulty = :difficulty)
       ORDER BY created_at DESC
       LIMIT :limit
      """, nativeQuery = true)
  List<Exercise> findForObjectiveOrderByCreatedDesc(@Param("objectiveId") UUID objectiveId,
                                                    @Param("active") boolean active,
                                                    @Param("difficulty") String difficulty, // BASIC|INTERMEDIATE|ADVANCED o NULL
                                                    @Param("limit") int limit);

  @Query(value = """
      SELECT * FROM exercises
       WHERE learning_objective_id = :objectiveId
         AND active = :active
         AND (:difficulty IS NULL OR difficulty = :difficulty)
       ORDER BY created_at ASC
       LIMIT :limit
      """, nativeQuery = true)
  List<Exercise> findForObjectiveOrderByCreatedAsc(@Param("objectiveId") UUID objectiveId,
                                                   @Param("active") boolean active,
                                                   @Param("difficulty") String difficulty,
                                                   @Param("limit") int limit);

  /**
   * 🔥 Conteo por lote: { objectiveId -> total ejercicios }.
   * Filtra por activos si 'active' no es NULL.
   */
  @Query(value = """
      SELECT learning_objective_id, COUNT(*)::int AS total
        FROM exercises
       WHERE learning_objective_id IN (:objectiveIds)
         AND (:active IS NULL OR active = :active)
       GROUP BY learning_objective_id
      """, nativeQuery = true)
  List<Object[]> countByObjectiveIds(@Param("objectiveIds") Collection<UUID> objectiveIds,
                                     @Param("active") Boolean active);
}
