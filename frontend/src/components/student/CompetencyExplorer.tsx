// src/components/student/CompetencyExplorer.tsx
import { memo, useEffect, useMemo, useState, type JSX } from "react";
import type {
  CurriculumFullResponse,
  CompetencyNode,
  StandardNode,
  LearningObjectiveNode,
} from "../../types/curriculum/CurriculumFullResponse";

type StatusSets = {
  completedIds: Set<string>;
  inProgressIds: Set<string>;
} | null;

type CoverageMap = Record<
  string,
  { solvedDistinct: number; totalExercises: number }
> | null;

type Props = {
  curriculum: CurriculumFullResponse;
  statusSets: StatusSets;
  coverageMap: CoverageMap;
};

const SEARCH_LS_KEY = "app:roadmap:search";
const COMP_LS_KEY = "app:roadmap:selectedComp";

function useDebounced<T>(value: T, delay = 250): T {
  const [v, setV] = useState<T>(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}

/** Resalta coincidencias de q dentro de text con <mark> (case-insensitive) */
function highlight(text: string, q: string): JSX.Element {
  if (!q.trim()) return <>{text}</>;
  const re = new RegExp(`(${escapeRegExp(q)})`, "ig");
  const parts = text.split(re);
  return (
    <>
      {parts.map((p, i) =>
        re.test(p) ? (
          <mark
            key={i}
            className="rounded-sm bg-yellow-100 px-0.5 dark:bg-yellow-900/40"
          >
            {p}
          </mark>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default memo(function CompetencyExplorer({
  curriculum,
  statusSets,
  coverageMap,
}: Props) {
  const [search, setSearch] = useState<string>(() => {
    try {
      return localStorage.getItem(SEARCH_LS_KEY) ?? "";
    } catch {
      return "";
    }
  });
  const debounced = useDebounced(search, 200);

  const [selectedCompId, setSelectedCompId] = useState<string>(() => {
    try {
      return localStorage.getItem(COMP_LS_KEY) ?? "";
    } catch {
      return "";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(SEARCH_LS_KEY, search);
    } catch {
      /* noop */
    }
  }, [search]);

  useEffect(() => {
    try {
      localStorage.setItem(COMP_LS_KEY, selectedCompId);
    } catch {
      /* noop */
    }
  }, [selectedCompId]);

  const comps: CompetencyNode[] = curriculum.competencies;

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    const byComp = selectedCompId
      ? comps.filter((c) => c.id === selectedCompId)
      : comps;

    if (!q) return byComp;

    // Filtramos manteniendo jerarquía (si un objetivo hace match, se queda su estándar y competencia)
    return byComp
      .map<CompetencyNode>((c) => {
        const stds: StandardNode[] = c.standards
          .map((s) => {
            const los: LearningObjectiveNode[] = s.learningObjectives.filter(
              (lo) =>
                lo.name.toLowerCase().includes(q) ||
                s.name.toLowerCase().includes(q) ||
                c.name.toLowerCase().includes(q)
            );
            if (los.length === 0 && !s.name.toLowerCase().includes(q)) {
              return null;
            }
            return {
              ...s,
              learningObjectives: los.length
                ? los
                : s.learningObjectives.filter(() => false),
            };
          })
          .filter((x): x is StandardNode => x !== null);

        if (stds.length === 0 && !c.name.toLowerCase().includes(q)) {
          return { ...c, standards: [] };
        }
        return { ...c, standards: stds };
      })
      .filter(
        (c) => c.standards.length > 0 || c.name.toLowerCase().includes(q)
      );
  }, [comps, debounced, selectedCompId]);

  const compOptions = useMemo(
    () => [
      { id: "", name: "Todas" },
      ...comps.map((c) => ({ id: c.id, name: c.name })),
    ],
    [comps]
  );

  return (
    <div className="rounded-xl border p-4 dark:border-gray-700">
      {/* Controles superiores */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Búsqueda */}
        <div className="flex-1">
          <label htmlFor="roadmap-search" className="sr-only">
            Buscar objetivos
          </label>
          <input
            id="roadmap-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar competencia, estándar u objetivo…"
            className="w-full rounded-md border px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700"
          />
          {search && (
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Mostrando coincidencias para “{search}”.
            </div>
          )}
        </div>

        {/* Selector de competencia */}
        <div className="md:w-64">
          <label htmlFor="comp-picker" className="sr-only">
            Filtrar por competencia
          </label>
          <select
            id="comp-picker"
            value={selectedCompId}
            onChange={(e) => setSelectedCompId(e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700"
          >
            {compOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Árbol */}
      <div className="mt-4 space-y-6">
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            No hay coincidencias con tu búsqueda.
          </p>
        ) : (
          filtered.map((c) => (
            <section
              key={c.id}
              className="rounded-lg border p-3 dark:border-gray-700"
            >
              <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                {highlight(c.name, debounced)}
              </h3>

              {c.standards.length === 0 ? (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {search
                    ? "Sin estándares coincidentes."
                    : "Aún no hay estándares en esta competencia."}
                </p>
              ) : (
                <div className="mt-3 space-y-4">
                  {c.standards.map((s) => (
                    <details
                      key={s.id}
                      className="rounded-md border p-3 dark:border-gray-700"
                      open={Boolean(debounced)} // si estás buscando, abre por UX
                    >
                      <summary className="cursor-pointer text-base font-medium">
                        <span className="text-gray-800 dark:text-gray-200">
                          {highlight(s.name, debounced)}
                        </span>
                      </summary>

                      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {s.learningObjectives.map((lo) => {
                          const status = statusSets?.completedIds.has(lo.id)
                            ? "COMPLETED"
                            : statusSets?.inProgressIds.has(lo.id)
                            ? "IN_PROGRESS"
                            : "NOT_STARTED";
                          const cov = coverageMap?.[lo.id];

                          const to = `/student/practice/${curriculum.id}/${c.id}/${s.id}/${lo.id}`;

                          return (
                            <a
                              key={lo.id}
                              href={to}
                              className="rounded-lg border p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                            >
                              <div className="font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
                                {highlight(lo.name, debounced)}
                              </div>
                              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                {status === "COMPLETED"
                                  ? "✅ Completado"
                                  : status === "IN_PROGRESS"
                                  ? "🧭 En curso"
                                  : "🎯 Pendiente"}
                                {cov?.totalExercises ? (
                                  <span className="ml-2">
                                    · {cov.solvedDistinct}/{cov.totalExercises}{" "}
                                    ej.
                                  </span>
                                ) : null}
                              </div>
                            </a>
                          );
                        })}
                      </div>
                    </details>
                  ))}
                </div>
              )}
            </section>
          ))
        )}
      </div>
    </div>
  );
});
