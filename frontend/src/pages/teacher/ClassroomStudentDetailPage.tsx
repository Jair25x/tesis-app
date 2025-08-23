// src/pages/teacher/ClassroomStudentDetailPage.tsx
import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { useCurriculum } from "../../hooks/useCurriculum";
import { useClassroomStudentDetail } from "../../hooks/progress/useClassroomStudentDetail";
import { useStudentSeries } from "../../hooks/progress/useStudentSeries";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LabelList,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { exportOverviewToExcel } from "../../utils/exportToExcel";

const PIE_COLORS = ["#10B981", "#F59E0B", "#9CA3AF"]; // emerald, amber, gray
const LS_KEY_CURR = "teacher:lastCurriculumId";

type Range = "today" | "7d" | "14d";

export default function ClassroomStudentDetailPage() {
  const { classroomId = "", studentId = "" } = useParams<{
    classroomId: string;
    studentId: string;
  }>();
  const { curricula } = useCurriculum();

  // Persistencia de curriculumId
  const [curriculumId, setCurriculumId] = useState<string | undefined>(() => {
    const saved = localStorage.getItem(LS_KEY_CURR) || "";
    return saved || undefined;
  });
  useEffect(() => {
    if (curriculumId) localStorage.setItem(LS_KEY_CURR, curriculumId);
    else localStorage.removeItem(LS_KEY_CURR);
  }, [curriculumId]);

  // Detalle instantáneo
  const { data, isLoading } = useClassroomStudentDetail(
    classroomId,
    studentId,
    curriculumId
  );

  // Serie diaria (⚠️ tu hook espera: (classroomId, studentId, curriculumId?, range?))
  const [range, setRange] = useState<Range>("7d");
  const { data: series = [], isLoading: isSeriesLoading } = useStudentSeries(
    classroomId,
    studentId,
    curriculumId,
    range
  );

  // Nombre corto (cuando integren nombres reales, cámbialo)
  const displayName = studentId.slice(0, 8);

  // Datos del pie + etiqueta precalculada para LabelList
  const pieData = useMemo(
    () =>
      data
        ? ([
            { name: "Dominados", value: data.masteredObjectives },
            { name: "En progreso", value: data.inProgressObjectives },
            { name: "No iniciados", value: data.notStartedObjectives },
          ] as { name: string; value: number }[])
        : [],
    [data]
  );
  const pieDataLabeled = useMemo(
    () => pieData.map((d) => ({ ...d, label: `${d.name} (${d.value})` })),
    [pieData]
  );

  // Export Excel
  const handleExportExcel = () => {
    if (!data) return;
    const rows = [
      {
        studentId,
        dailyAttempts: data.dailyAttempts,
        dailyCorrect: data.dailyCorrect,
        mastered: data.masteredObjectives,
        inProgress: data.inProgressObjectives,
        notStarted: data.notStartedObjectives,
      },
    ];
    const suffix = curriculumId ? `-${curriculumId.slice(0, 8)}` : "";
    exportOverviewToExcel(
      rows,
      `student-${studentId.slice(0, 8)}${suffix}-overview`
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Link
            to={`/teacher/classrooms/${classroomId}`}
            className="rounded border px-2 py-1 text-sm hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-700"
          >
            ← Volver al aula
          </Link>
          <h1 className="text-xl font-semibold">
            Alumno: <span className="font-mono">{displayName}</span>
          </h1>
        </div>

        <div className="flex items-end gap-2">
          {curricula?.length ? (
            <label className="text-sm inline-flex flex-col gap-1">
              <span className="text-xs">Currículo (opcional)</span>
              <select
                className="border rounded px-2 py-1 w-64 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                value={curriculumId ?? ""}
                onChange={(e) => setCurriculumId(e.target.value || undefined)}
              >
                <option value="">Todos</option>
                {curricula.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <button
            onClick={handleExportExcel}
            className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-700"
          >
            ⬇️ Exportar Excel
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <KpiCard title="Intentos hoy" value={data?.dailyAttempts ?? 0} />
        <KpiCard title="Correctos hoy" value={data?.dailyCorrect ?? 0} />
        <KpiCard title="OA dominados" value={data?.masteredObjectives ?? 0} />
      </div>

      {/* Grids: Pie + Resumen */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded border p-3 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="text-sm font-semibold mb-2">Distribución de OA</div>
          <div className="h-80">
            {isLoading ? (
              <SkeletonChart />
            ) : data &&
              pieData[0].value + pieData[1].value + pieData[2].value > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieDataLabeled}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={110}
                    labelLine
                    label={false} // evitamos labels internos para no solapar
                    minAngle={2}
                  >
                    {pieDataLabeled.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                    {/* Labels fuera del pie sin formatter */}
                    <LabelList dataKey="label" position="outside" />
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

        <div className="rounded border p-3 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="text-sm font-semibold mb-2">Resumen</div>
          <ul className="text-sm space-y-1">
            <li>
              Intentos hoy: <strong>{data?.dailyAttempts ?? 0}</strong>
            </li>
            <li>
              Correctos hoy: <strong>{data?.dailyCorrect ?? 0}</strong>
            </li>
            <li>
              OA dominados: <strong>{data?.masteredObjectives ?? 0}</strong>
            </li>
            <li>
              OA en progreso: <strong>{data?.inProgressObjectives ?? 0}</strong>
            </li>
            <li>
              OA no iniciados:{" "}
              <strong>{data?.notStartedObjectives ?? 0}</strong>
            </li>
          </ul>
        </div>
      </div>

      {/* Serie diaria del alumno */}
      <div className="rounded border p-3 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-semibold">Actividad diaria (alumno)</div>
          <div className="flex items-center gap-2 text-sm">
            <span>Rango:</span>
            <select
              className="border rounded px-2 py-1 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              value={range}
              onChange={(e) => setRange(e.target.value as Range)}
            >
              <option value="today">Hoy</option>
              <option value="7d">7 días</option>
              <option value="14d">14 días</option>
            </select>
          </div>
        </div>

        <div className="h-72">
          {isSeriesLoading ? (
            <SkeletonChart />
          ) : series.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={series}
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
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="correct"
                  name="Correctos"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </div>
      </div>
    </div>
  );
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
    <div className="rounded border p-3 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="text-xs text-gray-500 dark:text-gray-300">{title}</div>
      <div className="text-2xl font-semibold">
        {value}
        {suffix ?? ""}
      </div>
    </div>
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
