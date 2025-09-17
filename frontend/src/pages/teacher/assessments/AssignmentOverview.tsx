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

function fmtPctOrScore(v?: number | null) {
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

  if (isLoading) return <p className="p-6">Cargando overview…</p>;
  if (error) return <p className="p-6 text-red-600">No se pudo cargar.</p>;
  if (!data) return null;

  const total = data.totalStudents ?? undefined;
  const started = data.started ?? 0;
  const submitted = data.submitted ?? 0;
  const avg = data.avgScore ?? null;
  const manualPending = data.manualPendingCount ?? 0;

  const chartData = toChartData(data.objectiveBreakdown ?? []);

  const showPhase = isDiagnostic(data);
  const phase = showPhase ? readPhase(data) : null;

  return (
    <div className="p-6">
      {/* Back */}
      <BackLink to="/teacher/assessments" label="Volver a mis asignaciones" />

      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Resumen de la asignación</h1>
          {showPhase && phase && (
            <div className="mt-1 text-xs">
              <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-700 ring-1 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-200 dark:ring-amber-800">
                Fase diagnóstico: {phaseLabel[phase]}
              </span>
            </div>
          )}
        </div>
        <Link
          to={`/teacher/assessments/${assignmentId}/submissions`}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-700"
        >
          Ver envíos →
        </Link>
      </div>

      {/* KPIs */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="text-xs opacity-70">Asignados</div>
          <div className="text-2xl font-semibold">{total ?? "—"}</div>
        </div>
        <div className="rounded-2xl border bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="text-xs opacity-70">Iniciaron</div>
          <div className="text-2xl font-semibold">{started}</div>
        </div>
        <div className="rounded-2xl border bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="text-xs opacity-70">Enviados</div>
          <div className="text-2xl font-semibold">{submitted}</div>
        </div>
        <div className="rounded-2xl border bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="text-xs opacity-70">Promedio</div>
          <div className="text-2xl font-semibold">{fmtPctOrScore(avg)}</div>
        </div>
      </div>

      {/* Pendientes manuales */}
      <div className="mb-6 rounded-2xl border bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-2 text-sm">
          Ítems pendientes de corrección manual:
          <Link
            to={`/teacher/assessments/${assignmentId}/submissions?status=SUBMITTED`}
            className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 transition hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-200"
            title="Ir a envíos con estado SUBMITTED"
          >
            {manualPending}
          </Link>
        </div>
      </div>

      {/* Gráfico por OA */}
      <div className="rounded-2xl border bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-2 text-sm font-semibold">Desempeño por objetivo</div>
        {chartData.length ? (
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-sm opacity-70">
            Aún no hay datos suficientes.
          </div>
        )}
      </div>
    </div>
  );
}
