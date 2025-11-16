// src/components/student/RecentObjectivesStrip.tsx
import { memo, useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  readRecentObjectives,
  writeRecentObjectives,
  backfillNames,
  removeRecentObjective,
  clearRecentObjectives,
  type RecentObjectiveItem,
} from "../../utils/recentObjectives";
import { getCurriculumFull } from "../../services/curriculumService";
import type { CurriculumFullResponse } from "../../types/curriculum/CurriculumFullResponse";

/**
 * Renderiza una tira horizontal con los últimos objetivos visitados.
 * - Usa nombres de objetivo/competencia cuando están disponibles.
 * - Hace backfill de nombres contra el currículo actual (una sola vez por montaje).
 * - Muestra un pequeño texto de "Última vez: hace X" para dar contexto temporal.
 * - Permite quitar objetivos individuales (✕) o limpiar toda la lista.
 */

type Props = {
  curriculumId: string;
  limit?: number;
};

function formatRelativeTime(iso: string | undefined): string | null {
  if (!iso) return null;
  const ts = new Date(iso);
  if (Number.isNaN(ts.getTime())) return null;

  const now = new Date();
  const diffMs = now.getTime() - ts.getTime();
  if (diffMs < 0) return null;

  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffMin < 1) return "hace unos segundos";
  if (diffMin < 60) return `hace ${diffMin} min`;
  if (diffHrs < 24) return `hace ${diffHrs} h`;
  if (diffDays === 1) return "hace 1 día";
  return `hace ${diffDays} días`;
}

export default memo(function RecentObjectivesStrip({
  curriculumId,
  limit = 8,
}: Props) {
  const [items, setItems] = useState<RecentObjectiveItem[]>([]);
  const [didBackfill, setDidBackfill] = useState<boolean>(false);

  // Carga inicial desde storage
  useEffect(() => {
    const list = readRecentObjectives();
    setItems(list.slice(0, limit));
  }, [limit]);

  // Backfill de nombres (una sola vez por montaje)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (didBackfill) return;
      if (!curriculumId) return;

      // ¿Hay elementos sin nombres?
      const missing = items.some(
        (x) => !x.objectiveName || !x.competencyName || !x.standardName
      );
      if (!missing) {
        setDidBackfill(true);
        return;
      }

      try {
        const tree: CurriculumFullResponse = await getCurriculumFull(
          curriculumId
        );

        const byObjectiveId: Record<
          string,
          {
            competencyName?: string;
            standardName?: string;
            objectiveName?: string;
          }
        > = {};

        for (const comp of tree.competencies ?? []) {
          for (const std of comp.standards ?? []) {
            for (const lo of std.learningObjectives ?? []) {
              byObjectiveId[lo.id] = {
                competencyName: comp.name,
                standardName: std.name,
                objectiveName: lo.name,
              };
            }
          }
        }

        if (cancelled) return;

        const patched = backfillNames(items, byObjectiveId);
        setItems(patched.slice(0, limit));

        // Persistimos el parche para que la próxima carga sea limpia
        const all = readRecentObjectives();
        const allPatched = backfillNames(all, byObjectiveId);
        writeRecentObjectives(allPatched);
      } catch {
        // Si falla el backfill no rompemos la UI, solo dejamos los textos por defecto
      } finally {
        if (!cancelled) setDidBackfill(true);
      }
    })();

    return () => {
      cancelled = true;
    };
    // Queremos disparar si cambia curriculumId o el nº de elementos
    // (evitamos dependencias profundas para no entrar en loops)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curriculumId, items.length, didBackfill]);

  const visible = useMemo(() => items.slice(0, limit), [items, limit]);

  const handleDismiss = useCallback((objectiveId: string) => {
    removeRecentObjective(objectiveId);
    setItems((prev) => prev.filter((it) => it.objectiveId !== objectiveId));
  }, []);

  const handleClear = useCallback(() => {
    clearRecentObjectives();
    setItems([]);
  }, []);

  if (visible.length === 0) return null;

  return (
    <section
      aria-label="Recientes"
      className="mb-6 rounded-xl border p-3 md:p-4 dark:border-gray-700 bg-white/80 dark:bg-gray-900/40"
    >
      <header className="mb-2 flex items-center justify-between gap-2">
        <div>
          <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-100">
            🕒 Recientes
          </h3>
          <p className="hidden text-xs text-gray-500 dark:text-gray-400 md:block">
            Retoma rápidamente lo último que estuviste practicando.
          </p>
        </div>

        {visible.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs rounded-full border px-2 py-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100"
          >
            Limpiar
          </button>
        )}
      </header>

      <div
        className="flex gap-3 overflow-x-auto pb-1"
        role="list"
        aria-label="Lista de objetivos recientes"
      >
        {visible.map((it) => {
          const hasNames =
            !!it.objectiveName || !!it.standardName || !!it.competencyName;

          const title =
            it.objectiveName ||
            it.standardName ||
            it.competencyName ||
            "Objetivo de aprendizaje reciente";

          const contextLine = (() => {
            if (it.competencyName && it.standardName) {
              return `${it.competencyName} · ${it.standardName}`;
            }
            if (it.competencyName) return it.competencyName;
            if (it.standardName) return it.standardName;
            return null;
          })();

          const when = formatRelativeTime(it.ts);

          const to = `/student/practice/${it.curriculumId}/${it.competencyId}/${it.standardId}/${it.objectiveId}`;

          return (
            <article
              key={`${it.objectiveId}-${it.ts}`}
              role="listitem"
              className="min-w-[240px] max-w-[320px] shrink-0 rounded-lg border bg-white dark:bg-gray-900 dark:border-gray-800 p-3 hover:shadow-sm transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="text-sm text-gray-700 dark:text-gray-200 font-semibold line-clamp-2">
                    {title}
                  </div>

                  {contextLine && (
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                      {contextLine}
                    </div>
                  )}

                  {when && (
                    <div className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">
                      Última vez: {when}
                    </div>
                  )}

                  {!hasNames && (
                    <div className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">
                      (Este objetivo se guardó antes de que se actualizaran los
                      nombres. Se resolverá automáticamente al seguir
                      practicando.)
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleDismiss(it.objectiveId)}
                  className="mt-1 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                  aria-label="Quitar de recientes"
                >
                  ✕
                </button>
              </div>

              <div className="mt-3">
                <Link
                  to={to}
                  className="inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                  aria-label={`Continuar: ${title}`}
                >
                  Continuar
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
});
