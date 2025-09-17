// src/services/aiService.ts
import api, { readAccessToken, readBaseURL } from "./api";
import type {
  ChatRequest,
  ChatResponse,
  ChatSSEEvent,
} from "../types/ai/Chat";
import type { RecommendationItem } from "../types/ai/Recommendations";
import { AxiosError } from "axios";

const BASE_PATH = "/ai";

// ========= helpers de base URL (multi-backend) =========
const ENV_ADVISOR = import.meta.env.VITE_ADVISOR_API_URL as string | undefined;

function makeAbsBase(b: string): string {
  // b puede ser "http://x/api" o "/api" o "api"
  if (/^https?:\/\//i.test(b)) return b.replace(/\/$/, "");
  const prefix = b.startsWith("/") ? "" : "/";
  return `${window.location.origin}${prefix}${b}`.replace(/\/$/, "");
}

function advisorBaseAbs(): string {
  const base = ENV_ADVISOR && String(ENV_ADVISOR).trim().length > 0
    ? String(ENV_ADVISOR)
    : readBaseURL();
  return makeAbsBase(base);
}

function url(path: string): string {
  // une base + path asegurando que no haya dobles barras
  return `${advisorBaseAbs()}${path}`;
}

// ---------- JSON (no stream) con Axios ----------
export async function chatOnce(
  body: ChatRequest,
  opts?: { bypassLLM?: boolean }
): Promise<ChatResponse> {
  try {
    // 👇 usamos URL absoluta para soportar base distinta al resto de servicios
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
        err.response?.data?.detail || "No se encontraron fuentes del currículo.";
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

// ---------- SSE (stream) con fetch ----------
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

  // curriculum scope como en axios interceptor
  try {
    const currId = localStorage.getItem("app:curriculumId");
    if (currId) headers["X-Curriculum-Id"] = currId;
  } catch {/* noop */}
  if (opts?.bypassLLM) headers["X-Bypass-LLM"] = "1";

  const res = await fetch(chatUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({ ...body, stream: true }),
    signal: opts?.signal,
  });

  if (res.status === 429) {
    throw new Error("Demasiadas solicitudes. Intenta en un momento.");
  }
  if (res.status === 504) {
    throw new Error(
      "El servicio de IA está tardando más de lo esperado. Intenta nuevamente en unos segundos."
    );
  }
  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Error ${res.status}`);
  }

  const reader = res.body.getReader();
  const dec = new TextDecoder("utf-8");
  let buf = "";

  const flush = (chunk: string) => {
    buf += chunk;
    const parts = buf.split("\n\n");
    buf = parts.pop() ?? "";
    for (const part of parts) {
      const line = part.split("\n").find((l) => l.startsWith("data:"));
      if (!line) continue;
      const data = line.slice(5).trim();
      if (!data) continue;
      try {
        const evt = JSON.parse(data) as ChatSSEEvent;
        if ("event" in evt && evt.event === "start") onStart(evt);
        else if ("event" in evt && evt.event === "end") onEnd(evt);
        else if ("delta" in evt) onDelta(evt.delta);
      } catch {
        // Ignora frames malformados
      }
    }
  };

  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    flush(dec.decode(value, { stream: true }));
  }
  if (buf) flush(dec.decode());
}

// ---------- Recomendaciones (Axios) ----------
export async function getMyRecommendations(opts?: {
  limit?: number;
  subject?: "math" | "lang";
  objectiveId?: string;
}): Promise<RecommendationItem[]> {
  try {
    const { data } = await api.get<{ items?: RecommendationItem[] }>(
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
    const status = err.response?.status;
    if (status === 429) {
      throw new Error("Demasiadas solicitudes. Intenta en un momento.");
    }
    const msg = err.response?.data?.message || err.message || "Error de red";
    throw new Error(msg);
  }
}
