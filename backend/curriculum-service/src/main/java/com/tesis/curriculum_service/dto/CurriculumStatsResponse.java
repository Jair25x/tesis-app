package com.tesis.curriculum_service.dto;

import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO de salida para las estadísticas de un currículo.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(name = "CurriculumStatsResponse", description = "Estadísticas resumidas de un currículo: totales de competencias, estándares y objetivos de aprendizaje")
public class CurriculumStatsResponse {

  @Schema(description = "Identificador único del currículo", example = "3fa85f64-5717-4562-b3fc-2c963f66afa6")
  private UUID curriculumId;

  @Schema(description = "Nombre del currículo", example = "Matemáticas Básicas")
  private String curriculumName;

  @Schema(description = "Número total de competencias definidas en este currículo", example = "5")
  private Long totalCompetencies;

  @Schema(description = "Número total de estándares asociados a las competencias de este currículo", example = "20")
  private Long totalStandards;

  @Schema(description = "Número total de objetivos de aprendizaje bajo estos estándares", example = "100")
  private Long totalLearningObjectives;
}
