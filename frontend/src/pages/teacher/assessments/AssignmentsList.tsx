import { useState } from "react";
import { Link } from "react-router-dom";
import {
  useAssignmentsList,
  useAssignmentMutations,
} from "../../../hooks/assessments/useAssignments";
import type {
  AssignmentState,
  AssignmentType,
  AssignmentScope,
  PageResponse,
} from "../../../types/assessments/common";
import type { AssignmentSummaryResponse } from "../../../types/assessments/assignments";
import ConfirmModal from "../../../components/ui/ConfirmModal";

/* ---------- Tipos y helpers Fase Diagnóstico ---------- */
type DiagnosticPhase = "INITIAL" | "MID" | "FINAL";

const phaseLabel: Record<DiagnosticPhase, string> = {
  INITIAL: "Inicial",
  MID: "Intermedia",
  FINAL: "Final",
};

// lectura defensiva de un path
function pick(obj: unknown, path: string[]): unknown {
  let cur: unknown = obj;
  for (const k of path) {
    if (!cur || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[k];
  }
  return cur;
}

// intenta obtener phase desde múltiples ubicaciones posibles del DTO
function getDiagnosticPhase(a: unknown): DiagnosticPhase | null {
  const cands = [
    pick(a, ["templateConfigJson", "phase"]),
    pick(a, ["template", "configJson", "phase"]),
    pick(a, ["configJson", "phase"]),
    (a as Record<string, unknown> | null)?.phase,
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

const phaseBadge = (p: DiagnosticPhase | null) =>
  p
    ? badge(
        "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-200 dark:ring-amber-800",
        `Fase: ${phaseLabel[p]}`
      )
    : null;

/* ---------- Badges helpers ---------- */
const badge = (cls: string, txt: string) => (
  <span
    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${cls}`}
  >
    {txt}
  </span>
);

function stateBadge(state?: AssignmentState) {
  switch (state) {
    case "DRAFT":
      return badge(
        "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
        "Borrador"
      );
    case "PUBLISHED":
      return badge(
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200",
        "Publicada"
      );
    case "CLOSED":
      return badge(
        "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200",
        "Cerrada"
      );
    default:
      return badge(
        "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
        "—"
      );
  }
}

function typeBadge(t?: AssignmentType) {
  switch (t) {
    case "DIAGNOSTIC":
      return badge(
        "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200",
        "Diagnóstico"
      );
    case "FORMATIVE":
      return badge(
        "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200",
        "Formativa"
      );
    case "SUMMATIVE":
      return badge(
        "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-200",
        "Sumativa"
      );
    default:
      return badge(
        "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
        "—"
      );
  }
}

function scopeBadge(s?: AssignmentScope) {
  switch (s) {
    case "CLASSROOM":
      return badge(
        "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-200",
        "Aula"
      );
    case "PUBLIC":
      return badge(
        "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
        "Pública"
      );
    default:
      return badge(
        "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
        "—"
      );
  }
}

type Filters = {
  state?: AssignmentState;
  type?: AssignmentType;
  scope?: AssignmentScope;
  page?: number;
  size?: number;
};

type PendingAction = { action: "publish" | "close"; id: string } | null;

export default function AssignmentsList() {
  const [filters, setFilters] = useState<Filters>({ page: 0, size: 20 });
  const [confirm, setConfirm] = useState<PendingAction>(null);
  const [cloningId, setCloningId] = useState<string | null>(null);

  const { data, isLoading, error } = useAssignmentsList(filters);
  const { publishM, closeM, cloneM } = useAssignmentMutations();

  const doConfirm = async () => {
    if (!confirm) return;
    try {
      if (confirm.action === "publish") {
        await publishM.mutateAsync(confirm.id);
      } else {
        await closeM.mutateAsync(confirm.id);
      }
    } finally {
      setConfirm(null);
    }
  };

  const isMutating = publishM.isPending || closeM.isPending || cloneM.isPending;

  function onChange<K extends keyof Filters>(k: K, v: string) {
    setFilters((prev) => ({
      ...prev,
      [k]: v ? (v as Filters[K]) : undefined,
      page: 0,
    }));
  }

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] w-full bg-gray-50 px-3 py-4 dark:bg-[#1e2a34] sm:px-4 md:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-6xl items-start justify-center">
          <div className="w-full">
            <div className="rounded-2xl border bg-white p-6 text-sm shadow-sm dark:border-gray-800 dark:bg-gray-900">
              Cargando…
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-64px)] w-full bg-gray-50 px-3 py-4 dark:bg-[#1e2a34] sm:px-4 md:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-6xl items-start justify-center">
          <div className="w-full">
            <div className="rounded-2xl border bg-white p-6 text-sm shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <p className="text-red-500">Error al cargar.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const page = data as PageResponse<AssignmentSummaryResponse>;

  const selectFilterCls =
    "w-full rounded-lg border px-2 py-1 text-sm shadow-sm " +
    "bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100";

  return (
    <div className="min-h-[calc(100vh-64px)] w-full bg-gray-50 px-3 py-4 dark:bg-[#1e2a34] sm:px-4 md:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl items-start justify-center">
        <div className="w-full space-y-4">
          {/* Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Mis asignaciones
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Gestiona estado, ventana y accede a envíos y resumen.
              </p>
            </div>
            <div className="flex w-full justify-start sm:w-auto sm:justify-end">
              <Link
                to="/teacher/assessments/new"
                className="inline-flex w-full items-center justify-center rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 sm:w-auto"
              >
                + Nueva asignación
              </Link>
            </div>
          </div>

          {/* Filtros */}
          <div className="rounded-2xl border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
              <label className="flex flex-col gap-1 text-sm sm:flex-1">
                <span className="text-xs text-gray-600 dark:text-gray-300">
                  Estado
                </span>
                <select
                  className={selectFilterCls}
                  value={filters.state ?? ""}
                  onChange={(e) => onChange("state", e.target.value)}
                  aria-label="Filtrar por estado"
                >
                  <option value="">Todos</option>
                  <option value="DRAFT">Borrador</option>
                  <option value="PUBLISHED">Publicada</option>
                  <option value="CLOSED">Cerrada</option>
                </select>
              </label>

              <label className="flex flex-col gap-1 text-sm sm:flex-1">
                <span className="text-xs text-gray-600 dark:text-gray-300">
                  Tipo
                </span>
                <select
                  className={selectFilterCls}
                  value={filters.type ?? ""}
                  onChange={(e) => onChange("type", e.target.value)}
                  aria-label="Filtrar por tipo"
                >
                  <option value="">Todos</option>
                  <option value="DIAGNOSTIC">Diagnóstico</option>
                  <option value="FORMATIVE">Formativa</option>
                  <option value="SUMMATIVE">Sumativa</option>
                </select>
              </label>

              <label className="flex flex-col gap-1 text-sm sm:flex-1">
                <span className="text-xs text-gray-600 dark:text-gray-300">
                  Alcance
                </span>
                <select
                  className={selectFilterCls}
                  value={filters.scope ?? ""}
                  onChange={(e) => onChange("scope", e.target.value)}
                  aria-label="Filtrar por alcance"
                >
                  <option value="">Todos</option>
                  <option value="CLASSROOM">Aula</option>
                  <option value="PUBLIC">Pública</option>
                </select>
              </label>

              <div className="flex flex-col gap-1 text-sm sm:ml-auto sm:w-auto">
                <span className="text-xs text-gray-600 dark:text-gray-300">
                  Tamaño
                </span>
                <select
                  className={selectFilterCls}
                  value={filters.size ?? 20}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      size: Number(e.target.value),
                      page: 0,
                    }))
                  }
                  aria-label="Elementos por página"
                >
                  <option value={10}>10 / pág</option>
                  <option value={20}>20 / pág</option>
                  <option value={50}>50 / pág</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tabla */}
          <div className="rounded-2xl border bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left dark:bg-gray-800/60">
                  <tr className="text-xs uppercase tracking-wide text-gray-600 dark:text-gray-300">
                    <th className="px-4 py-2">ID</th>
                    <th className="px-4 py-2">Plantilla</th>
                    <th className="px-4 py-2">Tipo</th>
                    <th className="px-4 py-2">Alcance</th>
                    <th className="px-4 py-2">Estado</th>
                    <th className="px-4 py-2">Ventana</th>
                    <th className="px-4 py-2">Opciones</th>
                  </tr>
                </thead>

                {page.content.length === 0 ? (
                  <tbody>
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center">
                        <div className="mx-auto max-w-md">
                          <div className="mb-2 text-base font-medium text-gray-900 dark:text-white">
                            Sin asignaciones
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            No hay resultados con los filtros actuales.
                          </p>
                          <div className="mt-4">
                            <Link
                              to="/teacher/assessments/new"
                              className="inline-flex items-center rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
                            >
                              Crear una asignación
                            </Link>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                ) : (
                  <tbody>
                    {page.content.map((a) => {
                      const phase =
                        a.type === "DIAGNOSTIC" ? getDiagnosticPhase(a) : null;
                      return (
                        <tr
                          key={a.id}
                          className="border-t text-gray-800 dark:border-gray-800 dark:text-gray-100"
                        >
                          <td className="px-4 py-2 align-top">
                            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs dark:bg-slate-800">
                              {a.id}
                            </code>
                          </td>
                          <td className="px-4 py-2 align-top">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {a.templateTitle ?? (
                                <span className="opacity-60">sin título</span>
                              )}
                            </div>
                            {(a.classroomName || a.classroomId) && (
                              <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                Aula: {a.classroomName ?? a.classroomId}
                              </div>
                            )}
                            {phase && (
                              <div className="mt-1 text-xs">
                                {phaseBadge(phase)}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-2 align-top">
                            {typeBadge(a.type)}
                          </td>
                          <td className="px-4 py-2 align-top">
                            {scopeBadge(a.scope)}
                          </td>
                          <td className="px-4 py-2 align-top">
                            {stateBadge(a.state)}
                          </td>
                          <td className="px-4 py-2 align-top">
                            <div className="text-xs text-gray-800 dark:text-gray-200">
                              {a.windowStart
                                ? new Date(a.windowStart).toLocaleString()
                                : "—"}{" "}
                              <span className="opacity-60">→</span>{" "}
                              {a.windowEnd
                                ? new Date(a.windowEnd).toLocaleString()
                                : "—"}
                            </div>
                          </td>
                          <td className="px-4 py-2 align-top">
                            <div className="flex flex-wrap gap-2">
                              <Link
                                to={`/teacher/assessments/${a.id}/overview`}
                                className="rounded-lg border px-3 py-1.5 text-xs transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
                              >
                                Resumen
                              </Link>
                              <Link
                                to={`/teacher/assessments/${a.id}/submissions`}
                                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
                              >
                                Ver envíos
                              </Link>

                              <button
                                type="button"
                                onClick={() => setCloningId(a.id)}
                                className="rounded-lg border px-3 py-1.5 text-xs transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
                              >
                                Clonar
                              </button>

                              {a.state === "DRAFT" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setConfirm({
                                      action: "publish",
                                      id: a.id,
                                    })
                                  }
                                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-700"
                                >
                                  Publicar
                                </button>
                              )}

                              {a.state === "PUBLISHED" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setConfirm({
                                      action: "close",
                                      id: a.id,
                                    })
                                  }
                                  className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-rose-700"
                                >
                                  Cerrar
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                )}
              </table>
            </div>

            {/* Footer tabla */}
            <div className="flex flex-col items-center justify-between gap-3 px-4 py-3 text-xs text-gray-600 sm:flex-row dark:text-gray-300">
              <div className="text-center sm:text-left">
                Página: {page.page + 1} / {page.totalPages} · Total:{" "}
                {page.totalElements}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={(page.page ?? 0) <= 0}
                  onClick={() =>
                    setFilters((f) => ({
                      ...f,
                      page: Math.max(0, (f.page ?? 0) - 1),
                    }))
                  }
                  className="rounded-lg border px-3 py-1 text-sm transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  ← Anterior
                </button>
                <span className="opacity-70">
                  {page.page + 1} de {page.totalPages}
                </span>
                <button
                  type="button"
                  disabled={page.page + 1 >= page.totalPages}
                  onClick={() =>
                    setFilters((f) => ({
                      ...f,
                      page: Math.min(
                        (page.page ?? 0) + 1,
                        Math.max(0, page.totalPages - 1)
                      ),
                    }))
                  }
                  className="rounded-lg border px-3 py-1 text-sm transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          </div>

          {/* Modales */}
          <ConfirmModal
            isOpen={!!confirm}
            onClose={() => setConfirm(null)}
            onConfirm={doConfirm}
            title={
              confirm?.action === "publish"
                ? "¿Publicar esta asignación?"
                : "¿Cerrar esta asignación?"
            }
            description={
              confirm?.action === "publish"
                ? "Los estudiantes podrán comenzarla dentro de la ventana definida."
                : "Los estudiantes ya no podrán enviar nuevos intentos."
            }
            variant={confirm?.action === "publish" ? "success" : "danger"}
            isLoading={isMutating}
          />

          <ConfirmModal
            isOpen={!!cloningId}
            onClose={() => setCloningId(null)}
            onConfirm={async () => {
              if (!cloningId) return;
              await cloneM.mutateAsync(cloningId);
              setCloningId(null);
            }}
            title="¿Clonar esta asignación?"
            description="Se creará un borrador con la misma configuración."
            variant="warning"
            isLoading={cloneM.isPending}
          />
        </div>
      </div>
    </div>
  );
}
