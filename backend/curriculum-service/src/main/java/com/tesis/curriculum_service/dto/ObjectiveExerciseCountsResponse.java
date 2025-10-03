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
  // keys = objectiveId como String (UUID)
  private Map<String, Integer> counts;
}
