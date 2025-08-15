package com.tesis.progress_service.repository;

import com.tesis.progress_service.model.Attempt;
import com.tesis.progress_service.model.enums.AttemptSource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

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

}
