// src/main/java/com/tesis/curriculum_service/dto/ObjectiveExerciseCountsRequest.java
package com.tesis.curriculum_service.dto;

import lombok.*;

import java.util.Collection;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ObjectiveExerciseCountsRequest {
  private Collection<UUID> ids;
  /**
   * Si es null, no se filtra por activo. El controller lo normaliza a true por
   * defecto.
   */
  private Boolean active;
  /**
   * Filtro opcional por dificultad (valores esperados en BD):
   * BASIC | INTERMEDIATE | ADVANCED
   * (El controller acepta también EASY|MEDIUM|HARD y lo normaliza)
   */
  private String difficulty;
}
