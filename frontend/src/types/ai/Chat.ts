// src/types/ai/Chat.ts

export interface StudentContext {
  grade?: string | null;
  subject?: string | null;
  lastObjectiveId?: string | null;
}

/** Petición de chat (JSON o Stream). */
export interface ChatRequest {
  question: string;
  grade?: string | null;
  subject?: string | null;
  objectiveId?: string | null;
  stream?: boolean;
  studentId?: string;
  studentContext?: StudentContext;

  /** Conversación existente (si aplica) */
  conversationId?: string | null;
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

  /** id de conversación (si el BE la creó en este turno) */
  conversationId?: string;
}

/* ========== SSE ========== */

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
  conversationId?: string;
  messageId?: string;
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

/* ========== Historial según chat_history.py ========== */

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  text: string;
  ts: string; // ISO
}

export interface ConversationOut {
  id: string;
  studentId: string;
  curriculumId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationWithMessages extends ConversationOut {
  messages: ChatMessage[];
}

/* Payloads para el BE (usamos camel en TS, lo convertimos a snake en el servicio) */
export interface CreateConversationPayload {
  curriculumId?: string | null;
  firstMessages?: Array<Partial<ChatMessage> & { role: ChatRole; text: string }>;
}

export interface AppendEventsPayload {
  conversationId: string;
  messages: Array<Partial<ChatMessage> & { role: ChatRole; text: string }>;
}
