// src/pages/student/assessments/AvailableAssignments.tsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useAvailableAssignments,
  useStartAssignment,
} from "../../../hooks/assessments/useStudentAssessments";
import type { StudentAssignmentSummaryResponse } from "../../../types/assessments/student";
import { tAssignmentType, tScope } from "../../../utils/i18nAssessments";
import { showToast } from "../../../utils/showToast";

/* ---------- Helpers UI ---------- */
function badge(extra: string, text: string) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${extra}`}
    >
      {text}
    </span>
  );
}

function TypeBadge({
  type,
}: {
  type: StudentAssignmentSummaryResponse["type"];
}) {
  const color: Record<string, string> = {
    DIAGNOSTIC: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-200",
    FORMATIVE:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200",
    SUMMATIVE:
      "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-200",
  };
  return badge(color[type] ?? color.FORMATIVE, tAssignmentType(type));
}

function ScopeBadge({
  scope,
}: {
  scope: StudentAssignmentSummaryResponse["scope"];
}) {
  const color: Record<string, string> = {
    CLASSROOM:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200",
    PUBLIC: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  };
  return badge(color[scope] ?? color.PUBLIC, tScope(scope));
}

function StatusBadge({
  started,
  submitted,
}: {
  started: boolean;
  submitted: boolean;
}) {
  if (submitted) {
    return badge(
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200",
      "enviada"
    );
  }
  if (started) {
    return badge(
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200",
      "en curso"
    );
  }
  return null;
}

function ActiveNowBadge() {
  return badge(
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200",
    "activa ahora"
  );
}

function formatWindow(a: StudentAssignmentSummaryResponse): string {
  const hasFrom = !!a.windowStart;
  const hasTo = !!a.windowEnd;
  if (!hasFrom && !hasTo) return "Siempre abierta";
  const from = hasFrom
    ? new Date(a.windowStart as string).toLocaleString()
    : "—";
  const to = hasTo ? new Date(a.windowEnd as string).toLocaleString() : "—";
  return `${from} → ${to}`;
}

function groupBy<T>(arr: T[], keyFn: (x: T) => string): Record<string, T[]> {
  return arr.reduce<Record<string, T[]>>((acc, item) => {
    const k = keyFn(item);
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {});
}

/* ---------- Componente ---------- */
export default function AvailableAssignments() {
  const nav = useNavigate();

  // Filtros de servidor (paginado). Minimal: sólo page/size
  const [filters, setFilters] = useState<{ page: number; size: number }>({
    page: 0,
    size: 20,
  });

  // Filtros de UI (client-side)
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [classroomFilter, setClassroomFilter] = useState<string | "ALL">("ALL");

  const {
    data: page,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useAvailableAssignments({
    page: filters.page,
    size: filters.size,
  });

  const rowsAll = page?.content ?? [];

  // Filtro local “Solo disponibles/activas”
  const rowsFiltered = useMemo(() => {
    const base = onlyAvailable
      ? rowsAll.filter((a) => a.canStart || a.started)
      : rowsAll;
    if (classroomFilter === "ALL") return base;
    return base.filter(
      (a) => (a.classroomName ?? "Sin aula") === classroomFilter
    );
  }, [rowsAll, onlyAvailable, classroomFilter]);

  // Separación por scope
  const classroomRows = useMemo(
    () => rowsFiltered.filter((a) => a.scope === "CLASSROOM"),
    [rowsFiltered]
  );
  const publicRows = useMemo(
    () => rowsFiltered.filter((a) => a.scope === "PUBLIC"),
    [rowsFiltered]
  );

  // Opciones de aula
  const classroomOptions = useMemo(() => {
    const names = Array.from(
      new Set(
        rowsAll
          .filter((x) => x.scope === "CLASSROOM")
          .map((x) => x.classroomName ?? "Sin aula")
      )
    ).sort((a, b) => {
      if (a === "Sin aula") return 1;
      if (b === "Sin aula") return -1;
      return a.localeCompare(b);
    });
    return names;
  }, [rowsAll]);

  // Iniciar evaluación
  const startM = useStartAssignment();
  const begin = async (id?: string): Promise<void> => {
    if (!id) {
      showToast.error("Falta el identificador de la evaluación.");
      return;
    }
    try {
      const res = await startM.mutateAsync(id);
      nav(`/student/assessments/take/${res.submissionId}`);
    } catch {
      showToast.error("No se pudo iniciar la evaluación.");
    }
  };

  type SectionProps = {
    title: string;
    items: StudentAssignmentSummaryResponse[];
    groupByClassroom?: boolean;
  };

  const Section = ({
    title,
    items,
    groupByClassroom = false,
  }: SectionProps) => {
    if (items.length === 0) return null;

    const grouped = groupByClassroom
      ? groupBy(items, (x) => x.classroomName ?? "Sin aula")
      : { [title]: items };

    const groupEntries = Object.entries(grouped).sort(([a], [b]) => {
      if (a === "Sin aula") return 1;
      if (b === "Sin aula") return -1;
      return a.localeCompare(b);
    });

    return (
      <>
        {groupEntries.map(([subtitle, list]) => (
          <section className="mb-6" key={`${title}-${subtitle}`}>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700 opacity-70 dark:text-gray-200">
                {title} {groupByClassroom && `· ${subtitle}`}{" "}
                <span className="ml-1 opacity-60">({list.length})</span>
              </h2>
            </div>

            <div className="rounded-2xl border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((a) => {
                  const windowLabel = formatWindow(a);
                  const attemptsUsed = a.attemptsUsed ?? 0;
                  const attemptsAllowed = a.attemptsAllowed ?? 1;
                  const canClick = a.started || a.canStart;

                  const primaryLabel = a.started
                    ? "Continuar"
                    : a.canStart
                    ? attemptsUsed > 0
                      ? "Reintentar"
                      : "Empezar"
                    : a.submitted
                    ? "Enviada"
                    : "No disponible";

                  const disabled = !canClick || !a.id;

                  return (
                    <article
                      key={a.id}
                      className="rounded-xl border bg-gray-50 p-4 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-800/50"
                      aria-label={`Evaluación: ${
                        a.templateTitle ?? "sin título"
                      }`}
                    >
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <TypeBadge type={a.type} />
                        <ScopeBadge scope={a.scope} />
                        <StatusBadge
                          started={a.started}
                          submitted={a.submitted}
                        />
                        {!a.started && !a.submitted && a.canStart ? (
                          <ActiveNowBadge />
                        ) : null}
                        {!a.started && a.lastStatus
                          ? badge(
                              "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
                              a.lastStatus === "GRADED"
                                ? "calificada"
                                : a.lastStatus === "SUBMITTED"
                                ? "enviada"
                                : a.lastStatus === "IN_PROGRESS"
                                ? "en curso"
                                : a.lastStatus.toLowerCase()
                            )
                          : null}
                      </div>

                      <h3 className="line-clamp-2 text-base font-semibold text-gray-900 dark:text-white">
                        {a.templateTitle ?? (
                          <span className="opacity-60">sin título</span>
                        )}
                      </h3>

                      <dl className="mt-2 space-y-1 text-xs text-gray-600 dark:text-gray-300">
                        <div className="flex justify-between gap-2">
                          <dt className="opacity-70">Ventana</dt>
                          <dd className="text-right">{windowLabel}</dd>
                        </div>
                        <div className="flex justify-between gap-2">
                          <dt className="opacity-70">Intentos</dt>
                          <dd className="text-right">
                            {attemptsUsed} / {attemptsAllowed}
                          </dd>
                        </div>
                      </dl>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          disabled={disabled}
                          onClick={() => void begin(a.id)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium text-white transition ${
                            a.started
                              ? "bg-blue-600 hover:bg-blue-700"
                              : a.canStart
                              ? "bg-indigo-600 hover:bg-indigo-700"
                              : "bg-emerald-600 opacity-60"
                          }`}
                          title={
                            !a.id
                              ? "Falta el identificador"
                              : !canClick
                              ? "Fuera de ventana o sin intentos"
                              : undefined
                          }
                        >
                          {primaryLabel}
                        </button>

                        {a.lastSubmissionId && (
                          <button
                            type="button"
                            onClick={() =>
                              nav(
                                `/student/assessments/result/${a.lastSubmissionId}`
                              )
                            }
                            className="rounded-lg border px-3 py-1.5 text-xs transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
                          >
                            Ver resultado
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        ))}
      </>
    );
  };

  const rowsFilteredCount = rowsFiltered.length;
  const empty =
    !isLoading &&
    !error &&
    ((page?.totalElements ?? 0) === 0 || rowsFilteredCount === 0);

  const totalElements = page?.totalElements ?? 0;
  const currentPage = (page?.page ?? 0) + 1;
  const totalPages = page?.totalPages ?? 1;

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-start justify-center bg-gray-50 px-4 py-6 dark:bg-[#1e2a34] sm:px-6 lg:px-8">
      <div className="w-full max-w-6xl space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Disponibles
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Aquí verás las evaluaciones que tu docente puso a tu disposición
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              y evaluaciones disponibles para todos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => {
                  setOnlyAvailable(e.target.checked);
                  setFilters((f) => ({ ...f, page: 0 }));
                }}
              />
              Solo disponibles/activas
            </label>

            {/* Filtro por aula */}
            <select
              className="rounded-lg border px-2 py-1 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              value={classroomFilter}
              onChange={(e) => {
                setClassroomFilter(e.target.value as "ALL" | string);
                setFilters((f) => ({ ...f, page: 0 }));
              }}
              aria-label="Filtrar por aula"
            >
              <option value="ALL">Todas las aulas</option>
              {classroomOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>

            {/* Tamaño de página */}
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
              onClick={() => refetch()}
              className="rounded-lg border px-3 py-1.5 text-sm transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
              aria-label="Recargar"
            >
              {isFetching ? "Actualizando…" : "Recargar"}
            </button>
          </div>
        </div>

        {/* Estados */}
        {isLoading ? (
          <div
            className="rounded-2xl border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
            aria-busy="true"
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-32 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800"
                />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="rounded-2xl border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <p className="text-sm text-red-600 dark:text-red-400">
              No se pudieron cargar tus evaluaciones.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-3 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-700"
            >
              Reintentar
            </button>
          </div>
        ) : empty ? (
          <div className="rounded-2xl border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mx-auto max-w-md text-center">
              <div className="mb-2 text-base font-medium text-gray-900 dark:text-white">
                Sin evaluaciones
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                No tienes evaluaciones por ahora
                {onlyAvailable
                  ? " (con el filtro de ‘solo disponibles’)."
                  : "."}
              </p>
              {onlyAvailable && (
                <button
                  type="button"
                  className="mt-4 rounded-lg border px-3 py-1.5 text-sm transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
                  onClick={() => setOnlyAvailable(false)}
                >
                  Quitar filtro
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <Section
              title="De mis aulas"
              items={classroomRows}
              groupByClassroom
            />
            <Section title="Públicas" items={publicRows} />

            {/* Footer paginado */}
            <div className="mt-4 flex flex-col items-center justify-between gap-3 text-xs text-gray-600 sm:flex-row dark:text-gray-300">
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
                  disabled={filters.page <= 0 || isFetching}
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
                    !page || filters.page >= totalPages - 1 || isFetching
                  }
                  className="rounded-lg border px-3 py-1 text-sm transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
