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

function fmt(dt?: string | null) {
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
  const markResultsSeen = async () => {
    // 1) Intentamos leer el contador ya cacheado por React Query
    let cnt = qc.getQueryData<number>(
      assessmentsKeys.mySubmissionsCount("SUBMITTED")
    );

    // 2) Si no hay cache, consultamos al BE (sin sobrecargar: size=1)
    if (typeof cnt !== "number") {
      const p = await listMySubmissions({
        status: "SUBMITTED",
        page: 0,
        size: 1,
      });
      cnt = p.totalElements ?? 0;
    }

    // 3) Persistimos como "visto" y refrescamos el query del menú
    localStorage.setItem("assess:lastSeenSubmittedCount", String(cnt ?? 0));
    await qc.refetchQueries({
      queryKey: assessmentsKeys.mySubmissionsCount("SUBMITTED"),
    });
  };

  const fetchData = async () => {
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

      // 🔔 Tras cargar, marcamos pendientes como "vistos"
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

  const rows = useMemo(() => page?.content ?? [], [page?.content]);

  return (
    <div className="min-h-[calc(100vh-64px)] px-4 py-6 sm:px-6 lg:px-8 flex justify-center">
      <div className="w-full max-w-6xl space-y-4">
        <BackLink
          to="/student/assessments/available"
          label="Volver a Disponibles"
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Mis resultados
            </h1>
            <p className="text-sm opacity-80">
              Revisa tus envíos, su estado y puntaje.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              className="rounded-lg border px-2 py-1 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-950"
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
              className="rounded-lg border px-2 py-1 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-950"
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
              onClick={() => void fetchData()}
              className="rounded-lg border px-3 py-1.5 text-sm transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
            >
              Recargar
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
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
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="border-t dark:border-gray-800">
                    <td className="px-4 py-4" colSpan={7}>
                      <div className="h-5 w-full animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
                    </td>
                  </tr>
                ))
              ) : errorMsg ? (
                <tr className="border-t dark:border-gray-800">
                  <td className="px-4 py-4 text-red-600" colSpan={7}>
                    {errorMsg}
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr className="border-t dark:border-gray-800">
                  <td className="px-4 py-6 text-center opacity-70" colSpan={7}>
                    No hay envíos.
                  </td>
                </tr>
              ) : (
                rows.map((r) => {
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
                      className="border-t dark:border-gray-800"
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
                })
              )}
            </tbody>
          </table>

          {/* Paginado */}
          <div className="flex items-center justify-between gap-2 px-4 py-3 text-xs">
            <div>
              Página: {(page?.page ?? 0) + 1} / {page?.totalPages ?? 1} · Total:{" "}
              {page?.totalElements ?? 0}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setFilters((f) => ({ ...f, page: Math.max(0, f.page - 1) }))
                }
                disabled={(filters.page ?? 0) <= 0 || loading}
                className="rounded-lg border px-3 py-1 text-sm transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                ← Anterior
              </button>
              <span className="opacity-70">
                {(page?.page ?? 0) + 1} de {page?.totalPages ?? 1}
              </span>
              <button
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
                  loading ||
                  !page ||
                  (filters.page ?? 0) >= (page?.totalPages ?? 1) - 1
                }
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
