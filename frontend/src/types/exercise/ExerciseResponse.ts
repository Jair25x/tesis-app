import type { HintResponse } from "./HintResponse";
import type { SolutionStepResponse } from "./SolutionStepResponse";

export type Difficulty = "BASIC" | "INTERMEDIATE" | "ADVANCED";

export type TemplateType =
  | "MUSTACHE"
  | "TBL_MATCH"
  | "FILL_IN_THE_BLANK"
  | "MULTIPLE_CHOICE"
  | string; // por si agregas más en el futuro

/**
 * Payload para crear o actualizar un ejercicio.
 */
export interface ExerciseRequest {
  statement: string; // Enunciado del ejercicio
  difficulty: Difficulty; // BASIC | INTERMEDIATE | ADVANCED
  type: string; // OPEN, CHOICE, etc.
  templateType: TemplateType; // TBL_MATCH, MUSTACHE, etc.
  parameters: Record<string, unknown>; // Parámetros JSON para Mustache u otros
  learningObjectiveId: string; // UUID
  correctAnswer: string; // Respuesta válida del ejercicio
}

/**
 * Respuesta detallada de un ejercicio.
 */
export interface ExerciseResponse {
  id: string;
  statement: string;
  difficulty: Difficulty;
  type: string;
  templateType: TemplateType;
  parameters: Record<string, unknown>;

  // Relaciones
  learningObjectiveId: string;
  learningObjectiveName?: string;
  standardId?: string;
  standardName?: string;
  competencyId?: string;
  competencyName?: string;
  curriculumId?: string;

  // Datos internos
  correctAnswer: string;
  solutionSteps: SolutionStepResponse[];
  hints: HintResponse[];

  // Auditoría
  createdAt: string;
  updatedAt: string;
  active: boolean;
}

/**
 * Payload enviado para verificar la respuesta.
 */
export interface CheckAnswerRequest {
  studentAnswer: string;
}

/**
 * Respuesta del backend al verificar un ejercicio.
 */
export interface CheckAnswerResponse {
  correct: boolean;
  feedback: string;
  xpAwarded: number;
  remainingHints: number;
  nextExerciseId: string | null;
}

/**
 * Payload para registrar un intento de ejercicio.
 */
export interface ExerciseAttemptRequest {
  exerciseId: string; // UUID del ejercicio
  correct: boolean; // si la respuesta fue correcta
  hintsUsed: number; // cantidad de pistas usadas (0..10)
  timeSpent: number; // tiempo en milisegundos
  submittedAnswer: string; // respuesta del estudiante (máx. 1000 caracteres)
}

/**
 * Respuesta al registrar un intento de ejercicio.
 */
export interface ExerciseAttemptResponse {
  id: number;
  exerciseId: string;
  correct: boolean;
  hintsUsed: number;
  timeSpent: number;
  submittedAnswer: string;
  attemptedAt: string;
  createdBy?: string;
  createdAt?: string;
}
