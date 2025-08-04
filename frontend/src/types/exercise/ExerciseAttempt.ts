export interface ExerciseAttemptRequest {
  exerciseId: string;
  correct: boolean;
  hintsUsed: number;
  timeSpent: number;
  submittedAnswer: string;
}

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
