package com.tesis.curriculum_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para la respuesta de estadísticas del currículo.
 * Contiene métricas generales sobre los currículos.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CurriculumStatsResponse {
  private long totalCurriculums;
  private long totalCompetencies;
  private long totalStandards;
  private long totalLearningObjectives;
  // Puedes añadir más campos relevantes aquí, por ejemplo:
  // private String mostCoveredGrade;
  // private String lastUpdatedCurriculumId;
  // private String lastUpdatedCurriculumName;
}
