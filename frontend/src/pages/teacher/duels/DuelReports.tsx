import { useEffect, useMemo, useState } from "react";
import {
  useTeacherDuelOverview,
  useTeacherDuelMatches,
} from "../../../hooks/duels/useDuelReports";
import type { GroupBy, TimeRange } from "../../../types/duels/reports";
import DuelKpiCards from "../../../components/teacher/duels/DuelKpiCards";
import DuelTimeline from "../../../components/teacher/duels/DuelTimeline";
import DuelTopPlayers from "../../../components/teacher/duels/DuelTopPlayers";
import DuelMatchesTable from "../../../components/teacher/duels/DuelMatchesTable";
import DuelStudentPanel from "../../../components/teacher/duels/DuelStudentPanel";
import ClassroomStudentPicker from "../../../components/teacher/duels/ClassroomStudentPicker";
import { useToastError } from "../../../hooks/useToastError";

function isoDaysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

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

  // ⬇️ ya soportan classroomId (según tus hooks actualizados)
  const overview = useTeacherDuelOverview(
    range,
    groupBy,
    classroomId ?? undefined
  );
  const matches = useTeacherDuelMatches(range, 20, classroomId ?? undefined);

  const toastError = useToastError();

  useEffect(() => {
    if (overview.error) toastError(overview.error);
  }, [overview.error, toastError]);

  useEffect(() => {
    if (matches.error) toastError(matches.error);
  }, [matches.error, toastError]);

  const onPrev = () =>
    matches.setOffset(
      Math.max(0, (matches.data?.offset ?? 0) - (matches.data?.limit ?? 20))
    );
  const onNext = () => {
    const off = matches.data?.offset ?? 0;
    const lim = matches.data?.limit ?? 20;
    const tot = matches.data?.total ?? 0;
    if (off + lim < tot) matches.setOffset(off + lim);
  };

  const loading =
    overview.status === "loading" ||
    matches.status === "loading" ||
    (overview.status === "idle" && !overview.data);

  const o = overview.data;
  const selectCls =
    "border border-gray-300 dark:border-white/10 rounded px-2 py-1 text-sm bg-white dark:bg-[#2d3b46] text-gray-900 dark:text-gray-100 focus-visible:ring-2 focus-visible:ring-green-500";

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Reportes de Duelos
        </h1>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor="days">
              Rango
            </label>
            <select
              id="days"
              className={selectCls}
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
            >
              <option value={7}>7 días</option>
              <option value={14}>14 días</option>
              <option value={30}>30 días</option>
              <option value={90}>90 días</option>
            </select>

            <label className="sr-only" htmlFor="groupBy">
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

          <ClassroomStudentPicker
            valueClassroomId={classroomId}
            onChangeClassroom={setClassroomId}
            valueStudentId={studentId}
            onChangeStudent={setStudentId}
          />
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-xl bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/10"
            />
          ))}
        </div>
      )}

      {!loading && o && (
        <>
          <DuelKpiCards
            matches={o.totals.matches}
            players={o.totals.players}
            winRate={o.performance.winRate}
            avgRoundTimeSec={o.performance.avgRoundTimeSec}
            correctRate={o.performance.correctRate}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <DuelTimeline data={o.timeline} />
            </div>
            <div>
              <DuelTopPlayers items={o.topPlayers} />
            </div>
          </div>
        </>
      )}

      <DuelMatchesTable data={matches.data} onPrev={onPrev} onNext={onNext} />

      {/* Panel puntual por alumno */}
      <DuelStudentPanel selectedUserId={studentId ?? undefined} />
    </div>
  );
}
