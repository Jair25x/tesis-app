// src/main/java/com/tesis/curriculum_service/dto/CurriculumFullResponse.java
package com.tesis.curriculum_service.dto;

import lombok.*;

import java.util.List;
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
  }
}
