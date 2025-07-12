// src/main/java/com/tesis/curriculum_service/dto/CompetencyResponse.java
package com.tesis.curriculum_service.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO de salida que representa una Competency.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(name = "CompetencyResponse", description = "Información detallada de una competencia")
public class CompetencyResponse {

  @Schema(description = "Identificador único de la competencia", example = "5b2d3f74-1234-4a2b-9cde-1a2b3c4d5e6f")
  private UUID id;

  @Schema(description = "Nombre de la competencia", example = "Álgebra Básica")
  private String name;

  @Schema(description = "Descripción detallada de la competencia", example = "Comprender y aplicar las operaciones básicas de álgebra")
  private String description;

  @Schema(description = "Código único de la competencia", example = "COMP-ALG-01")
  private String code;

  @Schema(description = "ID del currículo al que pertenece esta competencia", example = "3fa85f64-5717-4562-b3fc-2c963f66afa6")
  private UUID curriculumId;

  @Schema(description = "Fecha y hora de creación de la competencia", example = "2025-07-11T14:23:30.123")
  private LocalDateTime createdAt;

  @Schema(description = "Fecha y hora de la última actualización", example = "2025-07-12T09:15:45.456")
  private LocalDateTime updatedAt;

  @Schema(description = "Indica si la competencia está activa")
  private Boolean active;
}
