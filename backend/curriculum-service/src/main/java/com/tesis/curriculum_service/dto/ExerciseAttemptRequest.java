package com.tesis.curriculum_service.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.*;

import java.util.UUID;

/**
 * DTO que representa el intento de un estudiante al resolver un ejercicio.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Datos enviados por el estudiante al intentar un ejercicio")
public class ExerciseAttemptRequest {

  @NotNull
  @Schema(description = "UUID del ejercicio al que pertenece el intento", example = "f3c1a8d2-5cfa-4f22-bbb6-3b8d3e0e2abc", required = true)
  private UUID exerciseId;

  @Schema(description = "Indica si la respuesta fue correcta o no", example = "true", required = true)
  private boolean correct;

  @Min(0)
  @Max(10)
  @Schema(description = "Cantidad de pistas utilizadas en el intento", example = "2")
  private int hintsUsed;

  @Min(0)
  @Schema(description = "Tiempo invertido en el ejercicio (en milisegundos)", example = "12000")
  private long timeSpent;

  @Size(max = 1000)
  @Schema(description = "Respuesta enviada por el estudiante", example = "35")
  private String submittedAnswer;
}
