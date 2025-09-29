// src/main/java/com/tesis/progress_service/controller/InternalDuelsController.java
package com.tesis.progress_service.controller;

import com.tesis.progress_service.dto.AchievementDto;
import com.tesis.progress_service.dto.DuelEventRequest;
import com.tesis.progress_service.dto.DuelResultRequest;
import com.tesis.progress_service.service.AchievementService;
import io.swagger.v3.oas.annotations.Hidden;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@Hidden
@RestController
@RequestMapping("/internal/progress/duels")
@RequiredArgsConstructor
public class InternalDuelsController {
  private static final Logger log = LoggerFactory.getLogger(InternalDuelsController.class);

  private final AchievementService achievementService;

  // === Endpoint existente (compat) ===
  @PreAuthorize("hasRole('INTERNAL')")
  @PostMapping("/events")
  public ResponseEntity<Map<String, Object>> onDuelEvent(@RequestBody DuelEventRequest req) {
    log.info("DUEL EVENT (legacy) matchId={} winnerId={} rounds={}",
        req.getMatchId(), req.getWinnerId(), (req.getRounds() == null ? 0 : req.getRounds().size()));

    List<AchievementDto> unlocked = achievementService
        .evaluateDuels(req.getMatchId(), req.getWinnerId(), req.getRounds());

    return ResponseEntity.ok(Map.of("unlocked", unlocked));
  }

  // === NUEVO endpoint "rico" ===
  @PreAuthorize("hasRole('INTERNAL')")
  @PostMapping("/result")
  public ResponseEntity<Map<String, Object>> onDuelResult(@RequestBody DuelResultRequest req) {
    int rounds = (req.getByRound() == null ? 0 : req.getByRound().size());
    log.info("DUEL RESULT matchId={} winnerId={} mode={} bestOf={} maxPlayers={} rounds={} score={}",
        req.getMatchId(), req.getWinnerId(), req.getMode(), req.getBestOf(), req.getMaxPlayers(),
        rounds, (req.getScore() == null ? "{}" : req.getScore().toString()));

    // Mapeamos a la estructura que ya consume AchievementService:
    DuelEventRequest minimal = new DuelEventRequest();
    minimal.setMatchId(req.getMatchId());
    minimal.setWinnerId(req.getWinnerId());
    minimal.setRounds(mapRounds(req.getByRound()));

    List<AchievementDto> unlocked = achievementService
        .evaluateDuels(minimal.getMatchId(), minimal.getWinnerId(), minimal.getRounds());

    return ResponseEntity.ok(Map.of(
        "unlocked", unlocked,
        "acceptedMode", req.getMode(),
        "acceptedBestOf", req.getBestOf(),
        "acceptedMaxPlayers", req.getMaxPlayers()
    ));
  }

  private List<DuelEventRequest.RoundResult> mapRounds(List<DuelResultRequest.RoundItem> items) {
    if (items == null || items.isEmpty()) return List.of();
    List<DuelEventRequest.RoundResult> out = new ArrayList<>(items.size());
    for (DuelResultRequest.RoundItem src : items) {
      DuelEventRequest.RoundResult dst = new DuelEventRequest.RoundResult();
      dst.setRound(src.getRound());
      dst.setExerciseId(src.getExerciseId());
      dst.setWinnerId(src.getWinnerId());

      // map { userId -> {correct,timeMs} }  (tipos compatibles)
      Map<String, DuelEventRequest.PlayerResult> result = new HashMap<>();
      if (src.getResult() != null) {
        for (Map.Entry<String, DuelResultRequest.PlayerResult> e : src.getResult().entrySet()) {
          DuelEventRequest.PlayerResult pr = new DuelEventRequest.PlayerResult();
          pr.setCorrect(e.getValue().isCorrect());
          pr.setTimeMs(e.getValue().getTimeMs());
          result.put(e.getKey(), pr);
        }
      }
      dst.setResult(result);

      out.add(dst);
    }
    return out;
  }
}
