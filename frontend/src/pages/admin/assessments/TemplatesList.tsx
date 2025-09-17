// src/pages/admin/assessments/TemplatesList.tsx
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import {
  listTemplates,
  deleteTemplate,
  getTemplate,
  createTemplate,
} from "../../../services/assessmentsService";
import type { PageResponse } from "../../../types/assessments/common";
import type {
  TemplateSummaryDto,
  TemplateRequest,
  TemplateResponse,
} from "../../../types/assessments/templates";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import { showToast } from "../../../utils/showToast";
import { tGradingMode } from "../../../utils/i18nAssessments";
import type { GradingMode } from "../../../types/assessments/common";

type Filters = {
  mineOnly?: boolean;
  curriculumId?: string;
  title?: string;
  updatedFrom?: string;
  updatedTo?: string;
  includeItemSummaries?: boolean;
  page?: number;
  size?: number;
  sort?: string; // "updatedAt,desc"
};

type PendingDelete = { id: string; title?: string } | null;
type PendingDuplicate = { id: string; title?: string } | null;

/* ---------- Badges helpers ---------- */
function badgeBase(extra: string) {
  return `inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${extra}`;
}
function manualBadge(show: boolean) {
  if (!show) return null;
  return (
    <span
      className={badgeBase(
        "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200"
      )}
    >
      manual
    </span>
  );
}
function itemsBadge(count: number) {
  return (
    <span
      className={badgeBase(
        "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
      )}
    >
      {count} ítem{count === 1 ? "" : "s"}
    </span>
  );
}

