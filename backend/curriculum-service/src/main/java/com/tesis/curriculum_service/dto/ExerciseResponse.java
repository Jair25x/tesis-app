package com.tesis.curriculum_service.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.tesis.curriculum_service.dto.TemplateSchema.TemplateType;
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
@Schema(name = "ExerciseResponse", description = "Detalle de un ejercicio incluyendo pasos de solución, pistas y plantilla")
public class ExerciseResponse {

  @Schema(description = "ID único del ejercicio", example = "3fa85f64-5717-4562-b3fc-2c963f66afa6")
  private UUID id;

  @Schema(description = "Enunciado completo del ejercicio", example = "Resuelve la ecuación x² - 5x + 6 = 0")
  private String statement;

  @Schema(description = "Dificultad del ejercicio", example = "INTERMEDIATE")
  private Difficulty difficulty;

  @Schema(description = "Tipo de ejercicio", example = "OPEN")
  private String type;

  @Schema(description = "Tipo de plantilla asignada", example = "TBL_MATCH")
  private TemplateType templateType;

  @Schema(description = "Parámetros usados para la plantilla", example = "{\"pairs\": [[\"a\",\"1\"],[\"b\",\"2\"]]}")
  private Map<String, Object> parameters;

  @Schema(description = "ID del objetivo de aprendizaje asociado")
  private UUID learningObjectiveId;

  @Schema(description = "Nombre del objetivo de aprendizaje asociado")
  private String learningObjectiveName;

  @Schema(description = "ID del estándar asociado")
  private UUID standardId;

  @Schema(description = "Nombre del estándar asociado")
  private String standardName;

  @Schema(description = "ID de la competencia asociada")
  private UUID competencyId;

  @Schema(description = "Nombre de la competencia asociada")
  private String competencyName;

  @Schema(description = "ID del currículo asociado")
  private UUID curriculumId;

  @Schema(description = "Respuesta correcta del ejercicio", example = "4")
  private String correctAnswer;

  @Schema(description = "Pasos de la solución ordenados")
  private List<SolutionStepResponse> solutionSteps;

  @Schema(description = "Pistas disponibles para este ejercicio")
  private List<HintResponse> hints;

  @Schema(description = "Fecha de creación", example = "2025-07-12T15:30:00")
  private LocalDateTime createdAt;

  @Schema(description = "Fecha de última actualización", example = "2025-07-13T12:45:20")
  private LocalDateTime updatedAt;

  @Schema(description = "Indica si el ejercicio está activo")
  private Boolean active;

  @Schema(description = "Indica si el ejercicio forma parte del test diagnóstico", example = "true")
  private Boolean isDiagnostic;
}
