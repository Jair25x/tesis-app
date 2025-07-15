package com.tesis.curriculum_service.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para representar la respuesta del estudiante al resolver un ejercicio.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckAnswerRequest {
  @Schema(description = "Respuesta que ingresó el estudiante", example = "5")
  @NotBlank
  private String studentAnswer;
}