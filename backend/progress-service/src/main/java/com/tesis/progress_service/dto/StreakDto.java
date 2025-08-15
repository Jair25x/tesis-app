package com.tesis.progress_service.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StreakDto {
  private Integer current;
  private Integer longest;
}
