// src/pages/student/assessments/History.tsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { listMySubmissions } from "../../../services/assessmentsService";
import type { PageResponse } from "../../../types/assessments/common";
import type { MySubmissionSummaryDto } from "../../../types/assessments/student";
import BackLink from "../../../components/ui/BackLink";
import { assessmentsKeys } from "../../../hooks/assessments/queryKeys";

function StatusBadge({ s }: { s: MySubmissionSummaryDto["status"] }) {
  const map: Record<string, string> = {
    IN_PROGRESS:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200",
    SUBMITTED:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200",
    GRADED:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200",
    CANCELED: "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-white",
    NOT_STARTED:
      "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-white",
  };

  const text =
    s === "IN_PROGRESS"
      ? "En curso"
      : s === "SUBMITTED"
      ? "Enviada"
      : s === "GRADED"
      ? "Calificada"
      : s === "CANCELED"
      ? "Cancelada"
      : "—";

  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
        map[s] || map.NOT_STARTED
      }`}
    >
      {text}
    </span>
  );
}

function fmt(dt?: string | null): string {
  return dt ? new Date(dt).toLocaleString() : "—";
}

export default function History() {
  const qc = useQueryClient();

  const [page, setPage] = useState<PageResponse<MySubmissionSummaryDto> | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [filters, setFilters] = useState<{
    page: number;
    size: number;
    status: "ALL" | "IN_PROGRESS" | "SUBMITTED" | "GRADED";
  }>({ page: 0, size: 20, status: "ALL" });

  // Marca como "vistos" los pendientes actuales (SUBMITTED)
  const markResultsSeen = async (): Promise<void> => {
    let cnt = qc.getQueryData<number>(
      assessmentsKeys.mySubmissionsCount("SUBMITTED")
    );

    if (typeof cnt !== "number") {
      const p = await listMySubmissions({
        status: "SUBMITTED",
        page: 0,
        size: 1,
      });
      cnt = p.totalElements ?? 0;
    }

    localStorage.setItem("assess:lastSeenSubmittedCount", String(cnt ?? 0));
    await qc.refetchQueries({
      queryKey: assessmentsKeys.mySubmissionsCount("SUBMITTED"),
    });
  };

  const fetchData = async (): Promise<void> => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const d = await listMySubmissions({
        page: filters.page,
        size: filters.size,
        status: filters.status,
        sort: "submittedAt,desc",
      });
      setPage(d);

      // Tras cargar, marcamos pendientes como "vistos"
      await markResultsSeen();
    } catch {
      setErrorMsg("No se pudo cargar tu historial.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page, filters.size, filters.status]);

  const rows = useMemo<MySubmissionSummaryDto[]>(
    () => page?.content ?? [],
    [page?.content]
  );

  const totalElements = page?.totalElements ?? 0;
  const currentPage = (page?.page ?? 0) + 1;
  const totalPages = page?.totalPages ?? 1;

  return (
    <div className="min-h-[calc(100vh-64px)] flex justify-center bg-gray-50 px-4 py-6 dark:bg-[#1e2a34] sm:px-6 lg:px-8">
      <div className="w-full max-w-6xl space-y-4">
        <BackLink
          to="/student/assessments/available"
          label="Volver a Disponibles"
        />

        {/* Header + filtros */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Mis resultados
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Revisa tus envíos, su estado y puntaje.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="rounded-lg border px-2 py-1 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              value={filters.status}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  page: 0,
                  status: e.target.value as typeof f.status,
                }))
              }
              aria-label="Filtrar por estado"
            >
              <option value="ALL">Todos</option>
              <option value="IN_PROGRESS">En curso</option>
              <option value="SUBMITTED">Enviados</option>
              <option value="GRADED">Calificados</option>
            </select>
            <select
              className="rounded-lg border px-2 py-1 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              value={filters.size}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  page: 0,
                  size: Number(e.target.value),
                }))
              }
              aria-label="Elementos por página"
            >
              <option value={10}>10 / pág</option>
              <option value={20}>20 / pág</option>
              <option value={50}>50 / pág</option>
            </select>
            <button
              type="button"
              onClick={() => void fetchData()}
              className="rounded-lg border px-3 py-1.5 text-sm transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
            >
              Recargar
            </button>
          </div>
        </div>

        {/* Estados: loading / error / vacío / contenido */}
        {loading ? (
          <div className="rounded-2xl border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-28 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800"
                />
              ))}
            </div>
          </div>
        ) : errorMsg ? (
          <div className="rounded-2xl border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <p className="text-sm text-red-600 dark:text-red-400">{errorMsg}</p>
            <button
              type="button"
              onClick={() => void fetchData()}
              className="mt-3 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-700"
            >
              Reintentar
            </button>
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mx-auto max-w-md text-center">
              <div className="mb-2 text-base font-medium text-gray-900 dark:text-white">
                Sin envíos
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Todavía no has realizado ninguna evaluación.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Vista móvil: tarjetas */}
            <div className="space-y-3 sm:hidden">
              {rows.map((r) => {
                const sc =
                  r.score != null
                    ? `${r.score}${
                        r.maxScore != null ? ` / ${r.maxScore}` : ""
                      }`
                    : "—";
                const date = r.submittedAt ?? r.startedAt ?? r.gradedAt ?? null;

                return (
                  <article
                    key={r.submissionId}
                    className="rounded-xl border bg-white p-3 text-xs shadow-sm dark:border-gray-800 dark:bg-gray-900"
                  >
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {r.templateTitle ?? (
                          <span className="opacity-60">sin título</span>
                        )}
                      </span>
                      <StatusBadge s={r.status} />
                    </div>
                    <div className="space-y-1 text-gray-700 dark:text-gray-300">
                      <p>
                        <span className="font-medium">Fecha: </span>
                        <span className="opacity-90">{fmt(date)}</span>
                      </p>
                      <p>
                        <span className="font-medium">Aula: </span>
                        <span className="opacity-90">
                          {r.classroomName ?? "-"}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium">Intento: </span>
                        <span className="opacity-90">{r.attemptNo ?? "-"}</span>
                      </p>
                      <p>
                        <span className="font-medium">Puntaje: </span>
                        <span className="opacity-90">{sc}</span>
                      </p>
                    </div>
                    <div className="mt-2 flex justify-end">
                      <Link
                        to={`/student/assessments/result/${r.submissionId}`}
                        className="rounded-lg border px-3 py-1 text-[11px] font-medium transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
                      >
                        Ver detalle
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Vista tablet/desktop: tabla */}
            <div className="hidden overflow-x-auto rounded-2xl border bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:block">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/60">
                  <tr className="text-left text-xs uppercase tracking-wide text-gray-600 dark:text-gray-300">
                    <th className="px-4 py-2">Fecha</th>
                    <th className="px-4 py-2">Evaluación</th>
                    <th className="px-4 py-2">Aula</th>
                    <th className="px-4 py-2">Intento</th>
                    <th className="px-4 py-2">Estado</th>
                    <th className="px-4 py-2">Puntaje</th>
                    <th className="px-4 py-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const sc =
                      r.score != null
                        ? `${r.score}${
                            r.maxScore != null ? ` / ${r.maxScore}` : ""
                          }`
                        : "—";
                    const date =
                      r.submittedAt ?? r.startedAt ?? r.gradedAt ?? null;

                    return (
                      <tr
                        key={r.submissionId}
                        className="border-t text-sm text-gray-800 dark:border-gray-800 dark:text-gray-100"
                      >
                        <td className="px-4 py-2 whitespace-nowrap">
                          {fmt(date)}
                        </td>
                        <td className="px-4 py-2">
                          {r.templateTitle ?? (
                            <span className="opacity-60">sin título</span>
                          )}
                        </td>
                        <td className="px-4 py-2">{r.classroomName ?? "-"}</td>
                        <td className="px-4 py-2">{r.attemptNo ?? "-"}</td>
                        <td className="px-4 py-2">
                          <StatusBadge s={r.status} />
                        </td>
                        <td className="px-4 py-2">{sc}</td>
                        <td className="px-4 py-2">
                          <Link
                            to={`/student/assessments/result/${r.submissionId}`}
                            className="rounded-lg border px-2 py-1 text-xs transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                          >
                            Ver detalle
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Paginado (desktop) */}
              <div className="flex items-center justify-between gap-2 px-4 py-3 text-xs text-gray-700 dark:text-gray-300">
                <div>
                  Página: {currentPage} / {totalPages} · Total: {totalElements}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFilters((f) => ({
                        ...f,
                        page: Math.max(0, f.page - 1),
                      }))
                    }
                    disabled={filters.page <= 0 || loading}
                    className="rounded-lg border px-3 py-1 text-sm transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
                  >
                    ← Anterior
                  </button>
                  <span className="opacity-70">
                    {currentPage} de {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setFilters((f) =>
                        page
                          ? {
                              ...f,
                              page: Math.min(page.totalPages - 1, f.page + 1),
                            }
                          : f
                      )
                    }
                    disabled={
                      !page || filters.page >= totalPages - 1 || loading
                    }
                    className="rounded-lg border px-3 py-1 text-sm transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
                  >
                    Siguiente →
                  </button>
                </div>
              </div>
            </div>

            {/* Paginado en móvil (texto) */}
            <div className="mt-3 text-center text-xs text-gray-600 sm:hidden dark:text-gray-300">
              Página: {currentPage} / {totalPages} · Total: {totalElements}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
