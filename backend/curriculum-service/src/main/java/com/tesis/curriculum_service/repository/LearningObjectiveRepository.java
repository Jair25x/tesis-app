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

  // ================== Por estándar ==================

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
      @Param("standardId") UUID standardId
  );

  @Query("""
      SELECT lo FROM LearningObjective lo
        JOIN FETCH lo.standard std
        JOIN FETCH std.competency comp
        JOIN FETCH comp.curriculum cur
       WHERE lo.id = :id
      """)
  Optional<LearningObjective> findByIdWithFullHierarchy(@Param("id") UUID id);

  // ================== Listas generales / recientes ==================

  @Query("""
      SELECT lo FROM LearningObjective lo
      ORDER BY lo.createdAt DESC
      """)
  List<LearningObjective> findRecent(org.springframework.data.domain.Pageable pageable);

  default List<LearningObjective> findRecent(int limit) {
    return findRecent(org.springframework.data.domain.PageRequest.of(
        0, Math.max(1, Math.min(limit, 200))));
  }

  // ================== Por grado (JPQL) ==================

  @Query("""
      SELECT lo FROM LearningObjective lo
        JOIN lo.standard s
        JOIN s.competency c
        JOIN c.curriculum cur
      WHERE cur.grade = :grade
      ORDER BY lo.createdAt DESC
      """)
  List<LearningObjective> findTopByGrade(
      @Param("grade") String grade,
      org.springframework.data.domain.Pageable pageable
  );

  default List<LearningObjective> findTopByGrade(String grade, int limit) {
    return findTopByGrade(
        grade,
        org.springframework.data.domain.PageRequest.of(0, Math.max(1, Math.min(limit, 200))));
  }

  @Query("""
      SELECT lo FROM LearningObjective lo
        JOIN lo.standard s
        JOIN s.competency c
        JOIN c.curriculum cur
     WHERE lo.code = :code
       AND lo.active = true
      """)
  Optional<LearningObjective> findActiveByCode(@Param("code") String code);

  @Query("""
      SELECT lo FROM LearningObjective lo
        JOIN lo.standard s
        JOIN s.competency c
        JOIN c.curriculum cur
     WHERE cur.grade = :grade
       AND lo.active = true
      ORDER BY lo.code ASC, lo.createdAt ASC
      """)
  List<LearningObjective> findOrderedByGrade(@Param("grade") String grade);

  // ================== Por grado normalizado (solo dígitos) ==================

  @Query(value = """
      SELECT lo.*
        FROM learning_objectives lo
        JOIN standards s   ON s.id  = lo.standard_id
        JOIN competencies c ON c.id = s.competency_id
        JOIN curricula cur  ON cur.id = c.curriculum_id
       WHERE regexp_replace(cur.grade, '[^0-9]', '', 'g') = :grade
         AND lo.active = true
       ORDER BY lo.code ASC, lo.created_at ASC
      """, nativeQuery = true)
  List<LearningObjective> findOrderedByGradeNormalized(@Param("grade") String grade);
}
