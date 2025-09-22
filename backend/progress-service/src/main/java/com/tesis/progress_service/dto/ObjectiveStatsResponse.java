// src/main/java/com/tesis/progress_service/dto/ObjectiveStatsResponse.java
package com.tesis.progress_service.dto;

import lombok.*;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ObjectiveStatsResponse {
  private UUID objectiveId;
  private String status;         // COMPLETED | IN_PROGRESS | NOT_STARTED
  private Integer solvedDistinct;
}
