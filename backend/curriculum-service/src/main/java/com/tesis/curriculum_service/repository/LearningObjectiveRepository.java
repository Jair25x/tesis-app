package com.tesis.curriculum_service.repository;

import com.tesis.curriculum_service.model.LearningObjective;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LearningObjectiveRepository extends JpaRepository<LearningObjective, UUID> {

  @Query(value = """
        SELECT * FROM learning_objectives
         WHERE standard_id = :standardId
           AND active = true
         ORDER BY created_at DESC
      """, nativeQuery = true)
  List<LearningObjective> findActiveByStandardId(@Param("standardId") UUID standardId);

  @Query(value = """
        SELECT * FROM learning_objectives
         WHERE standard_id = :standardId
           AND active = false
         ORDER BY created_at DESC
      """, nativeQuery = true)
  List<LearningObjective> findInactiveByStandardId(@Param("standardId") UUID standardId);

  @Query(value = """
        SELECT * FROM learning_objectives
         WHERE standard_id = :standardId
         ORDER BY created_at DESC
      """, nativeQuery = true)
  List<LearningObjective> findAllByStandardIdIncludingInactive(@Param("standardId") UUID standardId);

  Optional<LearningObjective> findByIdAndStandardId(UUID id, UUID standardId);

  @Query(value = """
        SELECT * FROM learning_objectives
         WHERE id = :id
           AND standard_id = :standardId
      """, nativeQuery = true)
  Optional<LearningObjective> findIncludingInactiveByIdAndStandardId(
      @Param("id") UUID id,
      @Param("standardId") UUID standardId);

  @Query("""
        SELECT lo FROM LearningObjective lo
          JOIN FETCH lo.standard std
          JOIN FETCH std.competency comp
          JOIN FETCH comp.curriculum cur
         WHERE lo.id = :id
      """)
  Optional<LearningObjective> findByIdWithFullHierarchy(@Param("id") UUID id);
}
