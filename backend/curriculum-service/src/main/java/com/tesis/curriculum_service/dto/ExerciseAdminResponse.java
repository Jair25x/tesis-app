package com.tesis.curriculum_service.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Schema(name = "ExerciseAdminResponse", description = "Detalle de ejercicio con información sensible (solo docentes/admin)")
public class ExerciseAdminResponse extends ExerciseResponse {

  @Schema(description = "Respuesta correcta (información sensible)")
  private String correctAnswer;
}
