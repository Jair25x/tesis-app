// src/types/assessments/submissions.ts
import type { UUID } from "./common";

/* ───────────────── Start ───────────────── */
export type GradingMode = "AUTO" | "MANUAL";

export interface StartResponseItem {
  submissionItemId: UUID;
  exerciseId: UUID;
  objectiveId: UUID;
  position: number | null; // BE puede mandar null
  points: number;
  gradingMode: GradingMode;
}

/** Config que clonas desde la plantilla (el BE lo manda como JSON) */
export interface StartConfig {
  shuffle?: boolean;
  showFeedback?: boolean;
  allowHints?: boolean;
  allowSolutionSteps?: boolean;
  showCorrectAfter?: "NEVER" | "AFTER_SUBMIT" | "AFTER_CLOSE";
}

/** Alineado con tu DTO Java (incluye assignmentId, studentId, attemptNo, startedAt, config) */
export interface StartResponse {
  submissionId: UUID;
  assignmentId: UUID;
  studentId: UUID;
  attemptNo: number;
  startedAt: string; // ISO
  durationSec?: number | null;
  config?: StartConfig & Record<string, unknown>;
  items: StartResponseItem[];
}

/* ──────────────── Submit ──────────────── */
export type SubmissionStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "GRADED"
  | "CANCELED";

export interface FeedbackPayload {
  // ajusta si tu BE tiene otra forma
  message?: string | null;
  [k: string]: unknown;
}

export interface SubmitRequest {
  answers: Array<{
    submissionItemId: UUID;
    exerciseId: UUID; // requerido por BE
    // objectiveId?: UUID;            // descomenta si BE lo valida
    answer: { value: unknown } | null;
    timeSpentSec?: number; // 👈 opcional (swagger int32)
  }>;
}

export interface SubmitItemResult {
  submissionItemId: UUID;
  correct: boolean | null;
  score: number | null;
  feedback?: FeedbackPayload | null;
}

export interface SubmitResponse {
  status: SubmissionStatus;
  score: number | null;
  maxScore: number | null;
  late?: boolean | null;
  items: SubmitItemResult[];
}

/* ─────────── Submission Detail ─────────── */
export interface SubmissionDetailItem {
  submissionItemId: UUID;
  exerciseId: UUID;
  objectiveId: UUID;
  position: number;
  points: number;
  gradingMode: GradingMode;
  answer: unknown | null;
  correct: boolean | null;
  score: number | null;
  feedback: unknown | null;
  checkedAt?: string | null;
  exerciseTitle?: string | null;
  exerciseType?: string | null;
  statementRendered?: string | null;
}
export interface SubmissionDetailResponse {
  submissionId: UUID;
  assignmentId: UUID;
  studentId: UUID;
  status: SubmissionStatus;
  score: number | null;
  maxScore: number | null;
  startedAt?: string | null;
  submittedAt?: string | null;
  gradedAt?: string | null;
  durationSec?: number | null;
  attemptNo?: number | null;
  /** Opcional: configuración efectiva para este submission (fallback de tiempo). */
  config?: SubmissionDetailConfig;
  elapsedSec?: number | null;
  items: SubmissionDetailItem[];
}

export interface SubmissionDetailConfig {
  /** Límite de tiempo efectivo para el intento (segundos). */
  timeLimitSec?: number;
  [k: string]: unknown;
}

/* ──────── Page para listado de submissions ─────── */
export interface SubmissionSummaryDto {
  submissionId: UUID;
  studentId: UUID;
  status: SubmissionStatus;
  score: number | null;
  maxScore: number | null;
  startedAt?: string | null;
  submittedAt?: string | null;
  gradedAt?: string | null;
  durationSec?: number | null;
  attemptNo?: number | null;
  elapsedSec?: number | null;
}
