// src/pages/teacher/assessments/AssignmentSubmissionsList.tsx
import { useMemo } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import {
  useAssignmentSubmissions,
  useAssignmentOverview,
} from "../../../hooks/assessments/useAssignments";
import BackLink from "../../../components/ui/BackLink";

// Posibles estados (ajusta si BE expone otros)
const STATUS_OPTS = [
  { value: "", label: "Todos" },
  { value: "SUBMITTED", label: "Enviados (sin corregir)" },
  { value: "GRADED", label: "Calificados" },
];

export default function AssignmentSubmissionsList() {
  const { assignmentId = "" } = useParams();
  const [sp, setSp] = useSearchParams();

  const statusParam = sp.get("status") ?? "";
  const pageParam = Number(sp.get("page") ?? 0) || 0;
  const sizeParam = Number(sp.get("size") ?? 20) || 20;

  const { data, isLoading, error } = useAssignmentSubmissions(assignmentId, {
    status: statusParam || undefined,
    page: pageParam,
    size: sizeParam,
  });

  const { data: overview } = useAssignmentOverview(assignmentId);

  const rows = useMemo(() => data?.content ?? [], [data]);
  const totalPages = data?.totalPages ?? 0;
  const page = data?.page ?? 0;

  const setParam = (k: string, v: string) => {
    const next = new URLSearchParams(sp);
    if (v) next.set(k, v);
    else next.delete(k);
    // Resetear página si cambian filtros
    if (k !== "page") next.set("page", "0");
    setSp(next, { replace: true });
  };

  if (isLoading) return <p className="p-6">Cargando…</p>;
  if (error) return <p className="p-6 text-red-500">Error al cargar.</p>;
  if (!data) return null;

  const canOpenDetail = Boolean(assignmentId);

  return (
    <div className="min-h-[calc(100vh-64px)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <BackLink to="/teacher/assessments" label="Volver a Mis asignaciones" />

        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-bold">Envíos de la asignación</h1>

          <div className="flex items-center gap-2">
            <label className="text-sm">
              Estado:&nbsp;
              <select
                className="rounded-lg border px-2 py-1 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-950"
                value={statusParam}
                onChange={(e) => setParam("status", e.target.value)}
                aria-label="Filtrar por estado"
              >
                {STATUS_OPTS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {overview && (
          <div className="mb-4 text-sm opacity-80">
            Asignados: {overview.totalStudents ?? "—"} · Iniciados:{" "}
            {overview.started ?? 0} · Enviados: {overview.submitted ?? 0} ·{" "}
            Ítems manuales pendientes: {overview.manualPendingCount ?? "—"} ·
            Promedio: {overview.avgScore ?? "—"}
          </div>
        )}

        <div className="rounded-2xl border bg-white p-0 shadow-sm dark:border-gray-800 dark:bg-gray-900 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-3 py-2 text-left">Submission</th>
                <th className="px-3 py-2 text-left">Alumno</th>
                <th className="px-3 py-2 text-left">Estado</th>
                <th className="px-3 py-2 text-left">Puntaje</th>
                <th className="px-3 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr
                  key={s.submissionId}
                  className="border-t dark:border-gray-700"
                >
                  <td className="px-3 py-2 align-top">
                    <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs dark:bg-slate-800">
                      {s.submissionId}
                    </code>
                  </td>
                  <td className="px-3 py-2 align-top">{s.studentId}</td>
                  <td className="px-3 py-2 align-top">{s.status}</td>
                  <td className="px-3 py-2 align-top">
                    {typeof s.score === "number" ? s.score : "—"}
                  </td>
                  <td className="px-3 py-2 align-top">
                    {canOpenDetail ? (
                      <Link
                        to={`/teacher/assessments/${assignmentId}/submissions/${s.submissionId}`}
                        className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 text-xs"
                        aria-label={`Abrir detalle de ${s.submissionId}`}
                      >
                        Abrir detalle
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className="px-3 py-1.5 rounded bg-gray-300 text-gray-700 text-xs cursor-not-allowed"
                        disabled
                        aria-disabled="true"
                        title="assignmentId inválido en la URL"
                      >
                        Abrir detalle
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-8 text-center text-sm opacity-70"
                  >
                    No hay envíos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Paginación */}
          <div className="flex items-center justify-between gap-2 px-3 py-2 text-xs">
            <div>
              Página: {page + 1} / {totalPages} · Total: {data.totalElements}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setParam("page", String(Math.max(0, page - 1)))}
                disabled={page <= 0}
                className="rounded-lg border px-3 py-1 text-sm transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                ← Anterior
              </button>
              <span className="opacity-70">
                {page + 1} de {totalPages}
              </span>
              <button
                onClick={() =>
                  setParam(
                    "page",
                    String(Math.min(page + 1, Math.max(0, totalPages - 1)))
                  )
                }
                disabled={page + 1 >= totalPages}
                className="rounded-lg border px-3 py-1 text-sm transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                Siguiente →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
