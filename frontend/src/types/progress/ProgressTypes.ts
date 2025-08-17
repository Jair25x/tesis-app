// src/types/progress/ProgressTypes.ts

// ---------- DTOs fieles al backend ----------
export type AchievementDto = {
  code: string;
  name: string;
  description?: string;
  earnedAt: string; // ISO (LocalDateTime en backend -> ISO string)
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
  score?: number; // BigDecimal en backend -> number
  feedback?: Record<string, unknown>; // backend devuelve objeto

  sop?: SopDto;
  streak?: StreakDto;

  unlocked?: AchievementDto[]; // logros desbloqueados
};

export type OverviewDto = {
  masteredObjectives: number;
  inProgressObjectives: number;
  notStartedObjectives: number;

  dailyAttempts: number;
  dailyCorrect: number;
};

// ---------- Tipos de UI (los que usan tus componentes) ----------
export type Overview = {
  date: string; // YYYY-MM-DD (lo fabricamos en el service)
  attempts: number; // mapea de dailyAttempts
  correct: number; // mapea de dailyCorrect
  objectivesCompleted: number; // mapea de masteredObjectives
};

export type Streak = {
  current: number;
  longest: number;
  lastUpdated: string; // fabricado en FE con new Date().toISOString()
};

export type Achievement = {
  code: string;
  name: string;
  description?: string;
  earnedAt: string; // ISO
};

// Request que envías desde el FE (con campos opcionales)
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

// Respuesta que consumen tus componentes del FE
export type AttemptResponse = {
  attemptId?: string;
  exerciseId?: string; // opcional si quieres, no viene en el DTO pero útil
  correct: boolean;
  score?: number;
  // feedback podría ser texto en algún futuro; de momento mantenlo flexible:
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

