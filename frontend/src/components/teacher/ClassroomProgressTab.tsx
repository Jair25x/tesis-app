// Requiere: npm i recharts xlsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useClassroomOverview } from "../../hooks/progress/useClassroomOverview";
import { useClassroomSeries } from "../../hooks/progress/useClassroomSeries";
import { useCurriculum } from "../../hooks/useCurriculum";
import { useMembersDirectory } from "../../hooks/classroom/useMembersDirectory";
import type { CurriculumResponse } from "../../types/curriculum/Curriculum";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
  Line,
  LineChart,
} from "recharts";
import { exportOverviewToExcel } from "../../utils/exportToExcel";
import type {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import type { MemberRole } from "../../types/classroom/ClassroomTypes";

type BarDatum = {
  id: string;
  label: string;
  attempts?: number;
  correct?: number;
  accuracy?: number; // 0..100
};

type PieDatum = {
  name: string;
  value: number;
  key: "mastered" | "inProgress" | "notStarted";
};

const PIE_COLORS = ["#10B981", "#F59E0B", "#9CA3AF"];
const LS_KEY_CURR = "teacher:lastCurriculumId";

function hasPrivateRole(m: unknown): m is { role: MemberRole } {
  return (
    !!m && typeof m === "object" && "role" in (m as Record<string, unknown>)
  );
}

interface ClassroomProgressTabProps {
  classroomId: string;
}

export default function ClassroomProgressTab({
  classroomId,
}: ClassroomProgressTabProps) {
  const { curricula } = useCurriculum();
  const { byId } = useMembersDirectory(classroomId);

  // Persistencia curriculumId
  const [curriculumId, setCurriculumId] = useState<string | undefined>(() => {
    const saved = localStorage.getItem(LS_KEY_CURR) || "";
    return saved || undefined;
  });

  useEffect(() => {
    if (curriculumId) {
      localStorage.setItem(LS_KEY_CURR, curriculumId);
    } else {
      localStorage.removeItem(LS_KEY_CURR);
    }
  }, [curriculumId]);

  // Filtros UI
  const [query, setQuery] = useState("");
  const [showPercent, setShowPercent] = useState(false);
  const [range, setRange] = useState<"today" | "7d" | "14d">("7d");

  const { data, isLoading } = useClassroomOverview(classroomId, curriculumId);
  const { data: series, isLoading: isSeriesLoading } = useClassroomSeries(
    classroomId,
    curriculumId,
    range
  );

  const displayName = (studentId: string) => {
    const m = byId.get(studentId);
    const base = m?.fullName?.trim()
      ? m.fullName.trim()
      : studentId.slice(0, 8);

    let role: MemberRole | undefined = m?.safeRole as MemberRole | undefined;
    if (!role && hasPrivateRole(m)) {
      role = m.role;
    }

    if (role && role !== "STUDENT") {
      return role === "CO_TEACHER" ? `${base} (CT)` : `${base} (${role})`;
    }
    return base;
  };

  // Filtrado por alumno
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data ?? [];
    return (data ?? []).filter((s) => {
      const label = displayName(s.studentId).toLowerCase();
      return label.includes(q) || s.studentId.toLowerCase().includes(q);
    });
  }, [data, query, byId]);

  const barData: BarDatum[] = useMemo(
    () =>
      (filtered ?? []).map((s) => {
        const a = s.overview.dailyAttempts;
        const c = s.overview.dailyCorrect;
        const acc = a > 0 ? Math.round((c / a) * 100) : 0;
        return {
          id: s.studentId,
          label: displayName(s.studentId),
          attempts: a,
          correct: c,
          accuracy: acc,
        };
      }),
    [filtered, byId]
  );

  const totals = useMemo(() => {
    const base = {
      attempts: 0,
      correct: 0,
      mastered: 0,
      inProgress: 0,
      notStarted: 0,
      students: filtered.length,
      studentsTriedToday: 0,
      avgAccuracy: 0,
    };
    let accSum = 0;
    let accCount = 0;

    for (const s of filtered) {
      base.attempts += s.overview.dailyAttempts;
      base.correct += s.overview.dailyCorrect;
      base.mastered += s.overview.masteredObjectives;
      base.inProgress += s.overview.inProgressObjectives;
      base.notStarted += s.overview.notStartedObjectives;

      if (s.overview.dailyAttempts > 0) {
        base.studentsTriedToday += 1;
        accSum += s.overview.dailyCorrect / s.overview.dailyAttempts;
        accCount += 1;
      }
    }

    base.avgAccuracy = accCount ? Math.round((accSum / accCount) * 100) : 0;
    return base;
  }, [filtered]);

  const pieData: PieDatum[] = useMemo(
    () => [
      { name: "Dominados", value: totals.mastered, key: "mastered" },
      { name: "En progreso", value: totals.inProgress, key: "inProgress" },
      { name: "No iniciados", value: totals.notStarted, key: "notStarted" },
    ],
    [totals.mastered, totals.inProgress, totals.notStarted]
  );

  const seriesData = useMemo(
    () =>
      (series ?? []).map((d) => ({
        date: d.date,
        attempts: d.attempts,
        correct: d.correct,
        activeStudents: d.activeStudents ?? 0,
      })),
    [series]
  );

  const handleExportCsv = () => {
    const rows = [
      [
        "studentId",
        "label",
        "dailyAttempts",
        "dailyCorrect",
        "accuracyPct",
        "mastered",
        "inProgress",
        "notStarted",
      ],
      ...filtered.map((s) => {
        const a = s.overview.dailyAttempts;
        const c = s.overview.dailyCorrect;
        const pct = a > 0 ? Math.round((c / a) * 100) : 0;
        return [
          s.studentId,
          displayName(s.studentId),
          String(a),
          String(c),
          String(pct),
          String(s.overview.masteredObjectives),
          String(s.overview.inProgressObjectives),
          String(s.overview.notStartedObjectives),
        ];
      }),
    ];

    const csv = rows.map((r) => r.map(csvEscape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const suffix = curriculumId ? `-${curriculumId.slice(0, 8)}` : "";
    a.href = url;
    a.download = `classroom-${classroomId.slice(0, 8)}${suffix}-overview.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    const rows = filtered.map((s) => {
      const a = s.overview.dailyAttempts;
      const c = s.overview.dailyCorrect;
      const pct = a > 0 ? Math.round((c / a) * 100) : 0;
      return {
        studentId: s.studentId,
        alumno: displayName(s.studentId),
        dailyAttempts: a,
        dailyCorrect: c,
        accuracyPct: pct,
        mastered: s.overview.masteredObjectives,
        inProgress: s.overview.inProgressObjectives,
        notStarted: s.overview.notStartedObjectives,
      };
    });
    const suffix = curriculumId ? `-${curriculumId.slice(0, 8)}` : "";
    exportOverviewToExcel(
      rows,
      `classroom-${classroomId.slice(0, 8)}${suffix}-overview`
    );
  };

  const tooltipFormatter = (value: ValueType, name: NameType) => {
    const num = typeof value === "number" ? value : Number(value ?? 0);
    if (showPercent) {
      return [`${Math.round(num)}%`, "Precisión"];
    }
    const label =
      name === "attempts"
        ? "Intentos"
        : name === "correct"
        ? "Correctos"
        : String(name);
    return [num, label];
  };

  const yTickFormatter = (v: number) => (showPercent ? `${v}%` : `${v}`);

  const totalElements = filtered.length;

  return (
    <div className="space-y-4 rounded-2xl border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
      {/* Filtros + acciones */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col flex-wrap gap-3 sm:flex-row sm:items-end">
          {curricula?.length ? (
            <label className="flex flex-col text-sm sm:w-64">
              <span className="mb-1 text-xs text-gray-700 dark:text-gray-200">
                Currículo (opcional)
              </span>
              <select
                className="w-full rounded-lg border px-2 py-1 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                value={curriculumId ?? ""}
                onChange={(e) => setCurriculumId(e.target.value || undefined)}
              >
                <option value="">Todos</option>
                {curricula.map((c: CurriculumResponse) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <label className="flex flex-col text-sm sm:w-64">
            <span className="mb-1 text-xs text-gray-700 dark:text-gray-200">
              Buscar alumno
            </span>
            <input
              type="text"
              className="w-full rounded-lg border px-2 py-1 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              placeholder="Nombre o UUID…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>

          <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-200">
            <input
              type="checkbox"
              checked={showPercent}
              onChange={(e) => setShowPercent(e.target.checked)}
            />
            Mostrar % acierto
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="rounded-lg border px-3 py-1.5 text-xs text-gray-800 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-700 sm:text-sm"
          >
            ⬇️ CSV
          </button>
          <button
            type="button"
            onClick={handleExportExcel}
            className="rounded-lg border px-3 py-1.5 text-xs text-gray-800 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-700 sm:text-sm"
          >
            ⬇️ Excel
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Intentos hoy" value={totals.attempts} />
        <KpiCard title="Correctos hoy" value={totals.correct} />
        <KpiCard
          title="% alumnos con intento"
          value={
            totals.students > 0
              ? Math.round((totals.studentsTriedToday / totals.students) * 100)
              : 0
          }
          suffix="%"
        />
        <KpiCard
          title="Precisión media"
          value={totals.avgAccuracy}
          suffix="%"
        />
      </div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        {/* Barras por alumno */}
        <div className="col-span-1 overflow-hidden rounded-2xl border bg-white p-3 dark:border-gray-700 dark:bg-gray-800 md:col-span-3">
          <div className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
            {showPercent
              ? "Precisión (%) por alumno"
              : "Intentos vs Correctos (por alumno)"}
          </div>
          <div className="h-64 sm:h-72">
            {isLoading ? (
              <SkeletonChart />
            ) : barData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  margin={{ top: 8, right: 16, left: 0, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis
                    allowDecimals={false}
                    domain={showPercent ? [0, 100] : undefined}
                    tickFormatter={yTickFormatter}
                  />
                  <Tooltip formatter={tooltipFormatter} />
                  <Legend />
                  {showPercent ? (
                    <Bar dataKey="accuracy" name="Precisión (%)" />
                  ) : (
                    <>
                      <Bar dataKey="attempts" name="Intentos" fill="#3B82F6" />
                      <Bar dataKey="correct" name="Correctos" fill="#10B981" />
                      <Line
                        type="monotone"
                        dataKey="accuracy"
                        name="Precisión"
                        stroke="#8B5CF6"
                        strokeWidth={2}
                        dot={false}
                      />
                    </>
                  )}
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </div>
        </div>

        {/* Pie global aula */}
        <div className="col-span-1 overflow-hidden rounded-2xl border bg-white p-3 dark:border-gray-700 dark:bg-gray-800 md:col-span-2">
          <div className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
            Distribución de OA (aula)
          </div>
          <div className="h-64 sm:h-72">
            {isLoading ? (
              <SkeletonChart />
            ) : pieData[0].value + pieData[1].value + pieData[2].value > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={100}
                    labelLine={false}
                  >
                    {pieData.map((entry, i) => (
                      <Cell
                        key={entry.key}
                        fill={PIE_COLORS[i % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Legend
                    verticalAlign="bottom"
                    align="center"
                    iconType="circle"
                  />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </div>
        </div>
      </div>

      {/* Serie diaria */}
      <div className="overflow-hidden rounded-2xl border bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            Actividad diaria (aula)
          </div>
          <label className="inline-flex items-center gap-2 text-xs text-gray-700 dark:text-gray-200">
            <span>Rango:</span>
            <select
              className="rounded-lg border px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              value={range}
              onChange={(e) =>
                setRange(e.target.value as "today" | "7d" | "14d")
              }
            >
              <option value="today">Hoy</option>
              <option value="7d">Últimos 7 días</option>
              <option value="14d">Últimos 14 días</option>
            </select>
          </label>
        </div>
        <div className="h-56 sm:h-64">
          {isSeriesLoading ? (
            <SkeletonChart />
          ) : seriesData.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={seriesData}
                margin={{ top: 8, right: 16, left: 0, bottom: 32 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="attempts"
                  name="Intentos"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="correct"
                  name="Correctos"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </div>
      </div>

      {/* Lista compacta (MÓVIL) */}
      <div className="space-y-2 md:hidden">
        {isLoading ? (
          <div className="rounded-2xl border bg-white p-3 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
            Cargando...
          </div>
        ) : !totalElements ? (
          <div className="rounded-2xl border bg-white p-3 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
            Sin datos.
          </div>
        ) : (
          filtered.map((s) => (
            <div
              key={s.studentId}
              className="rounded-2xl border bg-white p-3 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="mb-1 font-mono text-sm text-gray-900 dark:text-white">
                {displayName(s.studentId)}
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-700 dark:text-gray-200">
                <div>
                  Intentos hoy:{" "}
                  <span className="font-semibold">
                    {s.overview.dailyAttempts}
                  </span>
                </div>
                <div>
                  Correctos hoy:{" "}
                  <span className="font-semibold">
                    {s.overview.dailyCorrect}
                  </span>
                </div>
                <div>
                  Dominados:{" "}
                  <span className="font-semibold">
                    {s.overview.masteredObjectives}
                  </span>
                </div>
                <div>
                  En progreso:{" "}
                  <span className="font-semibold">
                    {s.overview.inProgressObjectives}
                  </span>
                </div>
                <div className="col-span-2">
                  No iniciados:{" "}
                  <span className="font-semibold">
                    {s.overview.notStartedObjectives}
                  </span>
                </div>
              </div>
              <div className="mt-2 flex justify-end">
                <Link
                  className="rounded-lg border px-2 py-1 text-xs transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-700"
                  to={`/teacher/classrooms/${classroomId}/students/${s.studentId}`}
                >
                  Ver detalle
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Tabla compacta (DESKTOP) */}
      <div className="hidden md:block">
        <div className="overflow-x-auto rounded-2xl border bg-white dark:border-gray-700 dark:bg-gray-800">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <Th>Alumno</Th>
                <Th className="text-center">Intentos hoy</Th>
                <Th className="text-center">Correctos hoy</Th>
                <Th className="text-center">Dominados</Th>
                <Th className="text-center">En progreso</Th>
                <Th className="text-center">No iniciados</Th>
                <Th className="text-center">Detalle</Th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-3 text-center">
                    Cargando...
                  </td>
                </tr>
              ) : totalElements ? (
                filtered.map((s) => (
                  <tr
                    key={s.studentId}
                    className="border-t text-sm text-gray-800 dark:border-gray-700 dark:text-gray-100"
                  >
                    <Td mono>{displayName(s.studentId)}</Td>
                    <Td center>{s.overview.dailyAttempts}</Td>
                    <Td center>{s.overview.dailyCorrect}</Td>
                    <Td center>✅ {s.overview.masteredObjectives}</Td>
                    <Td center>🟡 {s.overview.inProgressObjectives}</Td>
                    <Td center>⚪ {s.overview.notStartedObjectives}</Td>
                    <Td center>
                      <Link
                        className="rounded-lg border px-2 py-1 text-xs transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                        to={`/teacher/classrooms/${classroomId}/students/${s.studentId}`}
                      >
                        Ver
                      </Link>
                    </Td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="p-3 text-center text-sm text-gray-500 dark:text-gray-300"
                  >
                    Sin datos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* helpers */
function csvEscape(s: string): string {
  if (/[,"\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function KpiCard({
  title,
  value,
  suffix,
}: {
  title: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div className="rounded-2xl border bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
      <div className="text-xs text-gray-500 dark:text-gray-300">{title}</div>
      <div className="text-2xl font-semibold text-gray-900 dark:text-white">
        {value}
        {suffix ?? ""}
      </div>
    </div>
  );
}

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-100 ${className}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  center,
  mono,
}: {
  children: React.ReactNode;
  center?: boolean;
  mono?: boolean;
}) {
  return (
    <td
      className={`px-3 py-2 ${center ? "text-center" : "text-left"} ${
        mono ? "font-mono" : ""
      }`}
    >
      {children}
    </td>
  );
}

function SkeletonChart() {
  return (
    <div className="h-full w-full animate-pulse rounded-lg bg-gray-100 dark:bg-gray-700" />
  );
}

function EmptyChart() {
  return (
    <div className="flex h-full w-full items-center justify-center text-sm text-gray-500 dark:text-gray-300">
      Sin datos suficientes.
    </div>
  );
}
