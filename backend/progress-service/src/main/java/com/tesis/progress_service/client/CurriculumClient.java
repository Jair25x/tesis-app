// src/main/java/com/tesis/progress_service/client/CurriculumClient.java
package com.tesis.progress_service.client;

import com.tesis.progress_service.dto.CheckResultDto;
import com.tesis.progress_service.dto.ExerciseMetaDto;

import java.util.Collection;
import java.util.Map;
import java.util.UUID;

public interface CurriculumClient {
  CheckResultDto checkAnswer(UUID exerciseId, Map<String, Object> payload);

  Map<UUID, Integer> getExerciseCountsForObjectives(Collection<UUID> objectiveIds, boolean active);

  default Map<UUID, Integer> getExerciseCountsForObjectives(Collection<UUID> objectiveIds) {
    return getExerciseCountsForObjectives(objectiveIds, true);
  }

  ExerciseMetaDto getExerciseMeta(UUID exerciseId);
}
