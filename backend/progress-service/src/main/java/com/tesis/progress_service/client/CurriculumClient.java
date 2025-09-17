// src/main/java/com/tesis/progress_service/client/CurriculumClient.java
package com.tesis.progress_service.client;

import com.tesis.progress_service.dto.CheckResultDto;

import java.util.Collection;
import java.util.Map;
import java.util.UUID;

public interface CurriculumClient {
  CheckResultDto checkAnswer(UUID exerciseId, Map<String, Object> payload);

  /**
   * Devuelve un mapa { objectiveId -> totalExercisesActivos } para los OAs
   * indicados.
   * Idealmente resuelto vía POST /internal/objectives/exercise-counts en
   * curriculum-service.
   * 
   * @param objectiveIds IDs de objetivos
   * @param active       filtrar por ejercicios activos (true por defecto)
   */
  Map<UUID, Integer> getExerciseCountsForObjectives(Collection<UUID> objectiveIds, boolean active);

  default Map<UUID, Integer> getExerciseCountsForObjectives(Collection<UUID> objectiveIds) {
    return getExerciseCountsForObjectives(objectiveIds, true);
  }
}
