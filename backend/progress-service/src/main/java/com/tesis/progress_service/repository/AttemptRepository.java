package com.tesis.progress_service.repository;

import com.tesis.progress_service.model.Attempt;
import com.tesis.progress_service.model.enums.AttemptSource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.*;

public interface AttemptRepository extends JpaRepository<Attempt, UUID> {

  // Últimos N intentos del estudiante
  List<Attempt> findTop20ByStudentIdOrderByCreatedAtDesc(UUID studentId);

  List<Attempt> findTop50ByStudentIdOrderByCreatedAtDesc(UUID studentId);

  // Últimos intentos por Objetivo
  List<Attempt> findTop20ByStudentIdAndLearningObjectiveIdOrderByCreatedAtDesc(UUID studentId,
      UUID learningObjectiveId);

  // Último intento (para UI rápida)
  Optional<Attempt> findFirstByStudentIdAndLearningObjectiveIdOrderByCreatedAtDesc(UUID studentId,
      UUID learningObjectiveId);

  // Conteos útiles para métricas
  long countByStudentIdAndCreatedAtBetween(UUID studentId, LocalDateTime from, LocalDateTime to);

  long countByStudentIdAndCorrectTrueAndCreatedAtBetween(UUID studentId, LocalDateTime from, LocalDateTime to);

  // Filtrar por source (práctica vs evaluación)
  long countByStudentIdAndSourceAndCreatedAtBetween(UUID studentId, AttemptSource source, LocalDateTime from,
      LocalDateTime to);

  // Accuracy rápida por LO (opcional – ejemplo de agregación)
  @Query("""
      select count(a), sum(case when a.correct = true then 1 else 0 end)
      from Attempt a
      where a.studentId = :studentId and a.learningObjectiveId = :learningObjectiveId
      """)
  Object[] aggregateCountsForObjective(UUID studentId, UUID learningObjectiveId);

  long countByStudentIdAndSourceAndSourceRefIdAndCreatedAtBetween(
      UUID studentId, AttemptSource source, UUID sourceRefId,
      java.time.LocalDateTime from, java.time.LocalDateTime to);

  List<Attempt> findTop50ByStudentIdAndSourceAndSourceRefIdOrderByCreatedAtDesc(
      UUID studentId, AttemptSource source, UUID sourceRefId);

  /** Serie diaria para 1 estudiante (opcional filtrar por curriculumId). */
  @Query(value = """
      SELECT date_trunc('day', a.created_at) AS day,
             COUNT(*) AS attempts,
             SUM(CASE WHEN a.correct THEN 1 ELSE 0 END) AS correct
        FROM attempts a
       WHERE a.student_id = :studentId
         AND a.created_at >= :from
         AND a.created_at < :to
         AND (:curriculumId IS NULL OR a.curriculum_id = :curriculumId)
       GROUP BY day
       ORDER BY day
      """, nativeQuery = true)
  List<Object[]> seriesForStudent(@Param("studentId") UUID studentId,
      @Param("from") LocalDateTime from,
      @Param("to") LocalDateTime to,
      @Param("curriculumId") UUID curriculumId);

  /**
   * Serie diaria agregada para varios estudiantes (opcional filtrar por
   * curriculumId).
   */
  @Query(value = """
      SELECT date_trunc('day', a.created_at) AS day,
             COUNT(*) AS attempts,
             SUM(CASE WHEN a.correct THEN 1 ELSE 0 END) AS correct
        FROM attempts a
       WHERE a.student_id = ANY(:studentIds)
         AND a.created_at >= :from
         AND a.created_at < :to
         AND (:curriculumId IS NULL OR a.curriculum_id = :curriculumId)
       GROUP BY day
       ORDER BY day
      """, nativeQuery = true)
  List<Object[]> seriesForStudents(@Param("studentIds") UUID[] studentIds,
      @Param("from") LocalDateTime from,
      @Param("to") LocalDateTime to,
      @Param("curriculumId") UUID curriculumId);

  /**
   * Agregado diario para un conjunto de estudiantes (posible filtro por
   * currículo).
   * Usamos function('date', ...) para truncar a día (Hibernate->Postgres).
   * Si tu DB no lo soportara, cambiamos a native con DATE(a.created_at).
   */
  @Query("""
      SELECT function('date', a.createdAt) as day,
             COUNT(a) as attempts,
             SUM(CASE WHEN a.correct = TRUE THEN 1 ELSE 0 END) as correct,
             COUNT(DISTINCT a.studentId) as active
        FROM Attempt a
       WHERE a.studentId IN :studentIds
         AND a.createdAt >= :from AND a.createdAt < :to
         AND (:curriculumId IS NULL OR a.curriculumId = :curriculumId)
       GROUP BY function('date', a.createdAt)
       ORDER BY day ASC
      """)
  List<Object[]> aggregateDailyForStudents(
      @Param("studentIds") List<UUID> studentIds,
      @Param("from") LocalDateTime from,
      @Param("to") LocalDateTime to,
      @Param("curriculumId") UUID curriculumId);

}
