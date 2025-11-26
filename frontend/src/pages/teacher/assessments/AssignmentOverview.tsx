import { useParams, Link } from "react-router-dom";
import { useAssignmentOverview } from "../../../hooks/assessments/useAssignments";
import type { ObjectiveBreakdown } from "../../../types/assessments/overview";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
} from "recharts";
import BackLink from "../../../components/ui/BackLink";

/* ===== Helpers Fase (defensivos) ===== */
type DiagnosticPhase = "INITIAL" | "MID" | "FINAL";

const phaseLabel: Record<DiagnosticPhase, string> = {
  INITIAL: "Inicial",
  MID: "Intermedia",
  FINAL: "Final",
};

function pick(obj: unknown, path: string[]): unknown {
  let cur: unknown = obj;
  for (const k of path) {
    if (!cur || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[k];
  }
  return cur;
}

function readPhase(o: unknown): DiagnosticPhase | null {
  const cands = [
    pick(o, ["templateConfigJson", "phase"]),
    pick(o, ["template", "configJson", "phase"]),
    pick(o, ["configJson", "phase"]),
    (o as Record<string, unknown> | null)?.phase,
  ];
  for (const v of cands) {
    if (typeof v === "string") {
      const up = v.toUpperCase();
      if (up === "INITIAL" || up === "MID" || up === "FINAL") {
        return up as DiagnosticPhase;
      }
    }
  }
  return null;
}

function isDiagnostic(o: unknown): boolean {
  const t =
    (o as Record<string, unknown> | null)?.type ??
    pick(o, ["assignmentType"]) ??
    pick(o, ["template", "type"]);
  return String(t ?? "").toUpperCase() === "DIAGNOSTIC";
}

function fmtPctOrScore(v?: number | null): string {
  if (v == null) return "—";
  return v <= 1 ? `${Math.round(v * 100)}%` : `${Math.round(v)} / 100`;
}

type ChartRow = { label: string; value: number };

function toChartData(breakdown: ObjectiveBreakdown[]): ChartRow[] {
  if (!breakdown?.length) return [];
  return breakdown.map((o, idx) => ({
    label: `OA ${idx + 1}`,
    value: o.avg <= 1 ? Math.round(o.avg * 100) : Math.round(o.avg),
  }));
}

export default function AssignmentOverview() {
  const { assignmentId = "" } = useParams<{ assignmentId: string }>();
  const { data, isLoading, error } = useAssignmentOverview(assignmentId);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] w-full bg-gray-50 px-3 py-4 dark:bg-[#1e2a34] sm:px-4 md:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-5xl">
          <p className="rounded-2xl border bg-white p-4 text-sm shadow-sm dark:border-gray-800 dark:bg-gray-900">
            Cargando overview…
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-64px)] w-full bg-gray-50 px-3 py-4 dark:bg-[#1e2a34] sm:px-4 md:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-5xl">
          <p className="rounded-2xl border bg-white p-4 text-sm text-red-600 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            No se pudo cargar.
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-[calc(100vh-64px)] w-full bg-gray-50 px-3 py-4 dark:bg-[#1e2a34] sm:px-4 md:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-5xl">
          <p className="rounded-2xl border bg-white p-4 text-sm shadow-sm dark:border-gray-800 dark:bg-gray-900">
            Sin datos de la asignación.
          </p>
        </div>
      </div>
    );
  }

  const total = data.totalStudents ?? undefined;
  const started = data.started ?? 0;
  const submitted = data.submitted ?? 0;
  const avg = data.avgScore ?? null;
  const manualPending = data.manualPendingCount ?? 0;

  const chartData = toChartData(data.objectiveBreakdown ?? []);

  const showPhase = isDiagnostic(data);
  const phase = showPhase ? readPhase(data) : null;

  return (
    <div className="min-h-[calc(100vh-64px)] w-full bg-gray-50 px-3 py-4 dark:bg-[#1e2a34] sm:px-4 md:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
        {/* Back */}
        <BackLink to="/teacher/assessments" label="Volver a mis asignaciones" />

        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
              Resumen de la asignación
            </h1>
            {showPhase && phase && (
              <div className="mt-2 text-xs">
                <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-700 ring-1 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-200 dark:ring-amber-800">
                  Fase diagnóstico: {phaseLabel[phase]}
                </span>
              </div>
            )}
          </div>

          <div className="flex w-full justify-start sm:w-auto sm:justify-end">
            <Link
              to={`/teacher/assessments/${assignmentId}/submissions`}
              className="inline-flex w-full items-center justify-center rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 sm:w-auto"
            >
              Ver envíos →
            </Link>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="text-xs text-gray-500 dark:text-gray-300">
              Asignados
            </div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">
              {total ?? "—"}
            </div>
          </div>
          <div className="rounded-2xl border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="text-xs text-gray-500 dark:text-gray-300">
              Iniciaron
            </div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">
              {started}
            </div>
          </div>
          <div className="rounded-2xl border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="text-xs text-gray-500 dark:text-gray-300">
              Enviados
            </div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">
              {submitted}
            </div>
          </div>
          <div className="rounded-2xl border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="text-xs text-gray-500 dark:text-gray-300">
              Promedio
            </div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">
              {fmtPctOrScore(avg)}
            </div>
          </div>
        </div>

        {/* Pendientes manuales */}
        <div className="rounded-2xl border bg-white p-4 text-sm shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-gray-800 dark:text-gray-100">
              Ítems pendientes de corrección manual:
            </span>
            <Link
              to={`/teacher/assessments/${assignmentId}/submissions?status=SUBMITTED`}
              className="inline-flex w-full items-center justify-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 transition hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-200 sm:w-auto"
              title="Ir a envíos con estado SUBMITTED"
            >
              {manualPending}
            </Link>
          </div>
        </div>

        {/* Gráfico por OA */}
        <div className="rounded-2xl border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
            Desempeño por objetivo
          </div>

          {chartData.length ? (
            <div className="w-full overflow-x-auto">
              <div className="h-64 min-w-[320px] sm:h-72 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500 dark:text-gray-300">
              Aún no hay datos suficientes.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
