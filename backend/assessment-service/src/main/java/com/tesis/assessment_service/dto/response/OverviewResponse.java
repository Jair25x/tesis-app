package com.tesis.assessment_service.dto.response;

import com.tesis.assessment_service.model.enums.AssignmentScope;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/** Métricas de overview por asignación. */
public record OverviewResponse(
    UUID assignmentId,
    AssignmentScope scope,
    UUID classroomId,
    Integer totalStudents, // null si PUBLIC
    Integer started,
    Integer submitted,
    BigDecimal avgScore, // 0..100 o 0..max? (definirás al implementarlo)
    List<ObjectiveBreakdown> objectiveBreakdown,
    Integer manualPendingCount // opcional: ítems MANUAL pendientes
) {
  public record ObjectiveBreakdown(
      UUID objectiveId,
      double avg, // proporción 0..1 o puntos normalizados; define tu métrica
      int n) {
  }
}
