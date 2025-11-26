// src/pages/teacher/assessments/AssignmentSubmissions.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useAssignmentSubmissions } from "../../../hooks/assessments/useAssignments";
import type {
  PageResponse,
  SubmissionStatus,
} from "../../../types/assessments/common";
import { exportOverviewToExcel } from "../../../utils/exportToExcel";
import { exportToCSV } from "../../../utils/exportToCsv";

/* ---------------------------- Tipos UI -----------------------------*/
type SubmissionRow = {
  id: string; // submissionId normalizado
  studentName?: string;
  studentEmail?: string;
  status: SubmissionStatus;
  score?: number;
  maxScore?: number;
  attemptNo?: number;
  durationSec?: number;
  startedAt?: string;
  submittedAt?: string;
  gradedAt?: string;
  updatedAt?: string;
  createdAt?: string;
};

type Filters = {
  status?: SubmissionStatus | "ALL";
  page?: number;
  size?: number;
};

/* ------------------------ Helpers de parseo ------------------------*/
function isObj(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}
function pickObj(o: unknown, key: string): Record<string, unknown> | undefined {
  if (!isObj(o)) return undefined;
  const v = o[key];
  return isObj(v) ? v : undefined;
}
function pickStr(o: unknown, key: string): string | undefined {
  if (!isObj(o)) return undefined;
  const v = o[key];
  return typeof v === "string" && v.trim().length > 0 ? v : undefined;
}
function pickNum(o: unknown, key: string): number | undefined {
  if (!isObj(o)) return undefined;
  const v = o[key];
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}
function pickArr(o: unknown, key: string): unknown[] | undefined {
  if (!isObj(o)) return undefined;
  const v = o[key];
  return Array.isArray(v) ? v : undefined;
}

function formatDuration(sec?: number) {
  if (!Number.isFinite(sec) || !sec) return "—";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")} min`;
}

/** Normaliza 1 fila desconocida -> SubmissionRow (o null si no hay id) */
function normalizeRow(u: unknown): SubmissionRow | null {
  if (!isObj(u)) return null;

  const subObj = pickObj(u, "submission");
  const id =
    pickStr(u, "id") ??
    pickStr(u, "submissionId") ??
    (subObj && pickStr(subObj, "id"));
  if (!id) return null;

  const statusStr = pickStr(u, "status") ?? "NOT_STARTED";
  const status = statusStr as SubmissionStatus;

  const studentObj = pickObj(u, "student");
  const studentName =
    pickStr(u, "studentName") ?? (studentObj && pickStr(studentObj, "name"));
  const studentEmail =
    pickStr(u, "studentEmail") ?? (studentObj && pickStr(studentObj, "email"));

  const score = pickNum(u, "score");
  const maxScore = pickNum(u, "maxScore");
  const attemptNo = pickNum(u, "attemptNo");
  const durationSec = pickNum(u, "durationSec");

  const startedAt = pickStr(u, "startedAt");
  const submittedAt = pickStr(u, "submittedAt");
  const gradedAt = pickStr(u, "gradedAt");
  const updatedAt = pickStr(u, "updatedAt");
  const createdAt = pickStr(u, "createdAt");

  return {
    id,
    studentName,
    studentEmail,
    status,
    score,
    maxScore,
    attemptNo,
    durationSec,
    startedAt,
    submittedAt,
    gradedAt,
    updatedAt,
    createdAt,
  };
}

/** Normaliza la página regresada por el hook -> PageResponse<SubmissionRow> */
function normalizePage(u: unknown): PageResponse<SubmissionRow> {
  const contentUnknown = pickArr(u, "content") ?? [];
  const content = contentUnknown
    .map(normalizeRow)
    .filter(Boolean) as SubmissionRow[];

  const page = pickNum(u, "page") ?? pickNum(u, "number") ?? 0;
  const size = pickNum(u, "size") ?? 20;
  const totalElements = pickNum(u, "totalElements") ?? content.length;
  const totalPages =
    pickNum(u, "totalPages") ??
    Math.max(1, Math.ceil(totalElements / (size || 1)));

  return { content, page, size, totalElements, totalPages };
}

