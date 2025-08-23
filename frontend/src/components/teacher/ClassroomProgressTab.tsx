// src/components/teacher/ClassroomProgressTab.tsx
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

const PIE_COLORS = ["#10B981", "#F59E0B", "#9CA3AF"]; // emerald, amber, gray
const LS_KEY_CURR = "teacher:lastCurriculumId";

/** Guard: ¿existe 'role' (privado)? */
function hasPrivateRole(m: unknown): m is { role: MemberRole } {
  return (
    !!m && typeof m === "object" && "role" in (m as Record<string, unknown>)
  );
}

export default function ClassroomProgressTab({
  classroomId,
}: {
  classroomId: string;
}) {
  const { curricula } = useCurriculum();
  const { byId } = useMembersDirectory(classroomId);

  // Persistencia (localStorage) del curriculumId
  const [curriculumId, setCurriculumId] = useState<string | undefined>(() => {
    const saved = localStorage.getItem(LS_KEY_CURR) || "";
    return saved || undefined;
  });
  useEffect(() => {
    if (curriculumId) localStorage.setItem(LS_KEY_CURR, curriculumId);
    else localStorage.removeItem(LS_KEY_CURR);
  }, [curriculumId]);

  // Filtro, modo de gráfico y rango de serie
  const [query, setQuery] = useState("");
  const [showPercent, setShowPercent] = useState(false);
  const [range, setRange] = useState<"today" | "7d" | "14d">("7d");

  // Datos principales
  const { data, isLoading } = useClassroomOverview(classroomId, curriculumId);
  const { data: series, isLoading: isSeriesLoading } = useClassroomSeries(
    classroomId,
    curriculumId,
    range
  );

  // Nombre amigable: usa fullName si viene; marca roles no-estudiante de forma segura
  const displayName = (studentId: string) => {
    const m = byId.get(studentId); // MemberPublicDto | undefined
    const base = m?.fullName?.trim()
      ? m.fullName.trim()
      : studentId.slice(0, 8);

    let role: MemberRole | undefined = m?.safeRole as MemberRole | undefined; // OWNER | STUDENT
    if (!role && hasPrivateRole(m)) {
      role = m.role; // Si el BE, por error, expone 'role' en público, lo usamos defensivamente
    }

    if (role && role !== "STUDENT") {
      return role === "CO_TEACHER" ? `${base} (CT)` : `${base} (${role})`;
    }
    return base;
  };

  // Filtrado por query (case-insensitive) usando displayName y uuid
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data ?? [];
    return (data ?? []).filter((s) => {
      const label = displayName(s.studentId).toLowerCase();
      return label.includes(q) || s.studentId.toLowerCase().includes(q);
    });
  }, [data, query]);

  // Dataset por alumno (siempre con accuracy)
  const barData: BarDatum[] = useMemo(() => {
    return (filtered ?? []).map((s) => {
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
    });
  }, [filtered]);

  // Agregados del aula (sobre filtrados)
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

  // Serie diaria (aula) — normaliza datos
  const seriesData = useMemo(
    () =>
      (series ?? []).map((d) => ({
        date: d.date, // YYYY-MM-DD
        attempts: d.attempts,
        correct: d.correct,
        activeStudents: d.activeStudents ?? 0,
      })),
    [series]
  );

  // Export CSV (sobre filtrados)
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

  // Export Excel (sobre filtrados)
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

  return (
    <div className="space-y-4">
      {/* Filtros + acciones */}
      <div className="flex items-end justify-between gap-2 flex-wrap">
        <div className="flex items-end gap-3 flex-wrap">
          {curricula?.length ? (
            <label className="text-sm inline-flex flex-col gap-1">
              <span className="text-xs">Currículo (opcional)</span>
              <select
                className="border rounded px-2 py-1 w-72 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
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
          ) : (
            <div />
          )}

          <label className="text-sm inline-flex flex-col gap-1">
            <span className="text-xs">Buscar alumno</span>
            <input
              type="text"
              className="border rounded px-2 py-1 w-64 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              placeholder="Nombre o UUID…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>

          <label className="text-sm inline-flex items-center gap-2 ml-2">
            <input
              type="checkbox"
              checked={showPercent}
              onChange={(e) => setShowPercent(e.target.checked)}
            />
            <span className="select-none">Mostrar % acierto</span>
          </label>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExportCsv}
            className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-700"
          >
            ⬇️ CSV
          </button>
          <button
            onClick={handleExportExcel}
            className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-700"
          >
            ⬇️ Excel
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
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

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Barras por alumno */}
        <div className="col-span-1 lg:col-span-3 rounded border p-3 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="text-sm font-semibold mb-2">
            {showPercent
              ? "Precisión (%) por alumno"
              : "Intentos vs Correctos (por alumno)"}
          </div>
          <div className="h-72">
            {isLoading ? (
              <SkeletonChart />
            ) : barData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
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
        <div className="col-span-1 lg:col-span-2 rounded border p-3 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="text-sm font-semibold mb-2">
            Distribución de OA (aula)
          </div>
          <div className="h-72">
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

      {/* Serie diaria del aula */}
      <div className="rounded border p-3 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-semibold">Actividad diaria (aula)</div>
          <label className="text-xs inline-flex items-center gap-2">
            <span>Rango:</span>
            <select
              className="border rounded px-2 py-1 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
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
        <div className="h-56">
          {isSeriesLoading ? (
            <SkeletonChart />
          ) : seriesData.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={seriesData}
                margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
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

      {/* Tabla compacta con link a detalle */}
      <div className="rounded border dark:border-gray-700 bg-white dark:bg-gray-800 overflow-x-auto">
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
            ) : filtered.length ? (
              filtered.map((s) => (
                <tr key={s.studentId} className="border-t dark:border-gray-700">
                  <Td mono>{displayName(s.studentId)}</Td>
                  <Td center>{s.overview.dailyAttempts}</Td>
                  <Td center>{s.overview.dailyCorrect}</Td>
                  <Td center>✅ {s.overview.masteredObjectives}</Td>
                  <Td center>🟡 {s.overview.inProgressObjectives}</Td>
                  <Td center>⚪ {s.overview.notStartedObjectives}</Td>
                  <Td center>
                    <Link
                      className="rounded border px-2 py-1 text-xs hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                      to={`/teacher/classrooms/${classroomId}/students/${s.studentId}`}
                    >
                      Ver
                    </Link>
                  </Td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="p-3 text-center text-gray-500">
                  Sin datos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ──────────── helpers ──────────── */
function csvEscape(s: string): string {
  if (/[,"\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/* ──────────── UI helpers ──────────── */
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
    <div className="rounded border p-3 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="text-xs text-gray-500 dark:text-gray-300">{title}</div>
      <div className="text-2xl font-semibold">
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
      className={`px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-100 ${className}`}
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
      className={`px-3 py-2 dark:text-gray-100 ${
        center ? "text-center" : "text-left"
      } ${mono ? "font-mono" : ""}`}
    >
      {children}
    </td>
  );
}

function SkeletonChart() {
  return (
    <div className="w-full h-full animate-pulse bg-gray-100 dark:bg-gray-700 rounded" />
  );
}

function EmptyChart() {
  return (
    <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
      Sin datos suficientes.
    </div>
  );
}
