export type Difficulty = "BASIC" | "INTERMEDIATE" | "ADVANCED";

export interface HintResponse {
  id: string;
  hintText: string;
  cost: number;
  createdAt: string;
  updatedAt: string;
}

export interface SolutionStepResponse {
  id: string;
  stepNumber: number;
  explanation: string;
}

export interface ExerciseResponse {
  id: string;
  statement: string;
  difficulty: Difficulty;
  type: string;
  templateType: string;
  parameters: Record<string, unknown>;
  learningObjectiveId: string;
  learningObjectiveName?: string;
  standardId?: string;
  standardName?: string;
  competencyId?: string;
  curriculumId?: string;
  solutionSteps: SolutionStepResponse[];
  hints: HintResponse[];
  createdAt: string;
  updatedAt: string;
  active: boolean;
}

/** payload que enviamos desde el frontend */
export interface CheckAnswerRequest {
  studentAnswer: string;
}

/** lo que devuelve el backend */
export interface CheckAnswerResponse {
  correct: boolean;
  feedback: string;
  xpAwarded: number;
  remainingHints: number;
  nextExerciseId: string | null;
}

export interface ExerciseAttemptRequest {
  exerciseId: string; // UUID
  correct: boolean;
  hintsUsed: number;
  timeSpent: number; // en milisegundos
  submittedAnswer: string;
}

export interface ExerciseAttemptResponse {
  id: number;
  exerciseId: string;
  correct: boolean;
  hintsUsed: number;
  timeSpent: number;
  submittedAnswer: string;
  attemptedAt: string; // ISO date
}