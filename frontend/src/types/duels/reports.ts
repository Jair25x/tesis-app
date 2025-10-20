export type GroupBy = "day" | "week" | "month";

/**
 * Alineado al backend:
 * - El BE incluye groupBy y classroomId dentro de range.
 */
export interface TimeRange {
  from: string; // ISO
  to: string; // ISO
  curriculumId?: string;
  groupBy?: GroupBy;
  classroomId?: string;
}

export interface TeacherDuelOverview {
  range: TimeRange;
  totals: {
    matches: number;
    rounds: number;
    answers: number;
    players: number; // únicos
    classrooms?: number;
  };
  performance: {
    winRate: number; // 0..1
    avgRoundTimeSec: number; // segundos
    correctRate: number; // 0..1
  };
  timeline: Array<{ bucket: string; matches: number }>;
  topPlayers: Array<{
    userId: string;
    name?: string;
    rating?: number;
    played?: number;
    wins?: number;
    winRate?: number; // 0..1
  }>;
}

/**
 * Alineado al backend /teacher/matches (con enriquecidos).
 */
export interface TeacherMatchRow {
  matchId: string;
  createdAt: string | null; // <-- NUEVO
  finishedAt: string | null;
  bestOf: number;
  status: "WAITING" | "RUNNING" | "FINISHED";
  winnerId: string | null;

  // Enriquecidos por el BE
  players?: Array<{ userId: string; name?: string }>;
  rounds?: number;
  answers?: number;

  objectiveId?: string | null;
  difficulty?: "EASY" | "MEDIUM" | "HARD" | null;
  shortCode?: string | null;

  // NUEVOS (el BE los envía)
  mode?: string | null;
  maxPlayers?: number | null;

  // legacy opcional
  questionsPerRound?: number;
}

export interface TeacherMatchesResp {
  items: TeacherMatchRow[];
  total: number;
  limit: number;
  offset: number;
}

export interface UserDuelSummary {
  userId: string;
  played: number;
  wins: number;
  losses: number;
  rating: number;
  lastPlayedAt?: string | null;
}

export interface UserHistoryItem {
  matchId: string;
  status: "WAITING" | "RUNNING" | "FINISHED";
  createdAt?: string | null;
  finishedAt?: string | null;
  winnerId?: string | null;
  bestOf: number;
  questionsPerRound: number;
  difficulty?: "EASY" | "MEDIUM" | "HARD" | null;
  shortCode?: string | null;
}

export type AdminDuelOverview = TeacherDuelOverview;
