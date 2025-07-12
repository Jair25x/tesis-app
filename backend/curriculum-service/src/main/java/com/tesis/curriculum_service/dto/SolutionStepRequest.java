package com.tesis.curriculum_service.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para crear o actualizar un paso de solución de un ejercicio.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(name = "SolutionStepRequest", description = "Datos necesarios para crear o modificar un paso de solución")
public class SolutionStepRequest {

  @Schema(description = "Número de orden del paso en la solución", example = "1", required = true)
  @NotNull
  @Min(1)
  private Integer stepNumber;

  @Schema(description = "Texto explicativo de este paso", example = "Factoriza la ecuación en (x−2)(x−3)=0", required = true)
  @NotNull
  private String explanation;
}
