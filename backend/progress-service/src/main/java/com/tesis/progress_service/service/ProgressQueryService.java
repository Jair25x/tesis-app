// src/main/java/com/tesis/progress_service/service/ProgressQueryService.java
package com.tesis.progress_service.service;

import com.tesis.progress_service.client.CurriculumClient;
import com.tesis.progress_service.dto.DailyStatDto;
import com.tesis.progress_service.dto.ObjectiveCoverageDto;
import com.tesis.progress_service.dto.ObjectiveStatusDto;
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
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Consultas de progreso/series para vistas de estudiante y docente.
 * - Series por estudiante: attempts/correct por día (activeStudents = null).
 * - Series por aula: agregado attempts/correct y distinct students
 * (activeStudents).
 * - Overview(s): contadores por estado + métricas del día.
 */
@Service
@RequiredArgsConstructor
public class ProgressQueryService {

  private final StudentObjectiveProgressRepository sopRepository;
  private final AttemptRepository attemptRepository;
  private final StreakRepository streakRepository;
  private final CurriculumClient curriculumClient; // ⬅️ NUEVO

  // ===========================================================================
  // RANGO DE FECHAS (DIARIO)
  // ===========================================================================
  public static final class DateRange {
    private final LocalDate startInclusive;
    private final LocalDate endExclusive;

    public DateRange(LocalDate startInclusive, LocalDate endExclusive) {
      this.startInclusive = startInclusive;
      this.endExclusive = endExclusive;
    }

    public static DateRange of(String range) {
      String r = (range == null || range.isBlank()) ? "7d" : range.trim().toLowerCase(java.util.Locale.ROOT);
      java.time.LocalDate today = java.time.LocalDate.now(); // idealmente UTC

      switch (r) {
        case "today":
        case "1d":
          return new DateRange(today, today.plusDays(1));
        case "14d":
          // 14 puntos incluyendo hoy: [today-13, today+1)
          return new DateRange(today.minusDays(13), today.plusDays(1));
        case "7d":
        default:
          // 7 puntos incluyendo hoy: [today-6, today+1)
          return new DateRange(today.minusDays(6), today.plusDays(1));
      }
    }

    public LocalDateTime from() {
      return startInclusive.atStartOfDay();
    }

    public LocalDateTime to() {
      return endExclusive.atStartOfDay();
    }

    /** Días [start, end) densos para rellenar ceros. */
    public List<LocalDate> days() {
      List<LocalDate> out = new ArrayList<>();
      for (LocalDate d = startInclusive; d.isBefore(endExclusive); d = d.plusDays(1))
        out.add(d);
      return out;
    }
  }

  // ===========================================================================
  // NUEVO: Estados por objetivo (para FE Roadmap)
  // ===========================================================================
  /**
   * Estados por objetivo del alumno autenticado. Si curriculumId es null, trae
   * todos.
   */
  public List<ObjectiveStatusDto> getMyObjectiveStatuses(@Nullable UUID curriculumId) {
    final UUID studentId = SecurityUtils.getCurrentUserIdOrThrow();

    final List<StudentObjectiveProgress> rows = (curriculumId == null)
        ? sopRepository.findAllByStudentId(studentId)
        : sopRepository.findAllByStudentIdAndCurriculumId(studentId, curriculumId);

    return rows.stream()
        .map(row -> new ObjectiveStatusDto(
            row.getLearningObjectiveId().toString(),
            mapStatus(row.getStatus())))
        .toList();
  }

  /** Mapea el enum interno a string estable para el FE. */
  private static String mapStatus(ProgressStatus st) {
    if (st == null)
      return "IN_PROGRESS";
    return switch (st) {
      case MASTERED -> "COMPLETED";
      case IN_PROGRESS -> "IN_PROGRESS";
      case NOT_STARTED -> "NOT_STARTED";
      default -> "IN_PROGRESS";
    };
  }

  // ===========================================================================
  // NUEVO: Cobertura por objetivo (ejercicios correctos distintos / total)
  // ===========================================================================
  public List<ObjectiveCoverageDto> getObjectiveCoverage(UUID studentId, @Nullable UUID curriculumId) {
    // 1) Distintos correctos por OA
    List<Object[]> rows = attemptRepository.distinctCorrectByObjective(studentId, curriculumId);
    Map<UUID, Integer> solvedByObjective = new HashMap<>();
    for (Object[] r : rows) {
      UUID objectiveId = (UUID) r[0];
      int solved = (r[1] instanceof Number) ? ((Number) r[1]).intValue() : Integer.parseInt(String.valueOf(r[1]));
      solvedByObjective.put(objectiveId, solved);
    }

    // 2) Universo de OAs (limitado por curriculumId si aplica)
    List<StudentObjectiveProgress> sops = (curriculumId != null)
        ? sopRepository.findAllByStudentIdAndCurriculumId(studentId, curriculumId)
        : sopRepository.findAllByStudentId(studentId);

    Set<UUID> objectiveIds = sops.stream()
        .map(StudentObjectiveProgress::getLearningObjectiveId)
        .collect(Collectors.toSet());
    if (objectiveIds.isEmpty())
      return List.of();

    // 3) Totales por OA (curriculum-service, batch)
    Map<UUID, Integer> totals = curriculumClient.getExerciseCountsForObjectives(objectiveIds, true);

    // 4) Armar DTOs
    List<ObjectiveCoverageDto> out = new ArrayList<>();
    for (UUID oid : objectiveIds) {
      int solved = solvedByObjective.getOrDefault(oid, 0);
      int total = totals.getOrDefault(oid, 0);
      out.add(ObjectiveCoverageDto.builder()
          .objectiveId(oid)
          .solvedDistinct(solved)
          .totalExercises(total)
          .build());
    }
    return out;
  }

