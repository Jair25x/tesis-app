// src/services/aiService.ts
import api, { readAccessToken, readBaseURL } from "./api";
import type {
  ChatRequest,
  ChatResponse,
  ChatSSEEvent,
  ConversationOut,
  ConversationWithMessages,
  CreateConversationPayload,
  AppendEventsPayload,
} from "../types/ai/Chat";
import type {
  RecommendationItem,
  RecommendationsResponse,
} from "../types/ai/Recommendations";
import { AxiosError } from "axios";

const BASE_PATH = "/ai";
const ENV_ADVISOR = import.meta.env.VITE_ADVISOR_API_URL as string | undefined;

/* ---------------- Base URL helpers (multi-backend) ---------------- */

function makeAbsBase(b: string): string {
  if (/^https?:\/\//i.test(b)) return b.replace(/\/$/, "");
  const prefix = b.startsWith("/") ? "" : "/";
  return `${window.location.origin}${prefix}${b}`.replace(/\/$/, "");
}

function advisorBaseAbs(): string {
  const base =
    ENV_ADVISOR && String(ENV_ADVISOR).trim().length > 0
      ? String(ENV_ADVISOR)
      : readBaseURL(); // típicamente "/api"
  return makeAbsBase(base);
}

function url(path: string): string {
  return `${advisorBaseAbs()}${path}`;
}

/* ===================== Chat JSON (no stream) ===================== */

export async function chatOnce(
  body: ChatRequest,
  opts?: { bypassLLM?: boolean }
): Promise<ChatResponse> {
  try {
    const { data } = await api.post<ChatResponse>(
      url(`${BASE_PATH}/chat`),
      { ...body, stream: false },
      {
        params: { stream: "false" },
        headers: opts?.bypassLLM ? { "X-Bypass-LLM": "1" } : undefined,
      }
    );
    return data;
  } catch (e) {
    const err = e as AxiosError<{ detail?: string; message?: string }>;
    const status = err.response?.status;

    if (status === 422) {
      const detail =
        err.response?.data?.detail ||
        "No se encontraron fuentes del currículo.";
      throw new Error(detail);
    }
    if (status === 504) {
      throw new Error(
        "El servicio de IA está tardando más de lo esperado. Intenta nuevamente en unos segundos."
      );
    }
    if (status === 429) {
      throw new Error("Demasiadas solicitudes. Intenta en un momento.");
    }
    const msg =
      err.response?.data?.message || err.message || `Error ${status ?? ""}`;
    throw new Error(msg);
  }
}

/* ===================== Chat SSE (stream) ===================== */

export async function chatStream(
  body: ChatRequest,
  onStart: (evt: Extract<ChatSSEEvent, { event: "start" }>) => void,
  onDelta: (text: string) => void,
  onEnd: (evt: Extract<ChatSSEEvent, { event: "end" }>) => void,
  opts?: { bypassLLM?: boolean; signal?: AbortSignal }
): Promise<void> {
  const chatUrl = url(`${BASE_PATH}/chat?stream=true`);

  const headers: Record<string, string> = {
    "Content-Type": "application/json; charset=utf-8",
    Accept: "text/event-stream",
    "Cache-Control": "no-cache",
    "X-App-Version": "web@1",
  };

  const at = readAccessToken();
  if (at) headers.Authorization = `Bearer ${at}`;

  try {
    const currId = localStorage.getItem("app:curriculumId");
    if (currId) headers["X-Curriculum-Id"] = currId;
  } catch {
    /* noop */
  }

  if (opts?.bypassLLM) headers["X-Bypass-LLM"] = "1";

  const res = await fetch(chatUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({ ...body, stream: true }),
    signal: opts?.signal,
    cache: "no-store",
    redirect: "follow",
  });

  if (res.status === 429)
    throw new Error("Demasiadas solicitudes. Intenta en un momento.");
  if (res.status === 504) {
    throw new Error(
      "El servicio de IA está tardando más de lo esperado. Intenta nuevamente en unos segundos."
    );
  }
  if (!res.ok || !res.body) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || `Error ${res.status}`);
  }

  const reader = res.body.getReader();
  const dec = new TextDecoder("utf-8");
  let buf = "";

  const flush = (chunk: string) => {
    buf += chunk;
    const parts = buf.split("\n\n");
    buf = parts.pop() ?? "";
    for (const part of parts) {
      const dataLines = part
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.startsWith("data:"));
      for (const line of dataLines) {
        const data = line.slice(5).trim();
        if (!data) continue;
        try {
          const evt = JSON.parse(data) as ChatSSEEvent;
          if ("event" in evt && evt.event === "start") onStart(evt);
          else if ("event" in evt && evt.event === "end") onEnd(evt);
          else if ("delta" in evt) onDelta(evt.delta);
        } catch {
          // Ignorar frames malformados
        }
      }
    }
  };

  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      flush(dec.decode(value, { stream: true }));
    }
    if (buf) flush(dec.decode());
  } finally {
    try {
      reader.releaseLock();
    } catch {
      /* noop */
    }
  }
}

/* ===================== Recomendaciones ===================== */

