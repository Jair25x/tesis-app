// src/services/duelsReportsService.ts
import type {
  GroupBy,
  TimeRange,
  TeacherDuelOverview,
  TeacherMatchesResp,
  AdminDuelOverview,
  UserDuelSummary,
  UserHistoryItem,
} from "../types/duels/reports";

const BASE = "/api/duels/reports";

/* ----------------- helpers fetch/json ----------------- */
async function json<T>(r: Response): Promise<T> {
  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(`${r.status} ${r.statusText} ${txt}`);
  }
  return r.json() as Promise<T>;
}

function withQuery(
  url: string,
  params: Record<string, string | number | boolean | undefined>
) {
  const u = new URL(`${location.origin}${url}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) u.searchParams.set(k, String(v));
  });
  return u.toString().replace(location.origin, "");
}

/* ----------------- type guards utilitarios (sin any) ----------------- */
function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

function pickNumber(
  obj: Record<string, unknown>,
  key: string,
  def = 0
): number {
  const v = obj[key];
  return typeof v === "number" && Number.isFinite(v) ? v : def;
}
function pickString(
  obj: Record<string, unknown>,
  key: string,
  def = ""
): string {
  const v = obj[key];
  return typeof v === "string" ? v : def;
}
function pickArray(obj: Record<string, unknown>, key: string): unknown[] {
  const v = obj[key];
  return Array.isArray(v) ? v : [];
}

/* ----------------- adaptadores de respuesta ----------------- */
/** Adapta la respuesta de /teacher/overview del BE a TeacherDuelOverview */
function adaptTeacherOverview(resp: unknown): TeacherDuelOverview {
  const r = isRecord(resp) ? resp : {};
  const kpis = isRecord(r.kpis) ? (r.kpis as Record<string, unknown>) : {};
  const timelineRaw = pickArray(r, "timeline");
  const topPlayersRaw = pickArray(r, "topPlayers");

  // KPI mínimos disponibles en tu BE actual
  const finished = pickNumber(kpis, "finished", 0);
  const avgQuestionsPerMatch = pickNumber(kpis, "avgQuestionsPerMatch", 0);

  // Totals esperados por el FE (algunos no existen en BE -> 0)
  // Para "matches": elegimos "finished" (completadas) como métrica principal.
  const totals = {
    matches: finished,
    rounds: 0,
    answers: 0,
    players: 0,
    classrooms: undefined,
  };

  // Performance no la expone el BE aún
  const performance = {
    winRate: 0,
    avgRoundTimeSec: 0,
    correctRate: 0,
  };
  void avgQuestionsPerMatch; // lo dejamos por si luego lo quieres mapear a algo

  // Timeline: el BE puede enviar {bucket, created, finished} -> usamos finished; o ya {bucket, matches}
  const timeline = timelineRaw
    .map((x): { bucket: string; matches: number } => {
      if (!isRecord(x)) return { bucket: "", matches: 0 };
      const bucket = pickString(x, "bucket", "");
      const matches = pickNumber(
        x,
        "matches",
        Number.NaN
      ); /* si viniera matches */

      if (!Number.isNaN(matches)) return { bucket, matches };

      const finishedCount = pickNumber(
        x as Record<string, unknown>,
        "finished",
        Number.NaN
      );
      if (!Number.isNaN(finishedCount))
        return { bucket, matches: finishedCount };

      const createdCount = pickNumber(
        x as Record<string, unknown>,
        "created",
        0
      );
      return { bucket, matches: createdCount };
    })
    .filter((p) => p.bucket.length > 0);

  // Top players: BE puede enviar solo {userId, rating}
  const topPlayers = topPlayersRaw
    .map((x) => {
      if (!isRecord(x)) return null;
      const userId = pickString(x, "userId", "");
      if (!userId) return null;
      const name = pickString(
        x,
        "name",
        undefined as unknown as string | undefined
      );
      const rating = pickNumber(
        x,
        "rating",
        undefined as unknown as number | undefined
      );

      // Campos no provistos por el BE -> 0
      return {
        userId,
        name,
        played: 0,
        wins: 0,
        winRate: 0,
        rating,
      };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);

  // Range (opcional, por si luego lo usas)
  const rangeObj = isRecord(r.range)
    ? (r.range as Record<string, unknown>)
    : {};
  const range: TimeRange = {
    from: pickString(rangeObj, "from", ""),
    to: pickString(rangeObj, "to", ""),
    // curriculumId opcional
    curriculumId: pickString(
      rangeObj,
      "curriculumId",
      undefined as unknown as string | undefined
    ),
  };

  return { range, totals, performance, timeline, topPlayers };
}

/** Adapta la respuesta de /admin/overview del BE a AdminDuelOverview (mismo shape que teacher) */
function adaptAdminOverview(resp: unknown): AdminDuelOverview {
  // Reutilizamos la misma lógica
  return adaptTeacherOverview(resp);
}

/* ----------------- endpoints ----------------- */
/** Docente: KPIs + Timeline + Top players (opcional classroomId) */
export async function getTeacherOverview(
  token: string,
  range: TimeRange,
  groupBy: GroupBy = "day",
  classroomId?: string
): Promise<TeacherDuelOverview> {
  const url = withQuery(`${BASE}/teacher/overview`, {
    from: range.from,
    to: range.to,
    groupBy,
    curriculumId: range.curriculumId,
    classroomId,
  });
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const raw = await json<unknown>(r);
  return adaptTeacherOverview(raw);
}

/** Docente: tabla de partidas (paginada, opcional classroomId) */
export async function getTeacherMatches(
  token: string,
  range: TimeRange,
  opts?: { limit?: number; offset?: number; classroomId?: string }
): Promise<TeacherMatchesResp> {
  const url = withQuery(`${BASE}/teacher/matches`, {
    from: range.from,
    to: range.to,
    limit: opts?.limit ?? 20,
    offset: opts?.offset ?? 0,
    curriculumId: range.curriculumId,
    classroomId: opts?.classroomId,
  });
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  return json<TeacherMatchesResp>(r);
}

/** Admin: KPIs globales */
export async function getAdminOverview(
  token: string,
  range: TimeRange,
  groupBy: GroupBy = "day"
): Promise<AdminDuelOverview> {
  const url = withQuery(`${BASE}/admin/overview`, {
    from: range.from,
    to: range.to,
    groupBy,
    curriculumId: range.curriculumId,
  });
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const raw = await json<unknown>(r);
  return adaptAdminOverview(raw);
}

/** Alumno: resumen (KPIs) */
export async function getUserSummary(
  token: string,
  userId: string,
  days = 90
): Promise<UserDuelSummary> {
  const url = withQuery(`${BASE}/users/${encodeURIComponent(userId)}/summary`, {
    days,
  });
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  return json<UserDuelSummary>(r);
}

/** Alumno: historial */
export async function getUserHistory(
  token: string,
  userId: string,
  days = 90,
  limit = 50
): Promise<UserHistoryItem[]> {
  const url = withQuery(`${BASE}/users/${encodeURIComponent(userId)}/history`, {
    days,
    limit,
  });
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  return json<UserHistoryItem[]>(r);
}
