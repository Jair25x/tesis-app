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

/** Picks exactos a nivel top-level (opcional) */
export type RoundPick = {
  round?: number;   // o 'n'
  n?: number;       // compat
  qIndex: number;
  exerciseId: string;
};

export type RoundConfig = {
  roundNo: number;
  questions: number;
  difficulty?: Difficulty;
};

export interface CreateMatchReq {
  curriculumId: string;
  opponentId?: string;
  bestOf?: number; // UI: 1 | 3 | 5; BE acepta hasta 9
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
  rounds?: RoundPlan[];        // tu campo original
  roundConfigs?: RoundConfig[]; // alias/alternativa
  roundPicks?: RoundPick[];     // picks exactos
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

/** Progreso por sub-pregunta */
export type AnswerProgressMsg = {
  type: "answer_progress";
  round: number;     // ronda actual
  qIndex: number;    // índice 1-based
  responded: number; // cuántos ya respondieron
  total: number;     // total de participantes esperados
};

export type ClientMsg =
  | { type: "ready" }
  | {
      type: "answer";
      round: number;
      qIndex?: number; // compat 1-based
      answer: Record<string, unknown>;
      durationMs: number;
    };

/** Disponibilidad por objetivo */
export interface ObjectiveAvailabilityResp {
  objectiveId: string;
  difficulty?: Difficulty | null;
  available: number;
  minRequired: number;
  maxAllowed: number;
  source: "server" | "sample";
}

export type RoundSummary = {
  round: number;
  winnerId: string | null;
  noParticipation: boolean;
};

export type RoundEndMsg = {
  type: "round_end";
  round: number;
  score: Record<string, number>;
  noParticipation: boolean; // nuevo
  winnerId: string | null;  // nuevo
};

export type ServerMsg =
  | {
      type: "state";
      // Nota: el BE no emite "COUNTDOWN" dentro de 'state' (va en evento aparte),
      // pero mantener DuelState no rompe.
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
  | RoundEndMsg
  | {
      type: "final";
      winnerId: string | null;
      score: Record<string, number>;
      byRound: RoundSummary[]; // con noParticipation
      playersInfo?: PlayerInfo[];
    }
  | { type: "error"; message: string }
  | AnswerProgressMsg;
