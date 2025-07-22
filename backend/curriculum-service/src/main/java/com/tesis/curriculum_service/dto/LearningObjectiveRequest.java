package com.tesis.curriculum_service.dto;

import jakarta.validation.constraints.NotBlank;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

/**
 * DTO para recibir datos de creación o actualización de un objetivo de
 * aprendizaje.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(name = "LearningObjectiveRequest", description = "Datos necesarios para crear o actualizar un objetivo de aprendizaje")
public class LearningObjectiveRequest {

  @Schema(description = "Nombre o título del objetivo de aprendizaje", example = "Resolver ecuaciones de segundo grado")
  @NotBlank(message = "El nombre no puede estar vacío")
  private String name;

  @Schema(description = "Descripción detallada del objetivo de aprendizaje", example = "Identificar coeficientes y raíces de una ecuación cuadrática")
  @NotBlank(message = "La descripción no puede estar vacía")
  private String description;

  @Schema(description = "Código único del objetivo (p.ej. LO.02.01)", example = "LO.02.01")
  @NotBlank(message = "El código no puede estar vacío")
  private String code;
}
