// src/main/java/com/tesis/progress_service/dto/ObjectiveStatsBatchRequest.java
package com.tesis.progress_service.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ObjectiveStatsBatchRequest {
  @NotNull
  private List<UUID> objectiveIds;
}
