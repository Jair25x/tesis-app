// src/services/duelsService.ts
import type {
  CreateMatchReq,
  CreateMatchResp,
  Difficulty,
  ObjectiveAvailabilityResp,
} from "../types/duels/duels";

/**
 * Capa fetch con:
 * - Timeouts configurables (AbortController limpio, sin props ad-hoc)
 * - Reintentos seguros en GET ante 0/502/503/504 (backoff)
 * - ApiError tipado con message/code/details/raw
 * - Respuestas fuertemente tipadas (sin any)
 */

const BASE = "/api/duels";
const DEFAULT_TIMEOUT_MS = 20_000;
const RETRYABLE_STATUSES = new Set([502, 503, 504]);

/* =========================
   Tipos exportables de apoyo
   ========================= */

export type MatchBasicInfo = {
  matchId: string;
  shortCode: string;
  bestOf: number;
  status?: string;
};

export type OpenMatchItem = {
  matchId: string;
  shortCode: string;
  bestOf: number;
  createdAt: string; // ISO
  createdBy?: string;
  maxPlayers: number;
};

export type DuelSummary = {
  played: number;
  wins: number;
  losses: number;
  rating: number;
  lastPlayedAt?: string | null; // ISO
};

export type DuelHistoryItem = {
  matchId: string;
  finishedAt?: string | null; // ISO
  bestOf: number;
  winnerId?: string | null;
  shortCode?: string | null;
};

/* =========================
   Errores y helpers
   ========================= */

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;
  raw?: string;

  constructor(args: {
    status: number;
    message: string;
    code?: string;
    details?: unknown;
    raw?: string;
  }) {
    super(args.message);
    this.name = "ApiError";
    this.status = args.status;
    this.code = args.code;
    this.details = args.details;
    this.raw = args.raw;
  }
}

export type FetchOpts = {
  signal?: AbortSignal;
  timeoutMs?: number;
};

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

function isAbortError(err: unknown): boolean {
  // DOMException AbortError (navegador) o Error.name === 'AbortError'
  if (typeof err !== "object" || err === null) return false;
  const anyErr = err as { name?: unknown };
  return anyErr?.name === "AbortError";
}

function createTimeoutSignal(
  external: AbortSignal | undefined,
  timeoutMs: number
): { signal: AbortSignal; clear: () => void } {
  if (!timeoutMs || timeoutMs <= 0) {
    return {
      signal: external ?? new AbortController().signal,
      clear: () => {
        /* noop */
      },
    };
  }
  const ctrl = new AbortController();
  const timer = setTimeout(
    () => ctrl.abort(new DOMException("Timeout", "AbortError")),
    timeoutMs
  );
  if (external) {
    const onAbort = () => ctrl.abort(external.reason);
    external.addEventListener("abort", onAbort, { once: true });
  }
  return {
    signal: ctrl.signal,
    clear: () => clearTimeout(timer),
  };
}

async function parseProblemDetails(
  r: Response
): Promise<{
  message: string;
  code?: string;
  details?: unknown;
  raw?: string;
}> {
  const text = await r.text().catch(() => "");
  let message = text || `${r.status} ${r.statusText}`;
  let code: string | undefined;
  let details: unknown;

  if (text) {
    try {
      const json = JSON.parse(text) as Record<string, unknown>;
      const m =
        json.message ?? json.error ?? json.detail ?? json.title ?? message;
      message = String(m);
      if (typeof json.code === "string") code = json.code;
      details =
        (json as { errors?: unknown; details?: unknown }).errors ??
        json.details;
    } catch {
      // texto plano
    }
  }
  return { message, code, details, raw: text };
}

async function fetchJson<T>(
  input: RequestInfo | URL,
  init: RequestInit & FetchOpts,
  retryableGet: boolean,
  maxRetries: number
): Promise<T> {
  const timeoutMs = init.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const { signal, clear } = createTimeoutSignal(init.signal, timeoutMs);

  try {
    const res = await fetch(input, { ...init, signal });
    if (!res.ok) {
      const { message, code, details, raw } = await parseProblemDetails(res);
      throw new ApiError({ status: res.status, message, code, details, raw });
    }

    // JSON esperado; si 204 o content-type no JSON, devolvemos undefined como T si procede
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      return undefined as T;
    }
    const data = (await res.json()) as unknown;
    return data as T;
  } catch (err: unknown) {
    // Reintentos seguros: GET/HEAD idempotentes -> aquí usamos flag explícito
    if (retryableGet && maxRetries > 0) {
      const status = err instanceof ApiError ? err.status : 0;
      const retryable =
        !isAbortError(err) && (status === 0 || RETRYABLE_STATUSES.has(status));
      if (retryable) {
        const backoffMs =
          (3 - maxRetries) * 400 + Math.floor(Math.random() * 200);
        await new Promise((r) => setTimeout(r, backoffMs));
        return fetchJson<T>(input, init, retryableGet, maxRetries - 1);
      }
    }
    if (err instanceof ApiError) throw err;
    const msg =
      typeof (err as { message?: unknown })?.message === "string"
        ? String((err as { message?: unknown }).message)
        : "Network error";
    throw new ApiError({ status: 0, message: msg, raw: String(err) });
  } finally {
    clear();
  }
}

