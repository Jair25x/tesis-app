// src/main/java/com/tesis/progress_service/service/ProgressQueryService.java
package com.tesis.progress_service.service;

import com.tesis.progress_service.dto.OverviewDto;
import com.tesis.progress_service.dto.StreakDto;
import com.tesis.progress_service.dto.StudentOverviewDto;
import com.tesis.progress_service.model.Streak;
import com.tesis.progress_service.model.StudentObjectiveProgress;
import com.tesis.progress_service.model.enums.ProgressStatus;
import com.tesis.progress_service.repository.AttemptRepository;
import com.tesis.progress_service.repository.StreakRepository;
import com.tesis.progress_service.repository.StudentObjectiveProgressRepository;
import com.tesis.progress_service.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProgressQueryService {

  private final StudentObjectiveProgressRepository sopRepository;
  private final AttemptRepository attemptRepository;
  private final StreakRepository streakRepository;

  /** “Me/overview” para un currículo concreto (lo usabas ya). */
  public OverviewDto getOverview(UUID curriculumId) {
    UUID studentId = SecurityUtils.getCurrentUserIdOrThrow();
    return computeOverviewFor(studentId, curriculumId);
  }

  /** Nuevo: overview para un alumno específico (docente/admin). */
  public OverviewDto getOverviewForStudent(UUID studentId, UUID curriculumId) {
    return computeOverviewFor(studentId, curriculumId);
  }

  /** Nuevo: overview para varios alumnos (docente/admin). */
  public List<StudentOverviewDto> getOverviewForStudents(List<UUID> studentIds, UUID curriculumId) {
    if (studentIds == null || studentIds.isEmpty())
      return List.of();
    return studentIds.stream()
        .map(id -> StudentOverviewDto.builder()
            .studentId(id)
            .overview(computeOverviewFor(id, curriculumId))
            .build())
        .toList();
  }

  /** Racha del estudiante (solo current/longest). */
  public StreakDto getStreak(UUID studentId) {
    Streak s = streakRepository.findByStudentId(studentId)
        .orElseGet(() -> Streak.builder().studentId(studentId).current(0).longest(0).build());
    return StreakDto.builder()
        .current(s.getCurrent() == null ? 0 : s.getCurrent())
        .longest(s.getLongest() == null ? 0 : s.getLongest())
        .build();
  }

  // ------------------------------------
  // Helpers
  // ------------------------------------
  private OverviewDto computeOverviewFor(UUID studentId, UUID curriculumId) {
    List<StudentObjectiveProgress> list = (curriculumId != null)
        ? sopRepository.findAllByStudentIdAndCurriculumId(studentId, curriculumId)
        : sopRepository.findAllByStudentId(studentId);

    int mastered = (int) list.stream().filter(s -> s.getStatus() == ProgressStatus.MASTERED).count();
    int inProgress = (int) list.stream().filter(s -> s.getStatus() == ProgressStatus.IN_PROGRESS).count();
    int notStarted = (int) list.stream().filter(s -> s.getStatus() == ProgressStatus.NOT_STARTED).count();

    var today = java.time.LocalDate.now();
    var from = today.atStartOfDay();
    var to = today.plusDays(1).atStartOfDay();

    // Nota: estos contadores diarios son globales del alumno (no por currículo).
    int dailyAttempts = (int) attemptRepository.countByStudentIdAndCreatedAtBetween(studentId, from, to);
    int dailyCorrect = (int) attemptRepository.countByStudentIdAndCorrectTrueAndCreatedAtBetween(studentId, from, to);

    return OverviewDto.builder()
        .masteredObjectives(mastered)
        .inProgressObjectives(inProgress)
        .notStartedObjectives(notStarted)
        .dailyAttempts(dailyAttempts)
        .dailyCorrect(dailyCorrect)
        .build();
  }
}
