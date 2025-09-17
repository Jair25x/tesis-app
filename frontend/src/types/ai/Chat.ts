export interface StudentContext {
  grade?: string | null;
  subject?: string | null;
  lastObjectiveId?: string | null;
}

export interface ChatRequest {
  question: string;
  grade?: string | null;    // "6", "5", etc.
  subject?: string | null;  // "math" | "lang" | ...
  objectiveId?: string | null;
  stream?: boolean;
  studentContext?: StudentContext;
}

export interface Citation {
  docId: string;
  title?: string | null;
  url?: string | null;
}

export interface ChatResponse {
  answer: string;
  citations: Citation[];
  tokens: { prompt: number; completion: number };
  model: string;
}

// SSE
export interface ChatSSEStart {
  event: "start";
  model: string;
  citations: Citation[];
  meta?: {
    ranking?: Array<{
      rank: number;
      docId: string;
      title?: string | null;
      score?: number | null;
      distance?: number | null;
    }>;
  };
}

export interface ChatSSEDelta {
  delta: string;
}

export interface ChatSSEEnd {
  event: "end";
  citations: Citation[];
  meta?: { ranking?: Array<unknown> };
  tokens?: { prompt: number; completion: number };
}

export type ChatSSEEvent = ChatSSEStart | ChatSSEDelta | ChatSSEEnd;
