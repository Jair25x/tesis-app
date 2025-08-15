// src/main/java/com/tesis/progress_service/core/ProgressCalculator.java
package com.tesis.progress_service.core;

import com.tesis.progress_service.model.Attempt;
import com.tesis.progress_service.model.Streak;
import com.tesis.progress_service.model.StudentObjectiveProgress;
import com.tesis.progress_service.model.enums.MasteryLevel;
import com.tesis.progress_service.model.enums.ProgressStatus;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class ProgressCalculator {

  public StudentObjectiveProgress applyAttempt(StudentObjectiveProgress sop, Attempt attempt) {
    if (sop.getAttemptsCount() == null)
      sop.setAttemptsCount(0);
    if (sop.getCorrectCount() == null)
      sop.setCorrectCount(0);
    if (sop.getStreakCorrect() == null)
      sop.setStreakCorrect(0);

    sop.setAttemptsCount(sop.getAttemptsCount() + 1);
    if (attempt.isCorrect()) {
      sop.setCorrectCount(sop.getCorrectCount() + 1);
      sop.setStreakCorrect(sop.getStreakCorrect() + 1);
    } else {
      sop.setStreakCorrect(0);
    }
    sop.setLastAttemptAt(attempt.getCreatedAt());

    int attempts = sop.getAttemptsCount();
    int corrects = sop.getCorrectCount();
    double ratio = attempts == 0 ? 0.0 : (double) corrects / attempts;

    // Estado
    if (attempts == 0) {
      sop.setStatus(ProgressStatus.NOT_STARTED);
    } else if (ratio >= 0.8 && sop.getStreakCorrect() >= 3) {
      sop.setStatus(ProgressStatus.MASTERED);
    } else {
      sop.setStatus(ProgressStatus.IN_PROGRESS);
    }

    // Nivel de dominio (alineado a tu enum)
    if (ratio >= 0.8 && sop.getStreakCorrect() >= 3) {
      sop.setMasteryLevel(MasteryLevel.MASTERED);
    } else if (ratio >= 0.6) {
      sop.setMasteryLevel(MasteryLevel.PROFICIENT);
    } else {
      sop.setMasteryLevel(MasteryLevel.PRACTICING);
    }

    return sop;
  }

  public Streak updateStreak(Streak streak, LocalDate today) {
    if (streak.getCurrent() == null)
      streak.setCurrent(0);
    if (streak.getLongest() == null)
      streak.setLongest(0);

    if (streak.getLastDay() == null) {
      streak.setCurrent(1);
      streak.setLongest(Math.max(streak.getLongest(), streak.getCurrent()));
      streak.setLastDay(today);
      return streak;
    }

    LocalDate last = streak.getLastDay();

    if (last.isEqual(today)) {
      return streak; // ya hubo intento hoy
    } else if (last.plusDays(1).isEqual(today)) {
      streak.setCurrent(streak.getCurrent() + 1);
      streak.setLongest(Math.max(streak.getLongest(), streak.getCurrent()));
      streak.setLastDay(today);
    } else if (last.isBefore(today)) {
      streak.setCurrent(1); // racha reinicia
      streak.setLastDay(today);
    }
    return streak;
  }
}
