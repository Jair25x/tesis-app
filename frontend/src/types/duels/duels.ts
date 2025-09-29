// src/types/duels/duels.ts
import type { TemplateType } from "../exercise/TemplateSchemaResponse";

export type DuelState = "WAITING" | "COUNTDOWN" | "ROUND" | "RESULTS";
export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type DuelMode = "bestOf" | "timePerQuestion" | "firstToAll";

export interface CreateMatchReq {
  curriculumId: string;
  bestOf?: 1 | 3 | 5;
  difficulty?: Difficulty;
  objectiveId?: string;
  random?: boolean;
  exerciseIds?: string[];
  isPublic?: boolean;

  // Para futuro (el backend aún mantiene 1v1):
  maxPlayers?: number;
  mode?: DuelMode;
  questionTimeSec?: number;
  winTarget?: number;
}

export interface CreateMatchResp {
  matchId: string;
  shortCode: string;
}

export interface DuelExercise {
  id: string;
  objectiveId?: string | null;
  templateType?: TemplateType;
  params?: unknown;
  statementHtml?: string | null;
}

export type ServerMsg =
  | {
      type: "state";
      status: DuelState;
      round?: number;
      code?: string;
      ready?: number; // NUEVO
      players?: number; // NUEVO
      maxPlayers?: number; // NUEVO
    }
  | { type: "countdown"; sec: number }
  | {
      type: "round_start";
      round: number;
      exercise: DuelExercise;
      deadline?: number;
    }
  | {
      type: "round_end";
      round: number;
      correct?: boolean;
      timeMs?: number;
      winnerStudentId?: string | null;
      score: Record<string, number>;
    }
  | {
      type: "final";
      winnerId: string | null;
      score: Record<string, number>;
      byRound: Array<{
        round: number;
        winnerId: string | null;
        exerciseId?: string;
        result?: Record<string, { correct: boolean; timeMs: number | null }>;
      }>;
    }
  | { type: "error"; message: string };

export type ClientMsg =
  | { type: "ready" }
  | {
      type: "answer";
      round: number;
      answer: Record<string, unknown>;
      durationMs: number;
    };
