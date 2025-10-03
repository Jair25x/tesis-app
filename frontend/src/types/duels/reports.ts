// src/types/duels/reports.ts
export type GroupBy = "day" | "week" | "month";

export interface TimeRange {
  from: string; // ISO (incl.)
  to: string; // ISO (excl. o incl.; el BE lo maneja con finished_at)
  curriculumId?: string;
}

export interface TeacherDuelOverview {
  range: TimeRange;
  totals: {
    matches: number;
    rounds: number;
    answers: number;
    players: number; // únicos
    classrooms?: number; // si el BE lo expone (opcional)
  };
  performance: {
    winRate: number; // 0..1
    avgRoundTimeSec: number; // segundos
    correctRate: number; // 0..1
  };
  timeline: Array<{ bucket: string; matches: number }>; // bucket = YYYY-MM-DD (día/semana/mes)
  topPlayers: Array<{
    userId: string;
    name?: string;
    played: number;
    wins: number;
    winRate: number; // 0..1
    rating?: number;
  }>;
}

export interface TeacherMatchRow {
  matchId: string;
  finishedAt: string | null;
  bestOf: number;
  status: "WAITING" | "RUNNING" | "FINISHED";
  winnerId: string | null;
  players: Array<{ userId: string; name?: string }>;
  rounds: number;
  answers: number;
  objectiveId?: string | null;
  difficulty?: "EASY" | "MEDIUM" | "HARD" | null;
  shortCode?: string | null;
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
