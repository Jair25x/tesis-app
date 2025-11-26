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

  const selectFilterCls =
    "w-full rounded-lg border px-2 py-1 text-sm shadow-sm " +
    "bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100";

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] w-full bg-gray-50 px-3 py-4 dark:bg-[#1e2a34] sm:px-4 md:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <BackLink
            to="/teacher/assessments"
            label="Volver a Mis asignaciones"
          />
          <div className="mt-4 rounded-2xl border bg-white p-4 text-sm shadow-sm dark:border-gray-800 dark:bg-gray-900">
            Cargando…
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-64px)] w-full bg-gray-50 px-3 py-4 dark:bg-[#1e2a34] sm:px-4 md:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <BackLink
            to="/teacher/assessments"
            label="Volver a Mis asignaciones"
          />
          <div className="mt-4 rounded-2xl border bg-white p-4 text-sm text-red-500 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            Error al cargar.
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const canOpenDetail = Boolean(assignmentId);

  return (
    <div className="min-h-[calc(100vh-64px)] w-full bg-gray-50 px-3 py-4 dark:bg-[#1e2a34] sm:px-4 md:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <BackLink to="/teacher/assessments" label="Volver a Mis asignaciones" />

        {/* Header + filtro estado */}
        <div className="mt-4 mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
            Envíos de la asignación
          </h1>

          <div className="w-full sm:w-64">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-xs text-gray-600 dark:text-gray-300">
                Estado
              </span>
              <select
                className={selectFilterCls}
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
          <div className="mb-4 rounded-2xl border bg-white p-3 text-xs text-gray-700 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200">
            Asignados: {overview.totalStudents ?? "—"} · Iniciados:{" "}
            {overview.started ?? 0} · Enviados: {overview.submitted ?? 0} ·
            &nbsp;Ítems manuales pendientes:{" "}
            {overview.manualPendingCount ?? "—"} · Promedio:{" "}
            {overview.avgScore ?? "—"}
          </div>
        )}

        {/* Tabla */}
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr className="text-xs uppercase tracking-wide text-gray-600 dark:text-gray-300">
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
                    className="border-t text-gray-800 dark:border-gray-800 dark:text-gray-100"
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
                          className="inline-flex rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
                          aria-label={`Abrir detalle de ${s.submissionId}`}
                        >
                          Abrir detalle
                        </Link>
                      ) : (
                        <button
                          type="button"
                          className="inline-flex cursor-not-allowed rounded bg-gray-300 px-3 py-1.5 text-xs text-gray-700"
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
                      className="px-3 py-8 text-center text-sm text-gray-500 dark:text-gray-300"
                    >
                      No hay envíos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="flex flex-col items-center justify-between gap-3 px-3 py-2 text-xs text-gray-600 sm:flex-row dark:text-gray-300">
            <div className="text-center sm:text-left">
              Página: {page + 1} / {totalPages} · Total: {data.totalElements}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
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
                type="button"
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
