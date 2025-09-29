// src/main/java/com/tesis/progress_service/dto/DuelEventRequest.java
package com.tesis.progress_service.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
public class DuelEventRequest {
  private UUID matchId;
  private UUID winnerId; // puede ser null si empate
  private List<RoundResult> rounds;

  @Data
  public static class RoundResult {
    private int round;
    private UUID exerciseId;
    private Map<String, PlayerResult> result; // { studentId -> {correct,timeMs} }
    private UUID winnerId;
  }

  @Data
  public static class PlayerResult {
    private boolean correct;
    private Integer timeMs;
  }
}
