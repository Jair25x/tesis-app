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

  const page = normalizePage(q.data as unknown);
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

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Envíos de la asignación</h1>
        <div className="flex gap-2">
          <Link
            to={`/teacher/assessments`}
            className="rounded border px-3 py-1.5 text-sm hover:bg-gray-100 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
          >
            ← Volver
          </Link>
          <button
            onClick={exportCsv}
            className="rounded bg-slate-600 px-3 py-1.5 text-sm text-white hover:bg-slate-700"
          >
            Exportar CSV
          </button>
          <button
            onClick={exportXlsx}
            className="rounded bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700"
          >
            Exportar XLSX
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <select
          className="rounded border px-2 py-1 dark:border-gray-700 dark:bg-gray-800"
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

        <select
          className="ml-auto rounded border px-2 py-1 dark:border-gray-700 dark:bg-gray-800"
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
      </div>

      {q.isLoading ? (
        <p>Cargando…</p>
      ) : q.error ? (
        <p className="text-red-500">Error al cargar.</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded border">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-3 py-2 text-left">Estudiante</th>
                  <th className="px-3 py-2 text-left">Estado</th>
                  <th className="px-3 py-2 text-left">Intento</th>
                  <th className="px-3 py-2 text-left">Duración</th>
                  <th className="px-3 py-2 text-left">Puntaje</th>
                  <th className="px-3 py-2 text-left">Actualizado</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => (
                  <tr key={s.id} className="border-t dark:border-gray-700">
                    <td className="px-3 py-2">
                      {s.studentName ?? s.studentEmail ?? "—"}
                    </td>
                    <td className="px-3 py-2">{s.status}</td>
                    <td className="px-3 py-2">{s.attemptNo ?? "—"}</td>
                    <td className="px-3 py-2">
                      {formatDuration(s.durationSec)}
                    </td>
                    <td className="px-3 py-2">
                      {s.score ?? "—"}
                      {typeof s.maxScore === "number" ? ` / ${s.maxScore}` : ""}
                    </td>
                    <td className="px-3 py-2">
                      {s.updatedAt
                        ? new Date(s.updatedAt).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        to={`/teacher/assessments/${assignmentId}/submissions/${s.id}`}
                        className="rounded bg-blue-600 px-3 py-1.5 text-xs text-white hover:bg-blue-700"
                      >
                        Ver detalle →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex items-center justify-between p-2 text-xs opacity-80">
              <div>
                Página: {page.page + 1} / {page.totalPages} · Total:{" "}
                {page.totalElements}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={prev}
                  disabled={(filters.page ?? 0) <= 0}
                  className="rounded border px-2 py-1 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 disabled:opacity-50"
                >
                  ← Anterior
                </button>
                <button
                  onClick={next}
                  disabled={page.page >= page.totalPages - 1}
                  className="rounded border px-2 py-1 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 disabled:opacity-50"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
