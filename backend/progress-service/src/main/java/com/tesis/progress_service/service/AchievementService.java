// src/main/java/com/tesis/progress_service/service/AchievementService.java
package com.tesis.progress_service.service;

import com.tesis.progress_service.dto.AchievementDto;
import com.tesis.progress_service.model.*;
import com.tesis.progress_service.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AchievementService {

  private final AchievementRepository achievementRepository;
  private final StudentAchievementRepository studentAchievementRepository;

  public List<AchievementDto> listForStudent(UUID studentId) {
    List<StudentAchievement> list = studentAchievementRepository.findAllByStudentIdOrderByEarnedAtDesc(studentId);
    List<AchievementDto> out = new ArrayList<>(list.size());
    for (var sa : list) {
      var a = sa.getAchievement();
      out.add(AchievementDto.builder()
          .code(a.getCode())
          .name(a.getName())
          .description(a.getDescription())
          .earnedAt(sa.getEarnedAt())
          .build());
    }
    return out;
  }

  public List<AchievementDto> evaluateAndGrant(UUID studentId,
      Attempt attempt,
      StudentObjectiveProgress sop,
      Streak streak) {
    List<AchievementDto> unlocked = new ArrayList<>();

    List<Achievement> catalog = achievementRepository.findAllByActiveTrue();
    LocalDate today = LocalDate.now();

    for (Achievement a : catalog) {
      if (studentAchievementRepository.existsByStudentIdAndAchievement_Id(studentId, a.getId())) {
        continue; // ya otorgado
      }
      boolean earned = switch (a.getCode()) {
        case "FIRST_TRY" -> (sop.getAttemptsCount() != null && sop.getAttemptsCount() == 1) && attempt.isCorrect();
        case "FIVE_IN_ROW" -> (sop.getStreakCorrect() != null && sop.getStreakCorrect() >= 5);
        case "DAILY_STARTER" -> (streak.getLastDay() != null && streak.getLastDay().isEqual(today));
        default -> false;
      };

      if (earned) {
        StudentAchievement sa = StudentAchievement.builder()
            .studentId(studentId)
            .achievement(a)
            .earnedAt(attempt.getCreatedAt())
            .build();
        studentAchievementRepository.save(sa);

        unlocked.add(AchievementDto.builder()
            .code(a.getCode())
            .name(a.getName())
            .description(a.getDescription())
            .earnedAt(sa.getEarnedAt())
            .build());
      }
    }
    return unlocked;
  }
}