  // ===========================================================================
  // OVERVIEW(S)
  // ===========================================================================
  public OverviewDto getOverview(@Nullable UUID curriculumId) {
    UUID studentId = SecurityUtils.getCurrentUserIdOrThrow();
    return computeOverviewFor(studentId, curriculumId);
  }

  public OverviewDto getOverviewForStudent(UUID studentId, @Nullable UUID curriculumId) {
    return computeOverviewFor(studentId, curriculumId);
  }

  public List<StudentOverviewDto> getOverviewForStudents(List<UUID> studentIds, @Nullable UUID curriculumId) {
    if (studentIds == null || studentIds.isEmpty())
      return List.of();
    return studentIds.stream()
        .map(id -> StudentOverviewDto.builder()
            .studentId(id)
            .overview(computeOverviewFor(id, curriculumId))
            .build())
        .toList();
  }

  public StreakDto getStreak(UUID studentId) {
    Streak s = streakRepository.findByStudentId(studentId)
        .orElseGet(() -> Streak.builder().studentId(studentId).current(0).longest(0).build());
    return StreakDto.builder()
        .current(s.getCurrent() == null ? 0 : s.getCurrent())
        .longest(s.getLongest() == null ? 0 : s.getLongest())
        .build();
  }

  // ===========================================================================
  // SERIES DIARIAS
  // ===========================================================================
  public List<DailyStatDto> getDailySeriesForStudent(UUID studentId, @Nullable UUID curriculumId, String rangeParam) {
    DateRange dr = DateRange.of(rangeParam);

    List<Object[]> rows = attemptRepository.seriesForStudent(
        studentId,
        dr.from(),
        dr.to(),
        curriculumId);

    Map<LocalDate, DailyStatDto> byDate = new HashMap<>();
    for (Object[] r : rows) {
      LocalDate day = toLocalDate(r[0]);
      int attempts = toInt(r[1]);
      int correct = toInt(r[2]);

      byDate.put(day, DailyStatDto.builder()
          .date(day)
          .attempts(attempts)
          .correct(correct)
          .activeStudents(null)
          .build());
    }

    return dr.days().stream()
        .map(d -> byDate.getOrDefault(d, DailyStatDto.builder()
            .date(d).attempts(0).correct(0).activeStudents(null).build()))
        .collect(Collectors.toList());
  }

  public List<DailyStatDto> getDailySeriesForStudents(List<UUID> studentIds, @Nullable UUID curriculumId,
      String rangeParam) {
    DateRange dr = DateRange.of(rangeParam);

    if (studentIds == null || studentIds.isEmpty()) {
      return dr.days().stream()
          .map(d -> DailyStatDto.builder()
              .date(d)
              .attempts(0)
              .correct(0)
              .activeStudents(0)
              .build())
          .toList();
    }

    var raw = attemptRepository.aggregateDailyForStudents(studentIds, dr.from(), dr.to(), curriculumId);

    Map<LocalDate, DailyStatDto> byDate = new HashMap<>();
    for (Object[] row : raw) {
      LocalDate day = toLocalDate(row[0]);
      int attempts = toInt(row[1]);
      int correct = toInt(row[2]);
      int active = toInt(row[3]);

      byDate.put(day, DailyStatDto.builder()
          .date(day)
          .attempts(attempts)
          .correct(correct)
          .activeStudents(active)
          .build());
    }

    return dr.days().stream()
        .map(d -> byDate.getOrDefault(d, DailyStatDto.builder()
            .date(d).attempts(0).correct(0).activeStudents(0).build()))
        .collect(Collectors.toList());
  }

  // ===========================================================================
  // HELPERS
  // ===========================================================================
  private OverviewDto computeOverviewFor(UUID studentId, @Nullable UUID curriculumId) {
    List<StudentObjectiveProgress> list = (curriculumId != null)
        ? sopRepository.findAllByStudentIdAndCurriculumId(studentId, curriculumId)
        : sopRepository.findAllByStudentId(studentId);

    int mastered = (int) list.stream().filter(s -> s.getStatus() == ProgressStatus.MASTERED).count();
    int inProgress = (int) list.stream().filter(s -> s.getStatus() == ProgressStatus.IN_PROGRESS).count();
    int notStarted = (int) list.stream().filter(s -> s.getStatus() == ProgressStatus.NOT_STARTED).count();

    LocalDate today = LocalDate.now();
    LocalDateTime from = today.atStartOfDay();
    LocalDateTime to = today.plusDays(1).atStartOfDay();

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

  private static LocalDate toLocalDate(Object o) {
    if (o instanceof LocalDate ld)
      return ld;
    if (o instanceof java.sql.Date sd)
      return sd.toLocalDate();
    if (o instanceof java.sql.Timestamp ts)
      return ts.toLocalDateTime().toLocalDate();
    return LocalDate.parse(String.valueOf(o));
  }

  private static int toInt(Object o) {
    if (o == null)
      return 0;
    if (o instanceof Number n)
      return n.intValue();
    return Integer.parseInt(String.valueOf(o));
  }
}
