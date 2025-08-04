// src/main/java/com/tesis/curriculum_service/dto/CurriculumFullResponse.java
package com.tesis.curriculum_service.dto;

import lombok.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CurriculumFullResponse {
  private UUID id;
  private String code;
  private String name;
  private String description;
  private String grade;
  private List<CompetencyNode> competencies;

  @Data
  @Builder
  @AllArgsConstructor
  @NoArgsConstructor
  public static class CompetencyNode {
    private UUID id;
    private String code;
    private String name;
    private List<StandardNode> standards;
  }

  @Data
  @Builder
  @AllArgsConstructor
  @NoArgsConstructor
  public static class StandardNode {
    private UUID id;
    private String code;
    private String name;
    private List<LearningObjectiveNode> learningObjectives;
  }

  @Data
  @Builder
  @AllArgsConstructor
  @NoArgsConstructor
  public static class LearningObjectiveNode {
    private UUID id;
    private String code;
    private String name;
    private List<ExerciseLeaf> exercises;
  }

  @Data
  @Builder
  @AllArgsConstructor
  @NoArgsConstructor
  public static class ExerciseLeaf {
    private UUID id;
    private String statement;
    private String difficulty;
    private String type;
    private String templateType;
    private Map<String, Object> parameters;
    private String correctAnswer;
    private List<HintNode> hints;
    private List<SolutionStepNode> solutionSteps;
  }

  @Data
  @Builder
  @AllArgsConstructor
  @NoArgsConstructor
  public static class HintNode {
    private UUID id;
    private String hintText;
    private int cost;
  }

  @Data
  @Builder
  @AllArgsConstructor
  @NoArgsConstructor
  public static class SolutionStepNode {
    private UUID id;
    private int stepNumber;
    private String explanation;
  }
}
