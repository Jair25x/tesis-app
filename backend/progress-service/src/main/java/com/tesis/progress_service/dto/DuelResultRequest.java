package com.tesis.progress_service.dto;

import lombok.Data;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
public class DuelResultRequest {
  private UUID matchId;

  // configuración del duelo
  private String mode;              // "bestOf" | "timePerQuestion" | "firstToAll"
  private Integer bestOf;
  private Integer maxPlayers;
  private Integer questionTimeSec;  // para timePerQuestion
  private Integer winTarget;        // para firstToAll

  // resultado global
  private UUID winnerId;            // puede ser null (empate)
  private Map<String, Integer> score; // userId -> puntos

  // timeline
  private List<RoundItem> byRound;  // equivalente a 'rounds' pero con info adicional
  private OffsetDateTime finishedAt; // opcional (si duels lo envía)

  @Data
  public static class RoundItem {
    private int round;
    private UUID exerciseId;
    private UUID winnerId; // puede ser null si empate
    private Map<String, PlayerResult> result; // { userId -> {correct, timeMs} }
    // opcionales, por si decides enviarlos después:
    // private Long deadlineEpochMs;
    // private Long startedEpochMs;
  }

  @Data
  public static class PlayerResult {
    private boolean correct;
    private Integer timeMs; // null si no respondió
  }
}
