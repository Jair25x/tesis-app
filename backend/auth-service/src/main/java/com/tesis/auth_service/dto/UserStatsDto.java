package com.tesis.auth_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.Map;

@Data
@AllArgsConstructor
public class UserStatsDto {
  private long total;
  private long active;
  private long inactive;
  private Map<String, Long> byRole;
}