/* ---------------------------- Componente -----------------------------*/
export default function AssignmentSubmissions() {
  const { assignmentId = "" } = useParams<{ assignmentId: string }>();
  const location = useLocation();

  const [filters, setFilters] = useState<Filters>({
    status: "ALL",
    page: 0,
    size: 20,
  });

  // Lee ?status=... cuando entras (y si cambia desde navegación)
  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const st = sp.get("status");
    if (!st) {
      // si no hay param, no toques el filtro
      return;
    }
    setFilters((p) => ({
      ...p,
      status: (st as SubmissionStatus) || "ALL",
      page: 0,
    }));
  }, [location.search]);

  const q = useAssignmentSubmissions(assignmentId, {
    status:
      filters.status && filters.status !== "ALL" ? filters.status : undefined,
    page: filters.page,
    size: filters.size,
  });

  const page = q.data ? normalizePage(q.data as unknown) : normalizePage({});
  const rows = useMemo(() => page.content ?? [], [page.content]);

  const exportXlsx = () => {
    const mapped = rows.map((r) => ({
      SubmissionId: r.id,
      Estudiante: r.studentName ?? r.studentEmail ?? "—",
      Estado: r.status,
      Intento: r.attemptNo ?? "",
      Duración: formatDuration(r.durationSec),
      Puntaje: r.score ?? "",
      Max: r.maxScore ?? "",
      Enviado: r.submittedAt ? new Date(r.submittedAt).toLocaleString() : "",
      Calificado: r.gradedAt ? new Date(r.gradedAt).toLocaleString() : "",
    }));
    exportOverviewToExcel(mapped, `submissions_${assignmentId}`);
  };

  const exportCsv = () => {
    const mapped = rows.map((r) => ({
      submissionId: r.id,
      student: r.studentName ?? r.studentEmail ?? "",
      status: r.status,
      attemptNo: typeof r.attemptNo === "number" ? r.attemptNo : "",
      durationSec: typeof r.durationSec === "number" ? r.durationSec : "",
      score: typeof r.score === "number" ? r.score : "",
      maxScore: typeof r.maxScore === "number" ? r.maxScore : "",
      submittedAt: r.submittedAt ?? "",
      gradedAt: r.gradedAt ?? "",
    }));
    exportToCSV(mapped, `submissions_${assignmentId}`);
  };

  const prev = () =>
    setFilters((p) => ({ ...p, page: Math.max(0, (p.page ?? 0) - 1) }));
  const next = () =>
    setFilters((p) => ({
      ...p,
      page:
        page.totalPages > 0
          ? Math.min(page.totalPages - 1, (p.page ?? 0) + 1)
          : 0,
    }));

  const selectFilterCls =
    "w-full rounded-lg border px-2 py-1 text-sm shadow-sm " +
    "bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100";

  return (
    <div className="min-h-[calc(100vh-64px)] w-full bg-gray-50 px-3 py-4 dark:bg-[#1e2a34] sm:px-4 md:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
            Envíos de la asignación
          </h1>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <Link
              to={`/teacher/assessments`}
              className="inline-flex w-full items-center justify-center rounded-lg border px-3 py-1.5 text-sm text-gray-800 shadow-sm transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800 sm:w-auto"
            >
              ← Volver
            </Link>
            <div className="flex w-full gap-2 sm:w-auto">
              <button
                type="button"
                onClick={exportCsv}
                className="inline-flex w-full items-center justify-center rounded-lg bg-slate-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700 sm:w-auto"
              >
                Exportar CSV
              </button>
              <button
                type="button"
                onClick={exportXlsx}
                className="inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 sm:w-auto"
              >
                Exportar XLSX
              </button>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="rounded-2xl border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex flex-col gap-1 text-sm sm:flex-1">
              <span className="text-xs text-gray-600 dark:text-gray-300">
                Estado
              </span>
              <select
                className={selectFilterCls}
                value={filters.status ?? "ALL"}
                onChange={(e) =>
                  setFilters((p) => ({
                    ...p,
                    status: e.target.value as Filters["status"],
                    page: 0,
                  }))
                }
              >
                <option value="ALL">Estado: todos</option>
                <option value="NOT_STARTED">No iniciado</option>
                <option value="IN_PROGRESS">En progreso</option>
                <option value="SUBMITTED">Enviado</option>
                <option value="GRADED">Calificado</option>
                <option value="CANCELED">Cancelado</option>
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm sm:w-40 sm:ml-auto">
              <span className="text-xs text-gray-600 dark:text-gray-300">
                Tamaño
              </span>
              <select
                className={selectFilterCls}
                value={filters.size ?? 20}
                onChange={(e) =>
                  setFilters((p) => ({
                    ...p,
                    size: Number(e.target.value),
                    page: 0,
                  }))
                }
              >
                <option value={10}>10 / pág</option>
                <option value={20}>20 / pág</option>
                <option value={50}>50 / pág</option>
              </select>
            </label>
          </div>
        </div>

        {/* Estado carga / error / tabla */}
        {q.isLoading ? (
          <div className="rounded-2xl border bg-white p-4 text-sm shadow-sm dark:border-gray-800 dark:bg-gray-900">
            Cargando…
          </div>
        ) : q.error ? (
          <div className="rounded-2xl border bg-white p-4 text-sm text-red-500 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            Error al cargar.
          </div>
        ) : (
          <div className="rounded-2xl border bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr className="text-xs uppercase tracking-wide text-gray-600 dark:text-gray-300">
                    <th className="px-3 py-2 text-left">Estudiante</th>
                    <th className="px-3 py-2 text-left">Estado</th>
                    <th className="px-3 py-2 text-left">Intento</th>
                    <th className="px-3 py-2 text-left">Duración</th>
                    <th className="px-3 py-2 text-left">Puntaje</th>
                    <th className="px-3 py-2 text-left">Actualizado</th>
                    <th className="px-3 py-2 text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((s) => (
                    <tr
                      key={s.id}
                      className="border-t text-gray-800 dark:border-gray-800 dark:text-gray-100"
                    >
                      <td className="px-3 py-2 align-top">
                        {s.studentName ?? s.studentEmail ?? "—"}
                      </td>
                      <td className="px-3 py-2 align-top">{s.status}</td>
                      <td className="px-3 py-2 align-top">
                        {s.attemptNo ?? "—"}
                      </td>
                      <td className="px-3 py-2 align-top">
                        {formatDuration(s.durationSec)}
                      </td>
                      <td className="px-3 py-2 align-top">
                        {s.score ?? "—"}
                        {typeof s.maxScore === "number"
                          ? ` / ${s.maxScore}`
                          : ""}
                      </td>
                      <td className="px-3 py-2 align-top">
                        {s.updatedAt
                          ? new Date(s.updatedAt).toLocaleString()
                          : "—"}
                      </td>
                      <td className="px-3 py-2 align-top">
                        <Link
                          to={`/teacher/assessments/${assignmentId}/submissions/${s.id}`}
                          className="inline-flex rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
                        >
                          Ver detalle →
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-3 py-8 text-center text-sm text-gray-500 dark:text-gray-300"
                      >
                        No hay envíos con los filtros actuales.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            <div className="flex flex-col items-center justify-between gap-3 px-3 py-2 text-xs text-gray-600 sm:flex-row dark:text-gray-300">
              <div className="text-center sm:text-left">
                Página: {page.page + 1} / {page.totalPages} · Total:{" "}
                {page.totalElements}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={prev}
                  disabled={(filters.page ?? 0) <= 0}
                  className="rounded-lg border px-3 py-1 text-sm transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  ← Anterior
                </button>
                <span className="opacity-70">
                  {page.page + 1} de {page.totalPages}
                </span>
                <button
                  type="button"
                  onClick={next}
                  disabled={page.page >= page.totalPages - 1}
                  className="rounded-lg border px-3 py-1 text-sm transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
