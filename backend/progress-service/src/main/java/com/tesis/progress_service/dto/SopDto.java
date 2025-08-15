package com.tesis.progress_service.dto;

import com.tesis.progress_service.model.enums.MasteryLevel;
import com.tesis.progress_service.model.enums.ProgressStatus;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SopDto {
  private UUID learningObjectiveId;
  private Integer attemptsCount;
  private Integer correctCount;
  private Integer streakCorrect;
  private BigDecimal accuracy; // 0..1
  private ProgressStatus status; // NOT_STARTED, IN_PROGRESS, MASTERED
  private MasteryLevel masteryLevel; // PRACTICING, PROFICIENT, MASTERED
}