export async function getMyRecommendations(opts?: {
  limit?: number;
  subject?: "math" | "lang";
  objectiveId?: string;
}): Promise<RecommendationItem[]> {
  try {
    const { data } = await api.get<RecommendationsResponse>(
      url(`${BASE_PATH}/recommendations/students/me`),
      {
        params: {
          limit: opts?.limit ?? 8,
          subject: opts?.subject,
          objectiveId: opts?.objectiveId,
        },
      }
    );
    return data.items ?? [];
  } catch (e) {
    const err = e as AxiosError<{ message?: string }>;
    if (err.response?.status === 429) {
      throw new Error("Demasiadas solicitudes. Intenta en un momento.");
    }
    const msg = err.response?.data?.message || err.message || "Error de red";
    throw new Error(msg);
  }
}

export async function getRecommendationsForStudent(
  studentId: string,
  opts?: { limit?: number; subject?: "math" | "lang"; objectiveId?: string }
): Promise<RecommendationItem[]> {
  if (!studentId) throw new Error("studentId requerido");
  try {
    const { data } = await api.get<RecommendationsResponse>(
      url(`${BASE_PATH}/recommendations/students/${studentId}`),
      {
        params: {
          limit: opts?.limit ?? 8,
          subject: opts?.subject,
          objectiveId: opts?.objectiveId,
        },
      }
    );
    return data.items ?? [];
  } catch (e) {
    const err = e as AxiosError<{ message?: string }>;
    if (err.response?.status === 429) {
      throw new Error("Demasiadas solicitudes. Intenta en un momento.");
    }
    const msg = err.response?.data?.message || err.message || "Error de red";
    throw new Error(msg);
  }
}

export async function getRecommendationsQuery(opts: {
  studentId: string;
  limit?: number;
  subject?: "math" | "lang";
  objectiveId?: string;
}): Promise<RecommendationItem[]> {
  const { studentId, limit = 8, subject, objectiveId } = opts;
  if (!studentId) throw new Error("studentId requerido");
  try {
    const { data } = await api.get<RecommendationsResponse>(
      url(`${BASE_PATH}/recommendations`),
      {
        params: { studentId, limit, subject, objectiveId },
      }
    );
    return data.items ?? [];
  } catch (e) {
    const err = e as AxiosError<{ message?: string }>;
    if (err.response?.status === 429) {
      throw new Error("Demasiadas solicitudes. Intenta en un momento.");
    }
    const msg = err.response?.data?.message || err.message || "Error de red";
    throw new Error(msg);
  }
}

/* ===================== Historial (chat_history.py) ===================== */

type ApiConversationOut = {
  id: string;
  student_id: string;
  curriculum_id: string | null;
  created_at: string;
  updated_at: string;
};

type ApiChatMessage = {
  role: "user" | "assistant";
  text: string;
  ts: string;
};

type ApiConversationWithMessages = ApiConversationOut & {
  messages: ApiChatMessage[];
};

function convOutFromApi(apiConv: ApiConversationOut): ConversationOut {
  return {
    id: apiConv.id,
    studentId: apiConv.student_id,
    curriculumId: apiConv.curriculum_id,
    createdAt: apiConv.created_at,
    updatedAt: apiConv.updated_at,
  };
}

function convWithMsgsFromApi(
  apiConv: ApiConversationWithMessages
): ConversationWithMessages {
  return {
    ...convOutFromApi(apiConv),
    messages: (apiConv.messages ?? []).map((m) => ({
      role: m.role,
      text: m.text,
      ts: m.ts,
    })),
  };
}

export async function createConversation(
  payload: CreateConversationPayload
): Promise<ConversationOut> {
  const body = {
    curriculum_id: payload.curriculumId ?? null,
    first_messages: (payload.firstMessages ?? []).map((m) => ({
      role: m.role,
      text: m.text,
      ts: m.ts ?? new Date().toISOString(),
    })),
  };
  const { data } = await api.post<ApiConversationOut>(
    url(`${BASE_PATH}/chat/conversations`),
    body
  );
  return convOutFromApi(data);
}

export async function appendConversationEvents(
  payload: AppendEventsPayload
): Promise<void> {
  const body = {
    messages: (payload.messages ?? []).map((m) => ({
      role: m.role,
      text: m.text,
      ts: m.ts ?? new Date().toISOString(),
    })),
  };
  await api.post(
    url(`${BASE_PATH}/chat/conversations/${payload.conversationId}/events`),
    body
  );
}

export async function getLatestConversation(
  curriculumId?: string
): Promise<ConversationWithMessages> {
  const params = curriculumId ? { curriculum_id: curriculumId } : undefined; // 👈 no mandamos null
  const { data } = await api.get<ApiConversationWithMessages>(
    url(`${BASE_PATH}/chat/conversations/latest`),
    { params }
  );
  return convWithMsgsFromApi(data);
}

/* -------- Re-export conveniente -------- */
export type { RecommendationItem } from "../types/ai/Recommendations";

/* -------- Alias de compatibilidad (si quedó algún import viejo) -------- */
export { appendConversationEvents as appendMessagesEvents };
