package com.tesis.curriculum_service.dto;

import jakarta.validation.constraints.NotBlank;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(name = "LearningObjectiveRequest", description = "Datos necesarios para crear o actualizar un objetivo de aprendizaje")
public class LearningObjectiveRequest {

  @Schema(description = "Nombre o título del objetivo de aprendizaje", example = "Resolver ecuaciones de segundo grado")
  @NotBlank
  private String name;

  @Schema(description = "Descripción detallada del objetivo de aprendizaje", example = "Identificar coeficientes y raíces de una ecuación cuadrática")
  @NotBlank
  private String description;

  @Schema(description = "Código único del objetivo (p.ej. LO.02.01)", example = "LO.02.01")
  @NotBlank
  private String code;
}
