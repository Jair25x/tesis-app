// src/types/progress/TeacherProgressTypes.ts
import type { UUID } from "../classroom/ClassroomTypes";

export interface OverviewDto {
  masteredObjectives: number;
  inProgressObjectives: number;
  notStartedObjectives: number;
  dailyAttempts: number;
  dailyCorrect: number;
}

export interface StudentOverviewDto {
  studentId: UUID;
  overview: OverviewDto;
}

export type DailyStatDto = {
  date: string; // 'YYYY-MM-DD'
  attempts: number;
  correct: number;
  activeStudents?: number; // opcional (agregado del aula)
};
