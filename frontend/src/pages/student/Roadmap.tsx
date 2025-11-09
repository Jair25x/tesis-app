// src/pages/student/Roadmap.tsx
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getCurriculumFull,
  setCurrentCurriculumId,
} from "../../services/curriculumService";
import type { CurriculumFullResponse } from "../../types/curriculum/CurriculumFullResponse";
import LoadingScreen from "../../components/LoadingScreen";
import ObjectiveCard from "../../components/student/ObjectiveCard";
import { useObjectiveStatuses } from "../../hooks/progress/useObjectiveStatuses";
import { useObjectiveCoverage } from "../../hooks/progress/useObjectiveCoverage";

// nuevos
import HeroBanner from "../../components/student/HeroBanner";
import CompetencyPills from "../../components/student/CompetencyPills";
import RecommendedStrip from "../../components/student/RecommendedStrip";

type Filter = "ALL" | "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

type LOFlat = {
  id: string;
  name: string;
  compId: string;
  compName: string;
  standardId: string;
  description?: string;
};

type CompetencyBuckets = {
  compId: string;
  compName: string;
  completed: LOFlat[];
  inProgress: LOFlat[];
  notStarted: LOFlat[];
};

const FILTER_LS_KEY = "app:roadmapFilter";

export default function Roadmap() {
  const { id: curriculumId } = useParams<{ id: string }>();
  const [curriculum, setCurriculum] = useState<CurriculumFullResponse | null>(
    null
  );
  const [error, setError] = useState<string>("");

  // filtro global
  const [filter, setFilter] = useState<Filter>(() => {
    try {
      const v = localStorage.getItem(FILTER_LS_KEY);
      return v === "ALL" ||
        v === "NOT_STARTED" ||
        v === "IN_PROGRESS" ||
        v === "COMPLETED"
        ? (v as Filter)
        : "ALL";
    } catch {
      return "ALL";
    }
  });

  // competencia seleccionada ("" => Todas)
  const [selectedCompId, setSelectedCompId] = useState<string>("");

  // modo enfoque (objetivo seleccionado)
  const [selectedObjectiveId, setSelectedObjectiveId] = useState<string>("");

  useEffect(() => {
    try {
      localStorage.setItem(FILTER_LS_KEY, filter);
    } catch {
      /* noop */
    }
  }, [filter]);

  useEffect(() => {
    if (curriculumId) {
      try {
        setCurrentCurriculumId(curriculumId);
      } catch {
        /* noop */
      }
    }
  }, [curriculumId]);

  useEffect(() => {
    if (!curriculumId) {
      setError("No se encontró el currículo.");
      return;
    }
    (async () => {
      try {
        const data = await getCurriculumFull(curriculumId);
        setCurriculum(data);
      } catch (e) {
        console.error("Error al cargar el currículo:", e);
        setError("Error al cargar el currículo.");
      }
    })();
  }, [curriculumId]);

  // progreso
  const {
    data: statusSets,
    isLoading: loadingStatus,
    isError: errorStatus,
  } = useObjectiveStatuses(curriculumId);
  const { data: coverageMap } = useObjectiveCoverage(curriculumId);

  // listado plano de objetivos
  const allObjectives: LOFlat[] = useMemo(() => {
    if (!curriculum) return [];
    const list: LOFlat[] = [];
    for (const comp of curriculum.competencies) {
      for (const std of comp.standards) {
        for (const lo of std.learningObjectives) {
          list.push({
            id: lo.id,
            name: lo.name,
            compId: comp.id,
            compName: comp.name,
            standardId: std.id,
            description:
              lo.exercises && lo.exercises.length > 0
                ? lo.exercises[0].statement
                : undefined,
          });
        }
      }
    }
    return list.sort((a, b) => {
      const c = a.compName.localeCompare(b.compName);
      return c !== 0 ? c : a.name.localeCompare(b.name);
    });
  }, [curriculum]);

  const objectiveById = useMemo(() => {
    const m: Record<string, LOFlat> = {};
    for (const o of allObjectives) m[o.id] = o;
    return m;
  }, [allObjectives]);

  const statusOf = (
    loId: string
  ): "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" => {
    if (!statusSets) return "NOT_STARTED";
    if (statusSets.completedIds.has(loId)) return "COMPLETED";
    if (statusSets.inProgressIds.has(loId)) return "IN_PROGRESS";
    return "NOT_STARTED";
  };

  // buckets por competencia (usa statusSets)
  const byCompetency: CompetencyBuckets[] = useMemo(() => {
    if (!curriculum || !statusSets) return [];
    const groups: CompetencyBuckets[] = [];
    for (const comp of curriculum.competencies) {
      const all: LOFlat[] = [];
      for (const std of comp.standards) {
        for (const lo of std.learningObjectives) {
          all.push({
            id: lo.id,
            name: lo.name,
            compId: comp.id,
            compName: comp.name,
            standardId: std.id,
            description:
              lo.exercises && lo.exercises.length > 0
                ? lo.exercises[0].statement
                : undefined,
          });
        }
      }
      const completed = all.filter((o) => statusSets.completedIds.has(o.id));
      const inProgress = all.filter((o) => statusSets.inProgressIds.has(o.id));
      const notStarted = all.filter(
        (o) =>
          !(
            statusSets.completedIds.has(o.id) ||
            statusSets.inProgressIds.has(o.id)
          )
      );
      groups.push({
        compId: comp.id,
        compName: comp.name,
        completed,
        inProgress,
        notStarted,
      });
    }
    return groups;
  }, [curriculum, statusSets]);

  const totals = useMemo(() => {
    let completed = 0;
    let inProgress = 0;
    let notStarted = 0;
    for (const g of byCompetency) {
      completed += g.completed.length;
      inProgress += g.inProgress.length;
      notStarted += g.notStarted.length;
    }
    return {
      completed,
      inProgress,
      notStarted,
      all: completed + inProgress + notStarted,
    };
  }, [byCompetency]);

  const shouldShowSection = (sectionCount: number): boolean =>
    filter === "ALL" || sectionCount > 0;

  const compHasAnyForFilter = (g: CompetencyBuckets): boolean => {
    if (filter === "ALL") return true;
    if (filter === "COMPLETED") return g.completed.length > 0;
    if (filter === "IN_PROGRESS") return g.inProgress.length > 0;
    return g.notStarted.length > 0;
  };

  const nothingInFilter =
    filter !== "ALL" &&
    totals.all > 0 &&
    ((filter === "COMPLETED" && totals.completed === 0) ||
      (filter === "IN_PROGRESS" && totals.inProgress === 0) ||
      (filter === "NOT_STARTED" && totals.notStarted === 0));

  const onSelectObjective = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedObjectiveId(e.target.value);
  };
  const clearSelection = () => setSelectedObjectiveId("");

  // items para pills (con conteos)
  const competencyItems = useMemo(() => {
    if (!curriculum || !statusSets) return [];
    return curriculum.competencies.map((c) => {
      const allLO: string[] = c.standards.flatMap((s) =>
        s.learningObjectives.map((lo) => lo.id)
      );
      const total = allLO.length;
      const pending = allLO.filter(
        (id) =>
          !(statusSets.completedIds.has(id) || statusSets.inProgressIds.has(id))
      ).length;
      return { id: c.id, name: c.name, counts: { total, pending } };
    });
  }, [curriculum, statusSets]);

  // grupos visibles según competencia seleccionada
  const visibleGroups = useMemo(() => {
    const base = byCompetency.filter(compHasAnyForFilter);
    if (!selectedCompId) return base;
    return base.filter((g) => g.compId === selectedCompId);
  }, [byCompetency, selectedCompId, filter]);

  // selector de objetivo: solo LO de la competencia activa
  const objectivesForPicker = useMemo(() => {
    const source = !selectedCompId
      ? allObjectives
      : allObjectives.filter((o) => o.compId === selectedCompId);
    return source;
  }, [allObjectives, selectedCompId]);

  // seleccionado para modo enfoque
  const selected = selectedObjectiveId
    ? objectiveById[selectedObjectiveId]
    : undefined;
  const selectedStatus = selected ? statusOf(selected.id) : undefined;
  const selectedCoverage = selected ? coverageMap?.[selected.id] : undefined;

  // helper de ruta
  const buildPracticePath = (compId: string, stdId: string, loId: string) =>
    `/student/practice/${curriculum?.id}/${compId}/${stdId}/${loId}`;

  if (error)
    return <div className="p-4 text-red-600 dark:text-red-400">{error}</div>;
  if (!curriculum) return <LoadingScreen />;

  // Chip reusado (del filtro por estado)
  type FilterChipProps = {
    k: Filter;
    label: string;
    count?: number;
    onClick: () => void;
    activeClass: string;
  };
  const FilterChip = ({
    k,
    label,
    count,
    onClick,
    activeClass,
  }: FilterChipProps) => {
    const isActive = filter === k;
    return (
      <button
        onClick={onClick}
        aria-pressed={isActive}
        className={[
          "rounded-full border px-3 py-1.5 text-sm transition",
          "hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          isActive ? activeClass : "bg-white dark:bg-gray-900",
        ].join(" ")}
      >
        <span className="font-medium">{label}</span>
        {typeof count === "number" && (
          <span className="ml-2 text-xs rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5">
            {count}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="p-4 md:p-8">
      {/* HERO */}
      <HeroBanner
        title="Selecciona lo que quieres aprender o reforzar hoy"
        subtitle="Elige una competencia para ver objetivos claros y empezar sin distracciones."
      />

      {/* PILLS DE COMPETENCIAS */}
      <div className="my-4">
        <CompetencyPills
          items={competencyItems}
          selectedId={selectedCompId}
          onSelect={(id) => {
            setSelectedCompId(id);
            // al cambiar de competencia, limpia el enfoque si no pertenece
            if (selected && selected.compId !== id && id !== "") {
              setSelectedObjectiveId("");
            }
          }}
        />
      </div>

      {/* STRIP DE RECOMENDADOS (máx. 3) */}
      <RecommendedStrip
        curriculumId={curriculum.id}
        pathBuilder={buildPracticePath}
      />

      {/* Barra de filtro por estado + selector de enfoque */}
      <div className="mt-6 mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Chips de filtro */}
        <div className="md:col-span-2">
          <div
            className="flex flex-wrap gap-2"
            role="tablist"
            aria-label="Filtrar objetivos"
          >
            <FilterChip
              k="ALL"
              label="📚 Todos"
              count={totals.all}
              onClick={() => setFilter("ALL")}
              activeClass="bg-indigo-50 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-800"
            />
            <FilterChip
              k="NOT_STARTED"
              label="🎯 Pendientes"
              count={totals.notStarted}
              onClick={() => setFilter("NOT_STARTED")}
              activeClass="bg-sky-50 dark:bg-sky-950/30 border-sky-300 dark:border-sky-800"
            />
            <FilterChip
              k="IN_PROGRESS"
              label="🧭 En curso"
              count={totals.inProgress}
              onClick={() => setFilter("IN_PROGRESS")}
              activeClass="bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800"
            />
            <FilterChip
              k="COMPLETED"
              label="✅ Completados"
              count={totals.completed}
              onClick={() => setFilter("COMPLETED")}
              activeClass="bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800"
            />
          </div>
        </div>

        {/* Selector de enfoque (limitado por competencia) */}
        <div className="md:col-span-1">
          <div className="rounded-xl border p-4 dark:border-gray-700">
            <div className="mb-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                ¿Qué quieres aprender hoy?
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Elige un objetivo para enfocarte. Siempre puedes volver a ver
                todo.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="objective-picker" className="sr-only">
                Elegir objetivo
              </label>
              <select
                id="objective-picker"
                value={selectedObjectiveId}
                onChange={onSelectObjective}
                className="min-w-[220px] flex-1 rounded-md border px-2 py-1.5 text-sm dark:bg-gray-900 dark:border-gray-700"
                aria-label="Elige un objetivo para enfocarte"
              >
                <option value="">
                  —{" "}
                  {selectedCompId
                    ? "Elegir objetivo de la competencia"
                    : "Elegir objetivo"}{" "}
                  —
                </option>
                {objectivesForPicker.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.compName} — {o.name}
                  </option>
                ))}
              </select>
              {selected && (
                <button
                  onClick={clearSelection}
                  className="whitespace-nowrap rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Mostrar todo
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {loadingStatus && (
        <div
          className="mb-4 text-sm text-muted-foreground"
          aria-live="polite"
          role="status"
        >
          Cargando tu progreso…
        </div>
      )}
      {errorStatus && (
        <div className="mb-4 text-sm text-red-500" role="alert">
          No se pudieron cargar tus estados de objetivos.
        </div>
      )}

      {/* MODO ENFOQUE */}
      {selected && (
        <section aria-label="Objetivo seleccionado" className="mb-10">
          <header className="mb-3">
            <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-300">
              🎯 Enfoque: {selected.compName}
            </h2>
          </header>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ObjectiveCard
              key={selected.id}
              label={selected.name}
              description={selected.description}
              to={buildPracticePath(
                selected.compId,
                selected.standardId,
                selected.id
              )}
              status={selectedStatus ?? "NOT_STARTED"}
              coverageSolved={
                selectedCoverage?.totalExercises
                  ? selectedCoverage.solvedDistinct
                  : undefined
              }
              coverageTotal={selectedCoverage?.totalExercises ?? undefined}
            />

            <div className="rounded-xl border p-4 dark:border-gray-700">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                ¡Listo para aprender este objetivo! Empieza o continúa donde lo
                dejaste.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  to={buildPracticePath(
                    selected.compId,
                    selected.standardId,
                    selected.id
                  )}
                  className="rounded-lg bg-indigo-600 px-3 py-2 text-white hover:bg-indigo-700"
                >
                  {selectedStatus === "COMPLETED" ? "Repasar" : "Empezar"}
                </Link>
                <button
                  onClick={clearSelection}
                  className="rounded-lg border px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Elegir otro objetivo
                </button>
              </div>
              {selectedCoverage?.totalExercises ? (
                <p className="mt-3 text-xs text-gray-600 dark:text-gray-400">
                  Cobertura: {selectedCoverage.solvedDistinct} /{" "}
                  {selectedCoverage.totalExercises} ejercicios.
                </p>
              ) : null}
            </div>
          </div>
        </section>
      )}

      {/* LISTA AGRUPADA POR COMPETENCIA (si no hay enfoque) */}
      {!selected && (
        <>
          {nothingInFilter && (
            <div className="mb-6 rounded-md border border-dashed p-4 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300">
              No hay objetivos para mostrar en este filtro.
            </div>
          )}

          {visibleGroups.map((group) => (
            <section key={group.compId} className="mb-10">
              <header className="mb-4">
                <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-300">
                  📘 {group.compName}
                </h2>
              </header>

              {/* Pendientes (colapsable) */}
              {shouldShowSection(group.notStarted.length) &&
                (filter === "ALL" || filter === "NOT_STARTED") && (
                  <details
                    className="mb-4 rounded-md border p-3 dark:border-gray-700"
                    open={group.notStarted.length > 0}
                  >
                    <summary className="cursor-pointer text-lg font-medium flex items-center justify-between">
                      <span className="text-sky-700 dark:text-sky-300">
                        🎯 Pendientes
                      </span>
                      <span className="text-xs rounded-full bg-sky-100 px-2 py-1 text-sky-700 dark:bg-sky-900/30 dark:text-sky-200">
                        {group.notStarted.length} objetivo(s)
                      </span>
                    </summary>
                    <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-3">
                      {group.notStarted.map((o) => (
                        <ObjectiveCard
                          key={o.id}
                          label={o.name}
                          description={o.description}
                          to={buildPracticePath(o.compId, o.standardId, o.id)}
                          status="NOT_STARTED"
                          coverageSolved={
                            coverageMap?.[o.id]?.totalExercises
                              ? coverageMap[o.id].solvedDistinct
                              : undefined
                          }
                          coverageTotal={
                            coverageMap?.[o.id]?.totalExercises ?? undefined
                          }
                        />
                      ))}
                    </div>
                  </details>
                )}

              {/* En curso (colapsable) */}
              {shouldShowSection(group.inProgress.length) &&
                (filter === "ALL" || filter === "IN_PROGRESS") && (
                  <details className="mb-4 rounded-md border p-3 dark:border-gray-700">
                    <summary className="cursor-pointer text-lg font-medium flex items-center justify-between">
                      <span className="text-amber-700 dark:text-amber-300">
                        🧭 En curso
                      </span>
                      <span className="text-xs rounded-full bg-amber-100 px-2 py-1 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200">
                        {group.inProgress.length} objetivo(s)
                      </span>
                    </summary>
                    <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-3">
                      {group.inProgress.map((o) => (
                        <ObjectiveCard
                          key={o.id}
                          label={o.name}
                          description={o.description}
                          to={buildPracticePath(o.compId, o.standardId, o.id)}
                          status="IN_PROGRESS"
                          coverageSolved={
                            coverageMap?.[o.id]?.totalExercises
                              ? coverageMap[o.id].solvedDistinct
                              : undefined
                          }
                          coverageTotal={
                            coverageMap?.[o.id]?.totalExercises ?? undefined
                          }
                        />
                      ))}
                    </div>
                  </details>
                )}

              {/* Completados (colapsable) */}
              {shouldShowSection(group.completed.length) &&
                (filter === "ALL" || filter === "COMPLETED") && (
                  <details className="mb-2 rounded-md border p-3 dark:border-gray-700">
                    <summary className="cursor-pointer text-lg font-medium flex items-center justify-between">
                      <span className="text-emerald-700 dark:text-emerald-300">
                        ✅ Completados
                      </span>
                      <span className="text-xs rounded-full bg-emerald-100 px-2 py-1 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200">
                        {group.completed.length} objetivo(s)
                      </span>
                    </summary>
                    <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-3">
                      {group.completed.map((o) => (
                        <ObjectiveCard
                          key={o.id}
                          label={o.name}
                          description={o.description}
                          to={buildPracticePath(o.compId, o.standardId, o.id)}
                          status="COMPLETED"
                          coverageSolved={
                            coverageMap?.[o.id]?.totalExercises
                              ? coverageMap[o.id].solvedDistinct
                              : undefined
                          }
                          coverageTotal={
                            coverageMap?.[o.id]?.totalExercises ?? undefined
                          }
                        />
                      ))}
                    </div>
                  </details>
                )}
            </section>
          ))}
        </>
      )}
    </div>
  );
}
