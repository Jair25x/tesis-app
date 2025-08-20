// src/main/java/com/tesis/progress_service/service/ProgressQueryService.java
package com.tesis.progress_service.service;

import com.tesis.progress_service.dto.DailyStatDto;
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
  // OVERVIEW(S)
  // ===========================================================================
  /** “Me/overview” (opcional por currículo). */
  public OverviewDto getOverview(UUID curriculumId) {
    UUID studentId = SecurityUtils.getCurrentUserIdOrThrow();
    return computeOverviewFor(studentId, curriculumId);
  }

  /** Overview para un alumno concreto (docente/admin). */
  public OverviewDto getOverviewForStudent(UUID studentId, UUID curriculumId) {
    return computeOverviewFor(studentId, curriculumId);
  }

  /**
   * Overview agregado por alumno para un conjunto de estudiantes (docente/admin).
   */
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

  /** Racha del alumno (current/longest). */
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

  /**
   * Serie por estudiante (attempts/correct). No aplica activeStudents (dejar
   * null).
   * Usa tu método existente en AttemptRepository: seriesForStudent(...)
   * con resultado [day, attempts, correct].
   */
  public List<DailyStatDto> getDailySeriesForStudent(UUID studentId, UUID curriculumId, String rangeParam) {
    DateRange dr = DateRange.of(rangeParam);

    // Si ya tienes definido seriesForStudent en el repo, úsalo:
    // SELECT date(...), count(*), sum(correct) ... GROUP BY date(...)
    List<Object[]> rows = attemptRepository.seriesForStudent(
        studentId,
        dr.from(),
        dr.to(),
        curriculumId);

    // Mapear resultados y rellenar ceros
    Map<LocalDate, DailyStatDto> byDate = new HashMap<>();
    for (Object[] r : rows) {
      LocalDate day = toLocalDate(r[0]);
      int attempts = toInt(r[1]);
      int correct = toInt(r[2]);

      byDate.put(day, DailyStatDto.builder()
          .date(day)
          .attempts(attempts)
          .correct(correct)
          .activeStudents(null) // no aplica para series por alumno
          .build());
    }

    return dr.days().stream()
        .map(d -> byDate.getOrDefault(d, DailyStatDto.builder()
            .date(d).attempts(0).correct(0).activeStudents(null).build()))
        .collect(Collectors.toList());
  }

  /**
   * Serie agregada por aula: attempts/correct y alumnos activos por día (distinct
   * students).
   * Usa el método nuevo aggregateDailyForStudents(...) con resultado:
   * [day, attempts, correct, active]
   */
  public List<DailyStatDto> getDailySeriesForStudents(List<UUID> studentIds, UUID curriculumId, String rangeParam) {
    DateRange dr = DateRange.of(rangeParam);

    if (studentIds == null || studentIds.isEmpty()) {
      // Devuelve serie densa con ceros
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
  private OverviewDto computeOverviewFor(UUID studentId, UUID curriculumId) {
    List<StudentObjectiveProgress> list = (curriculumId != null)
        ? sopRepository.findAllByStudentIdAndCurriculumId(studentId, curriculumId)
        : sopRepository.findAllByStudentId(studentId);

    int mastered = (int) list.stream().filter(s -> s.getStatus() == ProgressStatus.MASTERED).count();
    int inProgress = (int) list.stream().filter(s -> s.getStatus() == ProgressStatus.IN_PROGRESS).count();
    int notStarted = (int) list.stream().filter(s -> s.getStatus() == ProgressStatus.NOT_STARTED).count();

    LocalDate today = LocalDate.now();
    LocalDateTime from = today.atStartOfDay();
    LocalDateTime to = today.plusDays(1).atStartOfDay();

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
