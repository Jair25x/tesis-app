// services/duelsService.ts
import type {
  CreateMatchReq,
  CreateMatchResp,
  Difficulty,
  ObjectiveAvailabilityResp,
} from "../types/duels/duels";

const BASE = "/api/duels";

async function json<T>(r: Response): Promise<T> {
  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(`${r.status} ${r.statusText} ${txt}`);
  }
  return r.json() as Promise<T>;
}

export async function createMatch(req: CreateMatchReq, token: string) {
  const r = await fetch(`${BASE}/matches`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req),
  });
  return json<CreateMatchResp>(r);
}

export async function getMatch(matchId: string, token: string) {
  const r = await fetch(`${BASE}/matches/${encodeURIComponent(matchId)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return json<{
    matchId: string;
    shortCode: string;
    bestOf: number;
    status?: string;
  }>(r);
}

export async function listOpenMatches(token: string, curriculumId?: string) {
  const url = new URL(`${location.origin}${BASE}/open`);
  if (curriculumId) url.searchParams.set("curriculumId", curriculumId);
  const r = await fetch(url.toString().replace(location.origin, ""), {
    headers: { Authorization: `Bearer ${token}` },
  });
  return json<
    Array<{
      matchId: string;
      shortCode: string;
      bestOf: number;
      createdAt: string;
      createdBy?: string;
      maxPlayers: number;
    }>
  >(r);
}

/**
 * Valida un código corto y devuelve el matchId.
 * - 404 => "Código no encontrado"
 * - otros errores => "No se pudo validar el código" (con detalle)
 */
export async function resolveCode(code: string, token: string) {
  const res = await fetch(`${BASE}/resolve/${encodeURIComponent(code)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 404) {
    throw new Error("Código no encontrado");
  }
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(
      `No se pudo validar el código: ${res.status} ${res.statusText} ${txt}`
    );
  }
  return (await res.json()) as { matchId: string };
}

// Alias opcional
export const resolveShortCode = resolveCode;

/** Resumen de mis duelos (wins/losses/rating) */
export async function getMyDuelSummary(token: string) {
  const r = await fetch(`${BASE}/me/summary`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return json<{
    played: number;
    wins: number;
    losses: number;
    rating: number;
    lastPlayedAt?: string | null;
  }>(r);
}

/** Historial de mis duelos */
export async function getMyDuelHistory(token: string, limit = 20) {
  const url = new URL(`${location.origin}${BASE}/me/history`);
  url.searchParams.set("limit", String(limit));
  const r = await fetch(url.toString().replace(location.origin, ""), {
    headers: { Authorization: `Bearer ${token}` },
  });
  return json<
    Array<{
      matchId: string;
      finishedAt?: string | null;
      bestOf: number;
      winnerId?: string | null;
      shortCode?: string | null;
    }>
  >(r);
}

/** NUEVO: disponibilidad por objetivo (server-side) */
export async function getObjectiveAvailability(
  objectiveId: string,
  token: string,
  opts?: {
    difficulty?: Difficulty;
    minRequired?: number; // default BE = 1
    maxAllowed?: number; // default BE = 10
  }
) {
  const url = new URL(
    `${location.origin}${BASE}/objectives/${encodeURIComponent(
      objectiveId
    )}/availability`
  );
  if (opts?.difficulty) url.searchParams.set("difficulty", opts.difficulty);
  if (opts?.minRequired != null)
    url.searchParams.set("min_required", String(opts.minRequired));
  if (opts?.maxAllowed != null)
    url.searchParams.set("max_allowed", String(opts.maxAllowed));

  const r = await fetch(url.toString().replace(location.origin, ""), {
    headers: { Authorization: `Bearer ${token}` },
  });
  return json<ObjectiveAvailabilityResp>(r);
}
