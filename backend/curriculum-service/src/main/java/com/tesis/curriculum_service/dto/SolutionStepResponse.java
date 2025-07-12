// src/main/java/com/tesis/curriculum_service/dto/SolutionStepResponse.java
package com.tesis.curriculum_service.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO de salida que representa un paso de solución de un ejercicio.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(name = "SolutionStepResponse", description = "Un paso de solución de un ejercicio, con su número de orden y explicación")
public class SolutionStepResponse {

  @Schema(description = "ID único del paso", example = "3fa85f64-5717-4562-b3fc-2c963f66afa6")
  private UUID id;

  @Schema(description = "Número del paso dentro de la solución", example = "1")
  private Integer stepNumber;

  @Schema(description = "Texto explicativo de este paso", example = "Factoriza la ecuación en (x−2)(x−3)=0")
  private String explanation;

  @Schema(description = "Fecha y hora de creación del paso", example = "2025-07-12T15:30:00")
  private LocalDateTime createdAt;

  @Schema(description = "Fecha y hora de última actualización del paso", example = "2025-07-13T12:45:20")
  private LocalDateTime updatedAt;

}
