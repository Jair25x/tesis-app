// src/types/exercise/CheckAnswerResponse.ts

export interface CheckAnswerResponse {
  /**
   * Indica si la respuesta del estudiante fue correcta.
   */
  correct: boolean;

  /**
   * Feedback textual para mostrar al estudiante.
   */
  feedback: string;

  /**
   * ID del siguiente ejercicio, si se desea sugerir uno.
   */
  nextExerciseId: string | null;

  /**
   * Experiencia ganada por resolver el ejercicio (gamificación).
   */
  xpAwarded: number;

  /**
   * Número de pistas restantes disponibles para el estudiante.
   */
  remainingHints: number;
}