export default function TemplatesList() {
  const nav = useNavigate();
  const loc = useLocation();
  const qc = useQueryClient();

  // ── Contexto de navegación: teacher vs admin ──────────────────────
  const ctx: "teacher" | "admin" = loc.pathname.startsWith("/teacher")
    ? "teacher"
    : "admin";
  const url = (suffix: string) => `/${ctx}${suffix}`;

  const [filters, setFilters] = useState<Filters>({
    mineOnly: true,
    includeItemSummaries: true,
    page: 0,
    size: 20,
    sort: "updatedAt,desc",
  });

  const [toDelete, setToDelete] = useState<PendingDelete>(null);
  const [toDuplicate, setToDuplicate] = useState<PendingDuplicate>(null);
  const [busy, setBusy] = useState(false);

  const q = useQuery({
    queryKey: ["assessments", "templates", filters],
    queryFn: () => listTemplates(filters),
    staleTime: 30_000,
  });

  const page = (q.data ?? {
    content: [],
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
  }) as PageResponse<TemplateSummaryDto>;

  const onChange = <K extends keyof Filters>(k: K, v: Filters[K]) => {
    setFilters((f) => ({
      ...f,
      [k]:
        typeof v === "string" && v.length === 0 ? (undefined as Filters[K]) : v,
      page: 0,
    }));
  };

  const clearFilters = () =>
    setFilters((f) => ({
      ...f,
      title: undefined,
      curriculumId: undefined,
      updatedFrom: undefined,
      updatedTo: undefined,
      page: 0,
    }));

  const handleUseTemplate = (tpl: TemplateSummaryDto) => {
    // Nota: el path difiere entre admin y teacher
    if (ctx === "teacher") {
      nav(
        `/teacher/assessments/new?templateId=${tpl.id}&curriculumId=${tpl.curriculumId}`
      );
    } else {
      nav(
        `/admin/assessments/assignments/new?templateId=${tpl.id}&curriculumId=${tpl.curriculumId}`
      );
    }
  };

  const rows = useMemo(() => page.content ?? [], [page.content]);

  /** Eliminar plantilla */
  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      setBusy(true);
      await deleteTemplate(toDelete.id);
      showToast.success("Plantilla eliminada");
      setToDelete(null);
      qc.invalidateQueries({ queryKey: ["assessments", "templates"] });
    } catch {
      showToast.error("No se pudo eliminar");
    } finally {
      setBusy(false);
    }
  };

  /** Duplicar plantilla (FE-only): GET -> POST con nuevo título */
  const confirmDuplicate = async () => {
    if (!toDuplicate) return;
    try {
      setBusy(true);
      const tpl: TemplateResponse = await getTemplate(toDuplicate.id);

      const body: TemplateRequest = {
        title: `${tpl.title ?? "Plantilla"} (copia)`,
        curriculumId: tpl.curriculumId,
        items: (tpl.items ?? []).map((it) => ({
          objectiveId: it.objectiveId,
          exerciseId: it.exerciseId,
          points: it.points,
          gradingMode: it.gradingMode,
        })),
        config: {
          shuffle: !!tpl.config?.shuffle,
          showFeedback: !!tpl.config?.showFeedback,
          allowHints: !!tpl.config?.allowHints,
          allowSolutionSteps: !!tpl.config?.allowSolutionSteps,
          showCorrectAfter: tpl.config?.showCorrectAfter ?? "AFTER_SUBMIT",
        },
      };

      const created = await createTemplate(body);
      showToast.success("Plantilla duplicada");
      await navigator.clipboard.writeText(created.id);
      showToast.info("ID de la copia copiado al portapapeles");
      setToDuplicate(null);
      qc.invalidateQueries({ queryKey: ["assessments", "templates"] });
    } catch {
      showToast.error("No se pudo duplicar");
    } finally {
      setBusy(false);
    }
  };

  /* ------------- UI ------------- */
  if (q.isLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] px-4 py-6 sm:px-6 lg:px-8 flex items-start justify-center">
        <div className="w-full max-w-6xl">
          <div className="rounded-2xl border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <p>Cargando…</p>
          </div>
        </div>
      </div>
    );
  }
  if (q.error) {
    return (
      <div className="min-h-[calc(100vh-64px)] px-4 py-6 sm:px-6 lg:px-8 flex items-start justify-center">
        <div className="w-full max-w-6xl">
          <div className="rounded-2xl border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <p className="text-red-500">Error al cargar.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] px-4 py-6 sm:px-6 lg:px-8 flex items-start justify-center">
      <div className="w-full max-w-6xl space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Plantillas</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Crea, duplica o gestiona plantillas de evaluación.
            </p>
          </div>
          <button
            onClick={() => nav(url("/assessments/templates/new"))}
            className="inline-flex items-center rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
          >
            + Nueva plantilla
          </button>
        </div>

        {/* Filtros */}
        <div className="rounded-2xl border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-5">
            <input
              placeholder="Título contiene…"
              aria-label="Buscar por título"
              className="rounded-lg border px-2 py-1 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-950"
              value={filters.title ?? ""}
              onChange={(e) =>
                onChange("title", e.target.value as Filters["title"])
              }
            />
            <input
              placeholder="Currículo ID"
              aria-label="Filtrar por Currículo ID"
              className="rounded-lg border px-2 py-1 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-950"
              value={filters.curriculumId ?? ""}
              onChange={(e) =>
                onChange(
                  "curriculumId",
                  e.target.value as Filters["curriculumId"]
                )
              }
            />
            <input
              type="date"
              aria-label="Desde fecha"
              className="rounded-lg border px-2 py-1 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-950"
              value={filters.updatedFrom ?? ""}
              onChange={(e) =>
                onChange(
                  "updatedFrom",
                  e.target.value as Filters["updatedFrom"]
                )
              }
            />
            <input
              type="date"
              aria-label="Hasta fecha"
              className="rounded-lg border px-2 py-1 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-950"
              value={filters.updatedTo ?? ""}
              onChange={(e) =>
                onChange("updatedTo", e.target.value as Filters["updatedTo"])
              }
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!filters.mineOnly}
                onChange={(e) =>
                  onChange("mineOnly", e.target.checked as Filters["mineOnly"])
                }
              />
              Solo mías
            </label>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!filters.includeItemSummaries}
                onChange={(e) =>
                  onChange(
                    "includeItemSummaries",
                    e.target.checked as Filters["includeItemSummaries"]
                  )
                }
              />
              Incluir resumen de ítems
            </label>

            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs opacity-70">Orden</span>
              <select
                className="rounded-lg border px-2 py-1 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-950"
                value={filters.sort ?? "updatedAt,desc"}
                onChange={(e) =>
                  onChange("sort", e.target.value as Filters["sort"])
                }
                aria-label="Ordenar por"
              >
                <option value="updatedAt,desc">Actualizado ↓</option>
                <option value="updatedAt,asc">Actualizado ↑</option>
                <option value="createdAt,desc">Creación ↓</option>
                <option value="createdAt,asc">Creación ↑</option>
              </select>

              <span className="ml-2 text-xs opacity-70">Tamaño</span>
              <select
                className="rounded-lg border px-2 py-1 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-950"
                value={filters.size ?? 20}
                onChange={(e) =>
                  onChange("size", Number(e.target.value) as Filters["size"])
                }
                aria-label="Elementos por página"
              >
                <option value={10}>10 / pág</option>
                <option value={20}>20 / pág</option>
                <option value={50}>50 / pág</option>
              </select>

              <button
                onClick={clearFilters}
                className="rounded-lg border px-3 py-1.5 text-xs transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
              >
                Limpiar filtros
              </button>
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
                  <th className="px-4 py-2">Título</th>
                  <th className="px-4 py-2">Currículo</th>
                  <th className="px-4 py-2">Ítems</th>
                  <th className="px-4 py-2">Actualizado</th>
                  <th className="px-4 py-2">Opciones</th>
                </tr>
              </thead>

              {rows.length === 0 ? (
                <tbody>
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center">
                      <div className="mx-auto max-w-md">
                        <div className="mb-2 text-base font-medium">
                          Sin plantillas
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          No hay resultados con los filtros actuales.
                        </p>
                        <div className="mt-4">
                          <button
                            onClick={() =>
                              nav(url("/assessments/templates/new"))
                            }
                            className="inline-flex items-center rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
                          >
                            Crear una plantilla
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody>
                  {rows.map((t) => (
                    <tr key={t.id} className="border-t dark:border-gray-800">
                      <td className="px-4 py-2 align-top">
                        <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs dark:bg-slate-800">
                          {t.id}
                        </code>
                      </td>
                      <td className="px-4 py-2 align-top">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">{t.title}</span>
                          {manualBadge(!!t.hasManualItems)}
                          {itemsBadge(t.itemsCount)}
                        </div>

                        {filters.includeItemSummaries &&
                          t.itemSummaries &&
                          t.itemSummaries.length > 0 && (
                            <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                              {t.itemSummaries.slice(0, 3).map((it) => (
                                <div
                                  key={`${it.exerciseId}-${it.position ?? ""}`}
                                >
                                  • {String(it.objectiveId).slice(0, 8)}… /{" "}
                                  {String(it.exerciseId).slice(0, 8)}… ·{" "}
                                  {typeof it.points === "number"
                                    ? `${it.points} pts`
                                    : "—"}{" "}
                                  ·{" "}
                                  {tGradingMode(
                                    it.gradingMode as GradingMode | undefined
                                  )}
                                </div>
                              ))}
                              {t.itemSummaries.length > 3 && (
                                <div>… +{t.itemSummaries.length - 3} más</div>
                              )}
                            </div>
                          )}
                      </td>
                      <td className="px-4 py-2 align-top">
                        <span className="text-xs opacity-80">
                          {t.curriculumId}
                        </span>
                      </td>
                      <td className="px-4 py-2 align-top">{t.itemsCount}</td>
                      <td className="px-4 py-2 align-top">
                        {t.updatedAt
                          ? new Date(t.updatedAt).toLocaleString()
                          : "—"}
                      </td>
                      <td className="px-4 py-2 align-top">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleUseTemplate(t)}
                            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-700"
                          >
                            Usar
                          </button>
                          <button
                            onClick={() =>
                              nav(url(`/assessments/templates/${t.id}/edit`))
                            }
                            className="rounded-lg border px-3 py-1.5 text-xs transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() =>
                              setToDuplicate({ id: t.id, title: t.title })
                            }
                            className="rounded-lg border px-3 py-1.5 text-xs transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
                          >
                            Duplicar
                          </button>
                          <button
                            onClick={() =>
                              setToDelete({ id: t.id, title: t.title })
                            }
                            className="rounded-lg border border-rose-600 px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50 dark:hover:bg-rose-900/20"
                          >
                            Eliminar
                          </button>
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
              Página: {page.page + 1} / {page.totalPages} · Total:{" "}
              {page.totalElements}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setFilters((f) => ({
                    ...f,
                    page: Math.max(0, (f.page ?? 0) - 1),
                  }))
                }
                disabled={(page.page ?? 0) <= 0}
                className="rounded-lg border px-3 py-1 text-sm transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                ← Anterior
              </button>
              <span className="opacity-70">
                {page.page + 1} de {page.totalPages}
              </span>
              <button
                onClick={() =>
                  setFilters((f) => ({
                    ...f,
                    page: Math.min(
                      (page.page ?? 0) + 1,
                      Math.max(0, page.totalPages - 1)
                    ),
                  }))
                }
                disabled={page.page + 1 >= page.totalPages}
                className="rounded-lg border px-3 py-1 text-sm transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                Siguiente →
              </button>
            </div>
          </div>
        </div>

        {/* Modales */}
        <ConfirmModal
          isOpen={!!toDelete}
          onClose={() => setToDelete(null)}
          onConfirm={confirmDelete}
          title="¿Eliminar plantilla?"
          description={
            toDelete?.title
              ? `Se eliminará “${toDelete.title}”. Esta acción no se puede deshacer.`
              : "Se eliminará la plantilla. Esta acción no se puede deshacer."
          }
          variant="danger"
          isLoading={busy}
        />

        <ConfirmModal
          isOpen={!!toDuplicate}
          onClose={() => setToDuplicate(null)}
          onConfirm={confirmDuplicate}
          title="¿Duplicar plantilla?"
          description={
            toDuplicate?.title
              ? `Se creará una copia de “${toDuplicate.title}”.`
              : "Se creará una copia de la plantilla."
          }
          variant="warning"
          isLoading={busy}
        />
      </div>
    </div>
  );
}
