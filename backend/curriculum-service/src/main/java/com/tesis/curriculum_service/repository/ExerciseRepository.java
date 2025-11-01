// curriculum-service/src/main/java/com/tesis/curriculum_service/repository/ExerciseRepository.java
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

@Repository
public interface ExerciseRepository extends JpaRepository<Exercise, UUID> {

  @Query(value = """
      SELECT * FROM exercises
       WHERE learning_objective_id = :learningObjectiveId
         AND active = true
       ORDER BY created_at DESC
      """, nativeQuery = true)
  List<Exercise> findByLearningObjectiveId(@Param("learningObjectiveId") UUID learningObjectiveId);

  @Query(value = """
      SELECT * FROM exercises
       WHERE id = :id
         AND learning_objective_id = :learningObjectiveId
         AND active = true
      """, nativeQuery = true)
  Optional<Exercise> findByIdAndLearningObjectiveId(@Param("id") UUID id,
      @Param("learningObjectiveId") UUID learningObjectiveId);

  @Query(value = """
      SELECT * FROM exercises
       WHERE id = :id
      """, nativeQuery = true)
  Optional<Exercise> findByIdIncludingInactive(@Param("id") UUID id);

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

  // Listados por objetivo con/ sin dificultad (para picks)
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
      @Param("difficulty") String difficulty,
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

  // Conteo batch SIN dificultad (legacy)
  @Query(value = """
      SELECT learning_objective_id, COUNT(*)::int AS total
        FROM exercises
       WHERE learning_objective_id IN (:objectiveIds)
         AND (:active IS NULL OR active = :active)
       GROUP BY learning_objective_id
      """, nativeQuery = true)
  List<Object[]> countByObjectiveIds(@Param("objectiveIds") Collection<UUID> objectiveIds,
      @Param("active") Boolean active);

  // ✅ Conteo batch CON dificultad
  @Query(value = """
      SELECT learning_objective_id, COUNT(*)::int AS total
        FROM exercises
       WHERE learning_objective_id IN (:objectiveIds)
         AND (:active IS NULL OR active = :active)
         AND (:difficulty IS NULL OR difficulty = :difficulty)
       GROUP BY learning_objective_id
      """, nativeQuery = true)
  List<Object[]> countByObjectiveIdsWithFilters(@Param("objectiveIds") Collection<UUID> objectiveIds,
      @Param("active") Boolean active,
      @Param("difficulty") String difficulty);

  interface ExStatusRow {
    UUID getId();

    Boolean getActive();

    String getDifficulty(); // BASIC|INTERMEDIATE|ADVANCED|null

    UUID getLearningObjectiveId();

    java.time.LocalDateTime getCreatedAt();

    default String getDifficultyUi() {
      String d = getDifficulty();
      if (d == null)
        return null;
      return switch (d.toUpperCase()) {
        case "BASIC" -> "EASY";
        case "INTERMEDIATE" -> "MEDIUM";
        case "ADVANCED" -> "HARD";
        default -> null;
      };
    }
  }

  @Query(value = """
      SELECT e.id as id, e.active as active, e.difficulty as difficulty,
             e.learning_objective_id as learningObjectiveId, e.created_at as createdAt
        FROM exercises e
       WHERE e.id IN (:ids)
      """, nativeQuery = true)
  List<ExStatusRow> findStatusByIds(@Param("ids") List<UUID> ids);

  @Query(value = """
      SELECT e.id as id, e.active as active, e.difficulty as difficulty,
             e.learning_objective_id as learningObjectiveId, e.created_at as createdAt
        FROM exercises e
       WHERE e.learning_objective_id = :objectiveId
         AND e.id IN (:ids)
      """, nativeQuery = true)
  List<ExStatusRow> findStatusByObjectiveAndIds(@Param("objectiveId") UUID objectiveId,
      @Param("ids") List<UUID> ids);
}
