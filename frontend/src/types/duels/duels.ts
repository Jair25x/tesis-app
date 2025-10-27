// types/duels/duels.ts
import type { TemplateType } from "../exercise/TemplateSchemaResponse";

export type DuelState = "WAITING" | "COUNTDOWN" | "ROUND" | "RESULTS";
export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type DuelMode = "bestOf" | "timePerQuestion" | "firstToAll";

export type RoundPlan = {
  questions: number;
  difficulty?: Difficulty;
  exerciseIds?: string[];
};

export interface CreateMatchReq {
  curriculumId: string;
  opponentId?: string;
  bestOf?: number; // en UI usarás 1 | 3 | 5, pero el backend acepta hasta 9
  objectiveId?: string;
  difficulty?: Difficulty;
  exerciseIds?: string[];
  isPublic?: boolean;

  // Multijugador / modos
  maxPlayers?: number;
  mode?: DuelMode;
  questionTimeSec?: number;
  winTarget?: number;

  // Simple (uniforme)
  questionsPerRound?: number;

  // Avanzado
  rounds?: RoundPlan[];
}

export interface CreateMatchResp {
  matchId: string;
  shortCode: string;
}

export interface DuelExercise {
  id: string;
  objectiveId?: string | null;
  templateType?: TemplateType;
  params?: Record<string, unknown>;
  statementHtml?: string | null;
}

export interface PlayerInfo {
  id: string;
  name: string;
}

export type ServerMsg =
  | {
      type: "state";
      status: DuelState;
      round?: number;
      code?: string;
      ready?: number;
      readyIds?: string[];
      players?: number;
      playersInfo?: PlayerInfo[];
      maxPlayers?: number;
    }
  | { type: "countdown"; sec: number }
  | {
      type: "round_start";
      round: number;
      exercise: DuelExercise;
      deadline?: number;
      qIndex?: number; // 1-based
      qTotal?: number;
    }
  | {
      type: "round_end";
      round: number;
      score: Record<string, number>;
    }
  | {
      type: "final";
      winnerId: string | null;
      score: Record<string, number>;
      byRound: Array<{
        round: number;
        winnerId: string | null;
      }>;
      playersInfo?: PlayerInfo[];
    }
  | { type: "error"; message: string };

export type ClientMsg =
  | { type: "ready" }
  | {
      type: "answer";
      round: number;
      qIndex?: number; // ⬅️ NUEVO (opcional por compat)
      answer: Record<string, unknown>;
      durationMs: number;
    };

/** NUEVO: disponibilidad por objetivo (duels-service) */
export interface ObjectiveAvailabilityResp {
  objectiveId: string;
  difficulty?: Difficulty | null;
  available: number;
  minRequired: number;
  maxAllowed: number;
  source: "server" | "sample";
}
