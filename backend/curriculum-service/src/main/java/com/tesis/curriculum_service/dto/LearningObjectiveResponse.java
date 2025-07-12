// src/main/java/com/tesis/curriculum_service/dto/LearningObjectiveResponse.java
package com.tesis.curriculum_service.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(name = "LearningObjectiveResponse", description = "Información detallada de un objetivo de aprendizaje")
public class LearningObjectiveResponse {

  @Schema(description = "Identificador único del objetivo", example = "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d")
  private UUID id;

  @Schema(description = "Nombre o título del objetivo de aprendizaje", example = "Resolver ecuaciones de segundo grado")
  private String name;

  @Schema(description = "Descripción detallada del objetivo de aprendizaje", example = "Identificar coeficientes y raíces de una ecuación cuadrática")
  private String description;

  @Schema(description = "Código único del objetivo (p.ej. LO.02.01)", example = "LO.02.01")
  private String code;

  @Schema(description = "ID del estándar al que pertenece este objetivo", example = "9f7e6d5c-4b3a-21f0-9e8d-7c6b5a4f3e2d")
  private UUID standardId;

  @Schema(description = "Fecha y hora de creación del objetivo", example = "2025-07-12T15:30:00.000")
  private LocalDateTime createdAt;

  @Schema(description = "Fecha y hora de la última actualización del objetivo", example = "2025-07-13T12:45:20.000")
  private LocalDateTime updatedAt;

  @Schema(description = "Indica si el Objetivo de aprendizaje está activo")
  private Boolean active;
}
