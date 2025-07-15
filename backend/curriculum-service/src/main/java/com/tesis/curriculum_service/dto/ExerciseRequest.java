// src/main/java/com/tesis/curriculum_service/dto/ExerciseRequest.java
package com.tesis.curriculum_service.dto;

import java.util.Map;
import java.util.UUID;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import com.tesis.curriculum_service.dto.TemplateSchema.TemplateType; // ← aquí
import com.tesis.curriculum_service.model.Exercise.Difficulty;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(name = "ExerciseRequest", description = "Datos necesarios para crear o actualizar un ejercicio")
public class ExerciseRequest {

  @Schema(description = "Enunciado completo del ejercicio", example = "Resuelve la ecuación x² - 5x + 6 = 0")
  @NotBlank
  private String statement;

  @Schema(description = "Dificultad del ejercicio", example = "INTERMEDIATE")
  @NotNull
  private Difficulty difficulty;

  @Schema(description = "Tipo de ejercicio (p.ej. CHOICE, OPEN)", example = "OPEN")
  @NotBlank
  private String type;

  @Schema(description = "Tipo de plantilla para generación automática", example = "TBL_MATCH", implementation = TemplateType.class)
  @NotNull
  private TemplateType templateType;

  @Schema(description = "Parámetros JSON para la plantilla", example = "{\"pairs\": [[\"a\",\"1\"],[\"b\",\"2\"]]}")
  @NotNull
  private Map<String, Object> parameters;

  @Schema(description = "ID del objetivo de aprendizaje al que pertenece", example = "3fa85f64-5717-4562-b3fc-2c963f66afa6")
  @NotNull
  private UUID learningObjectiveId;

  @Schema(description = "Respuesta correcta para validar el ejercicio", example = "5")
  private String correctAnswer;
}
