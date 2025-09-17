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
  private Boolean active; // true por defecto en controller si es null
}