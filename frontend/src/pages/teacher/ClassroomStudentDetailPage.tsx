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

const PIE_COLORS = ["#10B981", "#F59E0B", "#9CA3AF"];
const LS_KEY_CURR = "teacher:lastCurriculumId";

type Range = "today" | "7d" | "14d";

export default function ClassroomStudentDetailPage() {
  const { classroomId = "", studentId = "" } = useParams<{
    classroomId: string;
    studentId: string;
  }>();
  const { curricula } = useCurriculum();

  const [curriculumId, setCurriculumId] = useState<string | undefined>(() => {
    const saved = localStorage.getItem(LS_KEY_CURR) || "";
    return saved || undefined;
  });
  useEffect(() => {
    if (curriculumId) localStorage.setItem(LS_KEY_CURR, curriculumId);
    else localStorage.removeItem(LS_KEY_CURR);
  }, [curriculumId]);

  const { data, isLoading } = useClassroomStudentDetail(
    classroomId,
    studentId,
    curriculumId
  );

  const [range, setRange] = useState<Range>("7d");
  const { data: series = [], isLoading: isSeriesLoading } = useStudentSeries(
    classroomId,
    studentId,
    curriculumId,
    range
  );

  const displayName = studentId.slice(0, 8);

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
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 px-4 py-6 dark:bg-[#1e2a34] sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/teacher/classrooms/${classroomId}`}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-800 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
            >
              ← Volver al aula
            </Link>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Alumno: <span className="font-mono">{displayName}</span>
            </h1>
          </div>

          <div className="flex flex-wrap items-end gap-2">
            {curricula?.length ? (
              <label className="inline-flex flex-col gap-1 text-sm">
                <span className="text-xs text-gray-700 dark:text-gray-200">
                  Currículo (opcional)
                </span>
                <select
                  className="w-64 rounded-lg border px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
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
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-800 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
            >
              ⬇️ Exportar Excel
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <KpiCard title="Intentos hoy" value={data?.dailyAttempts ?? 0} />
          <KpiCard title="Correctos hoy" value={data?.dailyCorrect ?? 0} />
          <KpiCard title="OA dominados" value={data?.masteredObjectives ?? 0} />
        </div>

        {/* Pie + resumen */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
              Distribución de OA
            </div>
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
                      label={false}
                      minAngle={2}
                    >
                      {pieDataLabeled.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
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

          <div className="rounded-2xl border bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
              Resumen
            </div>
            <ul className="space-y-1 text-sm text-gray-800 dark:text-gray-100">
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
                OA en progreso:{" "}
                <strong>{data?.inProgressObjectives ?? 0}</strong>
              </li>
              <li>
                OA no iniciados:{" "}
                <strong>{data?.notStartedObjectives ?? 0}</strong>
              </li>
            </ul>
          </div>
        </div>

        {/* Serie diaria */}
        <div className="rounded-2xl border bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              Actividad diaria (alumno)
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-200">
              <span>Rango:</span>
              <select
                className="rounded-lg border px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-white"
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
    <div className="rounded-2xl border bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="text-xs text-gray-500 dark:text-gray-300">{title}</div>
      <div className="text-2xl font-semibold text-gray-900 dark:text-white">
        {value}
        {suffix ?? ""}
      </div>
    </div>
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