/* =========================
   Wrappers de endpoints
   ========================= */

export async function createMatch(
  req: CreateMatchReq,
  token: string,
  opts?: FetchOpts
): Promise<CreateMatchResp> {
  return fetchJson<CreateMatchResp>(
    `${BASE}/matches`,
    {
      method: "POST",
      headers: {
        ...authHeaders(token),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req),
      ...opts,
    },
    /* retryableGet */ false,
    /* maxRetries */ 0
  );
}

export async function getMatch(
  matchId: string,
  token: string,
  opts?: FetchOpts
): Promise<MatchBasicInfo> {
  return fetchJson<MatchBasicInfo>(
    `${BASE}/matches/${encodeURIComponent(matchId)}`,
    { headers: authHeaders(token), ...opts },
    /* retryableGet */ true,
    /* maxRetries */ 2
  );
}

export async function listOpenMatches(
  token: string,
  curriculumId?: string,
  opts?: FetchOpts
): Promise<OpenMatchItem[]> {
  const url = new URL(`${BASE}/open`, globalThis.location.origin);
  if (curriculumId) url.searchParams.set("curriculumId", curriculumId);
  const relative = url.pathname + url.search;

  return fetchJson<OpenMatchItem[]>(
    relative,
    { headers: authHeaders(token), ...opts },
    /* retryableGet */ true,
    /* maxRetries */ 2
  );
}

/**
 * Valida un código corto y devuelve el matchId.
 * - 404 => "Código no encontrado"
 */
export async function resolveCode(
  code: string,
  token: string,
  opts?: FetchOpts
): Promise<{ matchId: string }> {
  try {
    return await fetchJson<{ matchId: string }>(
      `${BASE}/resolve/${encodeURIComponent(code)}`,
      { headers: authHeaders(token), ...opts },
      /* retryableGet */ true,
      /* maxRetries */ 2
    );
  } catch (e: unknown) {
    if (e instanceof ApiError && e.status === 404) {
      throw new ApiError({ status: 404, message: "Código no encontrado" });
    }
    throw e;
  }
}

export async function getMyDuelSummary(
  token: string,
  opts?: FetchOpts
): Promise<DuelSummary> {
  return fetchJson<DuelSummary>(
    `${BASE}/me/summary`,
    { headers: authHeaders(token), ...opts },
    /* retryableGet */ true,
    /* maxRetries */ 2
  );
}

export async function getMyDuelHistory(
  token: string,
  limit = 20,
  opts?: FetchOpts
): Promise<DuelHistoryItem[]> {
  const url = new URL(`${BASE}/me/history`, globalThis.location.origin);
  url.searchParams.set("limit", String(limit));
  const relative = url.pathname + url.search;

  return fetchJson<DuelHistoryItem[]>(
    relative,
    { headers: authHeaders(token), ...opts },
    /* retryableGet */ true,
    /* maxRetries */ 2
  );
}

export async function getObjectiveAvailability(
  objectiveId: string,
  token: string,
  params?: {
    difficulty?: Difficulty;
    minRequired?: number;
    maxAllowed?: number;
  },
  opts?: FetchOpts
): Promise<ObjectiveAvailabilityResp> {
  const url = new URL(
    `${BASE}/objectives/${encodeURIComponent(objectiveId)}/availability`,
    globalThis.location.origin
  );
  if (params?.difficulty) url.searchParams.set("difficulty", params.difficulty);
  if (params?.minRequired != null)
    url.searchParams.set("min_required", String(params.minRequired));
  if (params?.maxAllowed != null)
    url.searchParams.set("max_allowed", String(params.maxAllowed));

  const relative = url.pathname + url.search;

  return fetchJson<ObjectiveAvailabilityResp>(
    relative,
    { headers: authHeaders(token), ...opts },
    /* retryableGet */ true,
    /* maxRetries */ 2
  );
}
