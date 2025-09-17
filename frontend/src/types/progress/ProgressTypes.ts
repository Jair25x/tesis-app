// src/types/progress/ProgressTypes.ts

// ---------- DTOs fieles al backend ----------
export type AchievementDto = {
  code: string;
  name: string;
  description?: string;
  earnedAt: string; // ISO
};

export type StreakDto = {
  current: number;
  longest: number;
};

export type SopDto = {
  learningObjectiveId: string;
  attemptsCount?: number;
  correctCount?: number;
  streakCorrect?: number;
  accuracy?: number; // 0..1
  status?: "NOT_STARTED" | "IN_PROGRESS" | "MASTERED";
  masteryLevel?: "PRACTICING" | "PROFICIENT" | "MASTERED";
};

export type AttemptRequestDto = {
  curriculumId: string;
  learningObjectiveId: string;
  exerciseId: string;

  templateType?: string;
  difficulty?: string;
  source?: "PRACTICE" | "ASSESSMENT";
  sessionId?: string;
  sourceRefId?: string;

  answer: Record<string, unknown>;
  durationMs?: number;
  hintsUsed?: number;
};

export type AttemptResponseDto = {
  attemptId?: string;

  correct: boolean;
  score?: number;
  feedback?: Record<string, unknown>;

  sop?: SopDto;
  streak?: StreakDto;

  unlocked?: AchievementDto[];
};

export type OverviewDto = {
  masteredObjectives: number;
  inProgressObjectives: number;
  notStartedObjectives: number;

  dailyAttempts: number;
  dailyCorrect: number;
};

// 🔥 DTO de estados por objetivo (lo que devuelve el BE)
export type ObjectiveProgressStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export type ObjectiveStatusItem = {
  objectiveId: string;
  status: ObjectiveProgressStatus;
};

export type ObjectiveStatusResponse = ObjectiveStatusItem[];

// Sets ya procesados (útiles en el FE)
export type ObjectiveStatusSets = {
  completedIds: Set<string>;
  inProgressIds: Set<string>;
  notStartedIds: Set<string>;
};

// ---------- Tipos de UI ----------
export type Overview = {
  date: string; // YYYY-MM-DD
  attempts: number;
  correct: number;
  objectivesCompleted: number;
};

export type Streak = {
  current: number;
  longest: number;
  lastUpdated: string;
};

export type Achievement = {
  code: string;
  name: string;
  description?: string;
  earnedAt: string; // ISO
};

export type AttemptRequest = {
  curriculumId: string;
  learningObjectiveId: string;
  exerciseId: string;
  templateType?: string;
  difficulty?: string;
  source?: "PRACTICE" | "ASSESSMENT";
  sessionId?: string;
  sourceRefId?: string;
  answer: Record<string, unknown>;
  durationMs?: number;
  hintsUsed?: number;
};

export type AttemptResponse = {
  attemptId?: string;
  exerciseId?: string; // opcional
  correct: boolean;
  score?: number;
  feedback?: string | Record<string, unknown>;
  updatedStreak?: Streak;
  awardedAchievements?: Achievement[];
  sop?: SopDto;
};

export type AchievementMeta = {
  code: string;
  name: string;
  description?: string;
  points?: number;
};

// --- Serie diaria ---
export type SeriesRange = "today" | "7d" | "14d";

export interface DailyStatDto {
  date: string;
  attempts: number;
  correct: number;
  activeStudents?: number;
}
export interface DailyStat {
  date: string;
  attempts: number;
  correct: number;
  activeStudents?: number;
}

// 🔥 Cobertura por objetivo (ejercicios distintos correctos / total del OA)
export type ObjectiveCoverageItem = {
  objectiveId: string;
  solvedDistinct: number; // ejercicios distintos correctos
  totalExercises: number; // total activos del OA
};

export type ObjectiveCoverageResponse = ObjectiveCoverageItem[];
