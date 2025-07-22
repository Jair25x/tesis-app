package com.tesis.curriculum_service.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO de salida que representa una Competency con campos de auditoría.
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

  @Schema(description = "Indica si la competencia está activa", example = "true")
  private Boolean active;

  // Auditoría
  @Schema(description = "Usuario que creó esta competencia", example = "admin")
  private String createdBy;

  @Schema(description = "Usuario que la actualizó por última vez", example = "jdocente01")
  private String updatedBy;

  @Schema(description = "Usuario que desactivó esta competencia (si aplica)", example = "admin")
  private String deletedBy;

  @Schema(description = "Fecha de creación", example = "2025-07-11T14:23:30.123")
  private LocalDateTime createdAt;

  @Schema(description = "Fecha de última actualización", example = "2025-07-12T09:15:45.456")
  private LocalDateTime updatedAt;

  @Schema(description = "Fecha de eliminación lógica (si aplica)", example = "2025-07-13T10:00:00.000")
  private LocalDateTime deletedAt;
}
