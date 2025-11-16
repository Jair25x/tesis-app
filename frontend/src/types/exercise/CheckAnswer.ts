// src/types/exercise/CheckAnswer.ts

/** Payload genérico que se envía para validar un ejercicio. */
export type CheckAnswerPayload = Record<string, unknown>;

/**
 * Request tal como lo espera el backend:
 * body: { answer: { ...payload... } }
 */
export interface CheckAnswerRequest {
  answer: CheckAnswerPayload;
}

/**
 * Respuesta estándar de /curricula/exercises/{exerciseId}/check.
 * Alineado con CheckAnswerResponse del curriculum-service, incluyendo meta opcional.
 */
export interface CheckAnswerResponse {
  /** ¿La respuesta global es correcta? */
  correct: boolean;

  /** Puntaje 0..1; puede venir null/undefined si no aplica. */
  score?: number | null;

  /**
   * Resultados por sub-pregunta (si aplica).
   * Ejemplo: { "q1": true, "q2": false }
   */
  questionResults?: Record<string, boolean> | null;

  /** Feedback breve para el estudiante. */
  feedback?: string | null;

  // ───── Meta opcional para trazabilidad / analytics ─────

  /** ID del currículo al que pertenece el ejercicio. */
  curriculumId?: string | null;

  /** ID del objetivo de aprendizaje al que pertenece el ejercicio. */
  learningObjectiveId?: string | null;

  /** Dificultad del ejercicio: BASIC | INTERMEDIATE | ADVANCED (cuando aplica). */
  difficulty?: string | null;

  /** Puntaje máximo posible (normalmente 1.0). */
  maxScore?: number | null;
}
