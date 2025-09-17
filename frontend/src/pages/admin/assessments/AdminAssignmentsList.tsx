// src/pages/admin/assessments/AdminAssignmentsList.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  useAssignmentsList,
  useAssignmentMutations,
} from "../../../hooks/assessments/useAssignments";
import type {
  AssignmentScope,
  AssignmentState,
  AssignmentType,
  PageResponse,
  UUID,
} from "../../../types/assessments/common";
import type { AssignmentSummaryResponse } from "../../../types/assessments/assignments";
import type { AssignmentListFilters } from "../../../services/assessmentsService";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import { useAuth } from "../../../context/useAuth";

/* ---------- Badges helpers ---------- */
const badge = (cls: string, txt: string) => (
  <span
    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${cls}`}
  >
    {txt}
  </span>
);

const stateBadge = (state?: AssignmentState) => {
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
};

const typeBadge = (t?: AssignmentType) => {
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
};

const scopeBadge = (s?: AssignmentScope) => {
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
};

/* ---------- Filtros (server-side) ---------- */
type Filters = Pick<
  AssignmentListFilters,
  | "state"
  | "type"
  | "scope"
  | "page"
  | "size"
  | "sort"
  | "createdByMe"
  | "createdByUserId"
>;

type PendingAction =
  | { action: "publish" | "close"; id: string }
  | { action: "clone"; id: string }
  | null;

function fmtWindow(a: AssignmentSummaryResponse) {
  const hasFrom = !!a.windowStart;
  const hasTo = !!a.windowEnd;
  if (!hasFrom && !hasTo) return "Siempre abierta";
  const from = hasFrom
    ? new Date(a.windowStart as string).toLocaleString()
    : "—";
  const to = hasTo ? new Date(a.windowEnd as string).toLocaleString() : "—";
  return `${from} → ${to}`;
}
// Pequeño type-guard para evitar any
function hasUuid(u: unknown): u is { uuid: string } {
  return (
    !!u &&
    typeof u === "object" &&
    "uuid" in (u as Record<string, unknown>) &&
    typeof (u as Record<string, unknown>).uuid === "string"
  );
}

export default function AdminAssignmentsList() {
  const { user } = useAuth();
  /** Usaremos el botón "Yo" sólo si el perfil expone uuid:string */
  const myCreatorUuid: UUID | null = hasUuid(user) ? (user.uuid as UUID) : null;

  const [filters, setFilters] = useState<Filters>({
    page: 0,
    size: 20,
    sort: "createdAt,desc",
    createdByMe: false, // por defecto: ver todas
    createdByUserId: null,
  });
  const [confirm, setConfirm] = useState<PendingAction>(null);

  const { data, isLoading, error } = useAssignmentsList(filters);
  const { publishM, closeM, cloneM } = useAssignmentMutations();

  const page = data as PageResponse<AssignmentSummaryResponse> | undefined;
  const rows = page?.content ?? [];
  const isMutating = publishM.isPending || closeM.isPending || cloneM.isPending;

  function onChange<K extends keyof Filters>(k: K, v: string) {
    setFilters((prev) => ({
      ...prev,
      [k]: (v ? (v as Filters[K]) : undefined) as Filters[K],
      page: 0,
    }));
  }

  function setCreatedByUserId(v: string) {
    const clean = v.trim();
    setFilters((prev) => ({
      ...prev,
      createdByUserId: clean ? (clean as UUID) : null,
      // Si especificas un creador concreto, no tiene sentido createdByMe
      createdByMe: false,
      page: 0,
    }));
  }

  async function doConfirm() {
    if (!confirm) return;
    try {
      if (confirm.action === "publish") await publishM.mutateAsync(confirm.id);
      else if (confirm.action === "close") await closeM.mutateAsync(confirm.id);
      else if (confirm.action === "clone") await cloneM.mutateAsync(confirm.id);
    } finally {
      setConfirm(null);
    }
  }

  /* ---------- UI ---------- */
  if (isLoading)
    return (
      <div className="min-h-[calc(100vh-64px)] px-4 py-6 sm:px-6 lg:px-8 flex items-start justify-center">
        <div className="w-full max-w-7xl">
          <div className="rounded-2xl border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <p>Cargando…</p>
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-[calc(100vh-64px)] px-4 py-6 sm:px-6 lg:px-8 flex items-start justify-center">
        <div className="w-full max-w-7xl">
          <div className="rounded-2xl border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <p className="text-red-500">Error al cargar.</p>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-[calc(100vh-64px)] px-4 py-6 sm:px-6 lg:px-8 flex items-start justify-center">
      <div className="w-full max-w-7xl space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Asignaciones (Admin)
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Gestiona y monitorea todas las asignaciones creadas.
            </p>
          </div>
          <Link
            to="/admin/assessments/assignments/new"
            className="inline-flex items-center rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
          >
            + Nueva asignación
          </Link>
        </div>

        {/* Filtros */}
        <div className="rounded-2xl border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-center">
            {/* Estado */}
            <label className="flex items-center gap-2 text-sm">
              <span className="w-24 text-gray-600 dark:text-gray-300">
                Estado
              </span>
              <select
                className="rounded-lg border px-2 py-1 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-950"
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

            {/* Tipo */}
            <label className="flex items-center gap-2 text-sm">
              <span className="w-24 text-gray-600 dark:text-gray-300">
                Tipo
              </span>
              <select
                className="rounded-lg border px-2 py-1 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-950"
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

            {/* Alcance */}
            <label className="flex items-center gap-2 text-sm">
              <span className="w-24 text-gray-600 dark:text-gray-300">
                Alcance
              </span>
              <select
                className="rounded-lg border px-2 py-1 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-950"
                value={filters.scope ?? ""}
                onChange={(e) => onChange("scope", e.target.value)}
                aria-label="Filtrar por alcance"
              >
                <option value="">Todos</option>
                <option value="CLASSROOM">Aula</option>
                <option value="PUBLIC">Pública</option>
              </select>
            </label>

            {/* Solo mías */}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!filters.createdByMe}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    createdByMe: e.target.checked,
                    // si activas "solo mías", limpiamos creador específico
                    createdByUserId: null,
                    page: 0,
                  }))
                }
              />
              Solo mis asignaciones
            </label>

            {/* Creador (UUID) */}
            <div className="flex items-center gap-2 text-sm">
              <span className="w-24 text-gray-600 dark:text-gray-300">
                Creador
              </span>
              <input
                type="text"
                placeholder="UUID del creador"
                className="w-full rounded-lg border px-2 py-1 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-950"
                value={filters.createdByUserId ?? ""}
                onChange={(e) => setCreatedByUserId(e.target.value)}
              />
              <button
                type="button"
                className="rounded-md border px-2 py-1 text-xs dark:border-gray-700 dark:hover:bg-gray-800 disabled:opacity-50"
                onClick={() => {
                  if (!myCreatorUuid) return;
                  setFilters((f) => ({
                    ...f,
                    createdByUserId: myCreatorUuid,
                    createdByMe: false, // redundante si ya tenemos el UUID exacto
                    page: 0,
                  }));
                }}
                title={
                  myCreatorUuid ? "Usar mi UUID" : "Tu perfil no expone UUID"
                }
                disabled={!myCreatorUuid}
              >
                Yo
              </button>
              {filters.createdByUserId && (
                <button
                  type="button"
                  className="rounded-md border px-2 py-1 text-xs dark:border-gray-700 dark:hover:bg-gray-800"
                  onClick={() =>
                    setFilters((f) => ({
                      ...f,
                      createdByUserId: null,
                      page: 0,
                    }))
                  }
                  title="Limpiar creador"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Orden */}
            <div className="flex items-center gap-2 text-sm">
              <span className="w-24 text-gray-600 dark:text-gray-300">
                Orden
              </span>
              <select
                className="rounded-lg border px-2 py-1 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-950"
                value={filters.sort ?? "createdAt,desc"}
                onChange={(e) => onChange("sort", e.target.value)}
                aria-label="Ordenar por"
              >
                <option value="createdAt,desc">Recientes primero</option>
                <option value="createdAt,asc">Antiguas primero</option>
                <option value="windowStart,desc">Ventana (↓)</option>
                <option value="windowStart,asc">Ventana (↑)</option>
              </select>
            </div>

            {/* Tamaño */}
            <div className="flex items-center gap-2 text-sm">
              <span className="w-24 text-gray-600 dark:text-gray-300">
                Tamaño
              </span>
              <select
                className="rounded-lg border px-2 py-1 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-950"
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
        <div className="rounded-2xl border bg-white p-0 shadow-sm dark:border-gray-800 dark:bg-gray-900">
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
                  <th className="px-4 py-2">Acciones</th>
                </tr>
              </thead>

              {(rows ?? []).length === 0 ? (
                <tbody>
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center">
                      <div className="mx-auto max-w-md">
                        <div className="mb-2 text-base font-medium">
                          Sin asignaciones
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          No hay resultados con los filtros actuales.
                        </p>
                        <div className="mt-4">
                          <Link
                            to="/admin/assessments/assignments/new"
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
                  {rows.map((a) => (
                    <tr key={a.id} className="border-t dark:border-gray-800">
                      <td className="px-4 py-2 align-top">
                        <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs dark:bg-slate-800">
                          {a.id}
                        </code>
                      </td>
                      <td className="px-4 py-2 align-top">
                        <div className="font-medium">
                          {a.templateTitle ?? (
                            <span className="opacity-60">sin título</span>
                          )}
                        </div>
                        {(a.classroomName || a.classroomId) && (
                          <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                            Aula: {a.classroomName ?? a.classroomId}
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
                        <div className="text-xs">{fmtWindow(a)}</div>
                      </td>
                      <td className="px-4 py-2 align-top">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            to={`/teacher/assessments/${a.id}/overview`}
                            className="rounded-lg border px-3 py-1.5 text-xs transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
                            title="Resumen"
                          >
                            Resumen
                          </Link>
                          <Link
                            to={`/teacher/assessments/${a.id}/submissions`}
                            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
                            title="Ver envíos"
                          >
                            Ver envíos
                          </Link>
                          <button
                            onClick={() =>
                              setConfirm({ action: "clone", id: a.id })
                            }
                            className="rounded-lg border px-3 py-1.5 text-xs transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
                            title="Clonar borrador"
                          >
                            Clonar
                          </button>
                          {a.state === "DRAFT" && (
                            <button
                              onClick={() =>
                                setConfirm({ action: "publish", id: a.id })
                              }
                              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-700"
                              title="Publicar"
                            >
                              Publicar
                            </button>
                          )}
                          {a.state === "PUBLISHED" && (
                            <button
                              onClick={() =>
                                setConfirm({ action: "close", id: a.id })
                              }
                              className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-rose-700"
                              title="Cerrar"
                            >
                              Cerrar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
          </div>

          {/* Footer tabla */}
          <div className="flex flex-col items-center justify-between gap-3 px-4 py-3 text-xs text-gray-600 sm:flex-row dark:text-gray-300">
            <div>
              Página: {(page?.page ?? 0) + 1} / {page?.totalPages ?? 1} · Total:{" "}
              {page?.totalElements ?? 0}
              {filters.createdByMe && (
                <span className="ml-2 opacity-70">(solo las tuyas)</span>
              )}
              {filters.createdByUserId && (
                <span className="ml-2 opacity-70">
                  (creador: {filters.createdByUserId})
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={(page?.page ?? 0) <= 0}
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
                {(page?.page ?? 0) + 1} de {page?.totalPages ?? 1}
              </span>
              <button
                disabled={(page?.page ?? 0) + 1 >= (page?.totalPages ?? 1)}
                onClick={() =>
                  setFilters((f) => ({
                    ...f,
                    page: Math.min(
                      (page?.page ?? 0) + 1,
                      Math.max(0, (page?.totalPages ?? 1) - 1)
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
          isOpen={
            !!confirm &&
            (confirm.action === "publish" || confirm.action === "close")
          }
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
          isOpen={!!confirm && confirm.action === "clone"}
          onClose={() => setConfirm(null)}
          onConfirm={doConfirm}
          title="¿Clonar esta asignación?"
          description="Se creará un borrador con la misma configuración."
          variant="warning"
          isLoading={isMutating}
        />
      </div>
    </div>
  );
}
