package com.tesis.progress_service.service;

import com.tesis.progress_service.client.AvatarClient;
import com.tesis.progress_service.dto.AchievementDto;
import com.tesis.progress_service.dto.AvatarClaimRequest;
import com.tesis.progress_service.dto.DuelEventRequest;
import com.tesis.progress_service.model.Achievement;
import com.tesis.progress_service.model.Attempt;
import com.tesis.progress_service.model.Streak;
import com.tesis.progress_service.model.StudentAchievement;
import com.tesis.progress_service.model.StudentObjectiveProgress;
import com.tesis.progress_service.repository.AchievementRepository;
import com.tesis.progress_service.repository.StudentAchievementRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AchievementService {

  private final AchievementRepository achievementRepository;
  private final StudentAchievementRepository studentAchievementRepository;
  private final AvatarClient avatarClient; // << NUEVO

  /*
   * ===========================
   * Consultas de logros (DTOs)
   * ===========================
   */

  @Transactional(readOnly = true)
  public List<AchievementDto> listForStudent(UUID studentId) {
    return studentAchievementRepository.findAllDtoByStudentIdOrderByEarnedAtDesc(studentId);
  }

  @Cacheable(cacheNames = "achievementCatalog", unless = "#result == null || #result.isEmpty()")
  public List<AchievementDto> getCatalog() {
    Sort sort = Sort.by(Sort.Order.asc("code"), Sort.Order.asc("name"));
    return achievementRepository.findByActiveTrue(sort)
        .stream()
        .map(this::toDtoBasic)
        .toList();
  }

  private AchievementDto toDtoBasic(Achievement a) {
    return AchievementDto.builder()
        .code(a.getCode())
        .name(a.getName())
        .description(a.getDescription())
        .earnedAt(null)
        .build();
  }

  /*
   * ===========================
   * Logros por flujo de intentos
   * ===========================
   */

  @Transactional
  public List<AchievementDto> evaluateAndGrant(UUID studentId,
      Attempt attempt,
      StudentObjectiveProgress sop,
      Streak streak) {
    List<AchievementDto> unlocked = new ArrayList<>();
    List<Achievement> catalog = achievementRepository.findAllByActiveTrue();
    LocalDate today = LocalDate.now();

    for (Achievement a : catalog) {
      if (studentAchievementRepository.existsByStudentIdAndAchievement_Id(studentId, a.getId())) {
        continue;
      }
      boolean earned = switch (a.getCode()) {
        case "FIRST_TRY" -> (sop.getAttemptsCount() != null && sop.getAttemptsCount() == 1) && attempt.isCorrect();
        case "FIVE_IN_ROW" -> (sop.getStreakCorrect() != null && sop.getStreakCorrect() >= 5);
        case "DAILY_STARTER" -> (streak.getLastDay() != null && streak.getLastDay().isEqual(today));
        default -> false;
      };

      if (earned) {
        unlocked.add(grant(studentId, a, Map.of("attemptId", attempt.getId())));
      }
    }
    return unlocked;
  }

  /*
   * ===========================
   * Logros de Duelos (S2S)
   * ===========================
   */

  @Transactional
  public List<AchievementDto> evaluateDuels(UUID matchId,
      UUID winnerId,
      List<DuelEventRequest.RoundResult> rounds) {
    List<AchievementDto> unlocked = new ArrayList<>();
    if (rounds == null)
      rounds = List.of();

    // 1) Primera victoria en duelos
    if (winnerId != null) {
      unlocked.addAll(grantIfEligible(winnerId, "DUEL_FIRST_WIN", Map.of("matchId", matchId)));
    }

    // 2) Respuesta rápida (≤ 5s)
    for (var r : rounds) {
      Map<String, DuelEventRequest.PlayerResult> res = r.getResult();
      if (res == null || res.isEmpty())
        continue;

      for (var e : res.entrySet()) {
        UUID playerId = toUuidSafe(e.getKey());
        if (playerId == null)
          continue;
        var pr = e.getValue();

        boolean correct = (pr != null) && pr.isCorrect();
        Integer t = (pr != null) ? pr.getTimeMs() : null;

        if (correct && t != null && t <= 5000) {
          unlocked.addAll(grantIfEligible(playerId, "DUEL_FAST_ANSWER",
              Map.of("matchId", matchId, "round", r.getRound(), "timeMs", t)));
        }
      }
    }

    // 3) Best-of-3 ganador
    if (winnerId != null && rounds.size() >= 3) {
      unlocked.addAll(grantIfEligible(winnerId, "DUEL_BEST_OF_THREE_WINNER",
          Map.of("matchId", matchId)));
    }
    return unlocked;
  }

  /*
   * ===========================
   * Utilidades de otorgamiento
   * ===========================
   */

  private UUID toUuidSafe(String raw) {
    try {
      return (raw == null || raw.isBlank()) ? null : UUID.fromString(raw);
    } catch (Exception ignored) {
      return null;
    }
  }

  @Transactional
  public List<AchievementDto> grantIfEligible(UUID studentId, String achievementCode, Map<String, Object> meta) {
    var out = new ArrayList<AchievementDto>();
    var achOpt = achievementRepository.findByCodeAndActiveTrue(achievementCode);
    achOpt.ifPresent(a -> {
      boolean hasIt = studentAchievementRepository.existsByStudentIdAndAchievement_Code(studentId, achievementCode);
      if (!hasIt)
        out.add(grant(studentId, a, meta));
    });
    return out;
  }

  /** Otorga, persiste y **dispara** premio en avatar-service (no bloqueante). */
  private AchievementDto grant(UUID studentId, Achievement a, Map<String, Object> meta) {
    var sa = StudentAchievement.builder()
        .studentId(studentId)
        .achievement(a)
        .metadata(meta == null ? Map.of() : meta)
        .build();
    studentAchievementRepository.save(sa);

    // --- Notificar recompensa al avatar-service ---
    try {
      String awardCode = "ACHIEVEMENT:" + a.getCode(); // convención MVP
      avatarClient.claimReward(new AvatarClaimRequest(
          studentId,
          "ACHIEVEMENT",
          awardCode,
          a.getCode(), // triggerCode
          (meta == null || meta.isEmpty()) ? null : meta.toString() // opcional
      ));
      log.info("Premio notificado a avatar-service: student={} awardCode={}", studentId, awardCode);
    } catch (Exception ex) {
      // no romper flujo de logros
      log.error("Error notificando premio a avatar-service: {}", ex.toString());
    }

    return AchievementDto.builder()
        .code(a.getCode())
        .name(a.getName())
        .description(a.getDescription())
        .earnedAt(sa.getEarnedAt())
        .build();
  }
}
