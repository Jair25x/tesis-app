import { useEffect, useMemo, useState } from "react";
import {
  useTeacherDuelOverview,
  useTeacherDuelMatches,
} from "../../../hooks/duels/useDuelReports";
import type {
  GroupBy,
  TimeRange,
  TeacherDuelOverview,
  TeacherMatchesResp,
} from "../../../types/duels/reports";
import DuelKpiCards from "../../../components/teacher/duels/DuelKpiCards";
import DuelTimeline from "../../../components/teacher/duels/DuelTimeline";
import DuelTopPlayers from "../../../components/teacher/duels/DuelTopPlayers";
import DuelMatchesTable from "../../../components/teacher/duels/DuelMatchesTable";
import DuelStudentPanel from "../../../components/teacher/duels/DuelStudentPanel";
import ClassroomStudentPicker from "../../../components/teacher/duels/ClassroomStudentPicker";
import { useToastError } from "../../../hooks/useToastError";
import { useMembersDirectory } from "../../../hooks/classroom/useMembersDirectory";

function isoDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

// --------- Type guard para payloads envueltos como { data: T } ----------
function hasData<T>(x: unknown): x is { data: T } {
  return (
    typeof x === "object" &&
    x !== null &&
    "data" in (x as Record<string, unknown>)
  );
}

// --------- Defaults tipados (sin any) ----------
const EMPTY_OVERVIEW: TeacherDuelOverview = {
  range: { from: "", to: "", curriculumId: undefined },
  totals: { matches: 0, rounds: 0, answers: 0, players: 0 },
  performance: { winRate: 0, avgRoundTimeSec: 0, correctRate: 0 },
  timeline: [],
  topPlayers: [],
};

const EMPTY_MATCHES: TeacherMatchesResp = {
  total: 0,
  limit: 5, // mostramos 5 por página
  offset: 0,
  items: [],
};

