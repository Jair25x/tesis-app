package com.tesis.curriculum_service.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.tesis.curriculum_service.dto.TemplateSchema.TemplateType;
import com.tesis.curriculum_service.model.Exercise.Difficulty;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Schema(name = "ExerciseResponse", description = "Detalle de ejercicio para consumo del estudiante")
public class ExerciseResponse {
  private UUID id;
  private String statement;

  /** HTML listo para pintar; para FE usar preferentemente este campo. */
  private String statementRendered;

  private Difficulty difficulty;
  private String type;
  private TemplateType templateType;
  private Map<String, Object> parameters;

  private UUID learningObjectiveId;
  private String learningObjectiveName;
  private UUID standardId;
  private String standardName;
  private UUID competencyId;
  private String competencyName;
  private UUID curriculumId;

  private List<SolutionStepResponse> solutionSteps;
  private List<HintResponse> hints;

  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
  private Boolean active;
  private Boolean isDiagnostic;

  /** Indica si el backend ocultó hints/steps por modo examen. */
  private Boolean examMode;
}
