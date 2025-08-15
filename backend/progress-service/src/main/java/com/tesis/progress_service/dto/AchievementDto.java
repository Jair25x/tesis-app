package com.tesis.progress_service.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AchievementDto {
  private String code;
  private String name;
  private String description;
  private LocalDateTime earnedAt;
}