export default function DuelReports() {
  const [groupBy, setGroupBy] = useState<GroupBy>("day");
  const [days, setDays] = useState<number>(7);
  const [classroomId, setClassroomId] = useState<string | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);

  const range: TimeRange = useMemo(
    () => ({
      from: isoDaysAgo(days),
      to: new Date().toISOString(),
    }),
    [days]
  );

  const overview = useTeacherDuelOverview(
    range,
    groupBy,
    classroomId ?? undefined
  );

  // ⬇️ Pide 5 elementos por página
  const matches = useTeacherDuelMatches(range, 5, classroomId ?? undefined);

  // Nombres del aula (directorio público que ya tienes)
  const { byId: membersById } = useMembersDirectory(classroomId ?? undefined);

  const toastError = useToastError();

  useEffect(() => {
    if (overview.error) {
      toastError(overview.error);
    }
  }, [overview.error, toastError]);

  useEffect(() => {
    if (matches.error) {
      toastError(matches.error);
    }
  }, [matches.error, toastError]);

  const loading =
    overview.status === "loading" ||
    matches.status === "loading" ||
    (overview.status === "idle" && !overview.data);

  // ================== OVERVIEW seguro ==================
  const hasOverview = overview.status === "success" && !!overview.data;

  const rawOverviewUnknown: unknown = overview.data ?? null;
  const unwrappedOverview: TeacherDuelOverview | null =
    hasData<TeacherDuelOverview>(rawOverviewUnknown)
      ? rawOverviewUnknown.data
      : (overview.data as TeacherDuelOverview | null);

  const o: TeacherDuelOverview = unwrappedOverview ?? EMPTY_OVERVIEW;

  const timeline = Array.isArray(o.timeline) ? o.timeline : [];

  // Top players con nombre desde directorio si no viene en la respuesta
  const topPlayersUi = (Array.isArray(o.topPlayers) ? o.topPlayers : []).map(
    (p) => {
      const played = typeof p.played === "number" ? p.played : 0;
      const wins = typeof p.wins === "number" ? p.wins : 0;
      const winRate =
        typeof p.winRate === "number"
          ? p.winRate
          : played > 0
          ? wins / played
          : 0;

      const dirName = membersById.get(p.userId)?.fullName ?? undefined;

      return {
        userId: p.userId,
        name: p.name && p.name.trim().length > 0 ? p.name : dirName,
        played,
        wins,
        winRate,
        rating: p.rating,
      };
    }
  );

  // ================== MATCHES seguro ==================
  const hasMatches = matches.status === "success" && !!matches.data;
  const m: TeacherMatchesResp = hasMatches ? matches.data! : EMPTY_MATCHES;

  const safeMatches: TeacherMatchesResp = {
    total: typeof m.total === "number" ? m.total : 0,
    limit: typeof m.limit === "number" ? m.limit : 5,
    offset: typeof m.offset === "number" ? m.offset : 0,
    items: Array.isArray(m.items) ? m.items : [],
  };

  const onPrev = () =>
    matches.setOffset(
      Math.max(0, (safeMatches.offset ?? 0) - (safeMatches.limit ?? 5))
    );

  const onNext = () => {
    const off = safeMatches.offset ?? 0;
    const lim = safeMatches.limit ?? 5;
    const tot = safeMatches.total ?? 0;
    if (off + lim < tot) {
      matches.setOffset(off + lim);
    }
  };

  const selectCls =
    "w-full rounded-lg border border-gray-300 px-2 py-1 text-sm shadow-sm " +
    "bg-white text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 " +
    "dark:border-white/10 dark:bg-[#2d3b46] dark:text-gray-100";

  return (
    <div className="min-h-[calc(100vh-64px)] w-full bg-gray-50 px-3 py-4 dark:bg-[#1e2a34] sm:px-4 md:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        {/* Header + filtros superiores */}
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
              Reportes de duelos
            </h1>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-300 sm:text-sm">
              Visualiza el desempeño de los duelos de tu aula en el rango
              seleccionado.
            </p>
          </div>

          <div className="flex flex-col gap-3 md:items-end">
            {/* Rango + groupBy */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex w-full flex-row flex-wrap gap-2 sm:w-auto sm:flex-nowrap">
                <div className="flex min-w-[120px] flex-1 flex-col gap-1 text-sm">
                  <label
                    htmlFor="days"
                    className="text-xs text-gray-700 dark:text-gray-200"
                  >
                    Rango
                  </label>
                  <select
                    id="days"
                    className={selectCls}
                    value={days}
                    onChange={(e) => setDays(parseInt(e.target.value, 10) || 7)}
                  >
                    <option value={7}>7 días</option>
                    <option value={14}>14 días</option>
                    <option value={30}>30 días</option>
                    <option value={90}>90 días</option>
                  </select>
                </div>

                <div className="flex min-w-[120px] flex-1 flex-col gap-1 text-sm">
                  <label
                    htmlFor="groupBy"
                    className="text-xs text-gray-700 dark:text-gray-200"
                  >
                    Agrupar por
                  </label>
                  <select
                    id="groupBy"
                    className={selectCls}
                    value={groupBy}
                    onChange={(e) => setGroupBy(e.target.value as GroupBy)}
                  >
                    <option value="day">Día</option>
                    <option value="week">Semana</option>
                    <option value="month">Mes</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Picker de aula + alumno */}
            <div className="w-full md:w-[360px] lg:w-[420px]">
              <ClassroomStudentPicker
                valueClassroomId={classroomId}
                onChangeClassroom={setClassroomId}
                valueStudentId={studentId}
                onChangeStudent={setStudentId}
              />
            </div>
          </div>
        </div>

        {/* Skeleton de KPIs mientras carga */}
        {loading && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 animate-pulse">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-2xl border border-gray-200 bg-gray-100 dark:border-white/10 dark:bg-white/10"
              />
            ))}
          </div>
        )}

        {/* Overview + timeline + top players */}
        {!loading && hasOverview && (
          <>
            <DuelKpiCards
              matches={o.totals.matches}
              players={o.totals.players}
              winRate={o.performance.winRate}
              avgRoundTimeSec={o.performance.avgRoundTimeSec}
              correctRate={o.performance.correctRate}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <DuelTimeline data={timeline} />
              </div>
              <div>
                <DuelTopPlayers items={topPlayersUi} />
              </div>
            </div>
          </>
        )}

        {/* Tabla de partidas + panel de estudiante */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 overflow-x-auto">
            <DuelMatchesTable
              data={safeMatches}
              onPrev={onPrev}
              onNext={onNext}
              nameById={membersById}
            />
          </div>

          <div className="lg:col-span-1">
            <DuelStudentPanel selectedUserId={studentId ?? undefined} />
          </div>
        </div>
      </div>
    </div>
  );
}
