import type { CreateMatchReq, CreateMatchResp } from "../types/duels/duels";

const BASE = "/api/duels";

async function json<T>(r: Response): Promise<T> {
  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(`${r.status} ${r.statusText} ${txt}`);
  }
  return r.json() as Promise<T>;
}

/** Crear match: devuelve { matchId, shortCode } */
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

/** NUEVO: obtener detalles del match (incluye shortCode) */
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

/** (NUEVO) Listar partidas públicas en WAITING */
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
    }>
  >(r);
}

/** (NUEVO) Resolver código corto → matchId */
export async function resolveCode(code: string, token: string) {
  const r = await fetch(`${BASE}/resolve/${encodeURIComponent(code)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return json<{ matchId: string }>(r);
}

/* ⚠️ El endpoint /matches/:id/join no se usa en el backend nuevo.
   El “join” ocurre al abrir el WS con matchId o code.
*/
