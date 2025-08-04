export interface CheckAnswerRequest {
  studentAnswer: string;
}

export interface CheckAnswerResponse {
  correct: boolean;
  feedback: string;
  xpAwarded: number;
  remainingHints: number;
  nextExerciseId: string | null;
}
