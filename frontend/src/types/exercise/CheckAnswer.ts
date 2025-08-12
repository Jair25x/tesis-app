export interface CheckAnswerRequest {
  // backend: JsonNode flexible según template
  answer: unknown;
}

export interface CheckAnswerResponse {
  correct: boolean;
  score?: number | null;
  questionResults?: Record<string, boolean> | null;
  feedback?: string | null;
}
