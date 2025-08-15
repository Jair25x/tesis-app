package com.tesis.progress_service.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OverviewDto {
  private int masteredObjectives;
  private int inProgressObjectives;
  private int notStartedObjectives;

  private int dailyAttempts;
  private int dailyCorrect;

  // Puedes ampliar con series, últimas X actividades, etc.
}
