// src/main/java/com/tesis/curriculum_service/dto/ObjectiveExerciseCountsResponse.java
package com.tesis.curriculum_service.dto;

import lombok.*;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ObjectiveExerciseCountsResponse {
  private Map<String, Integer> counts; // keys como String (UUID string)
}