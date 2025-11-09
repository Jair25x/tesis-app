// src/components/student/RecentObjectivesStrip.tsx
import { memo, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  readRecentObjectives,
  writeRecentObjectives,
  backfillNames,
  type RecentObjectiveItem,
} from "../../utils/recentObjectives";
import { getCurriculumFull } from "../../services/curriculumService";
import type { CurriculumFullResponse } from "../../types/curriculum/CurriculumFullResponse";

/**
 * Renderiza una tira horizontal con los últimos objetivos visitados.
 * Corrige el bug de texto extraño (• / “Continuar” huérfano) asegurando un layout limpio.
 * Si faltan nombres, hace backfill contra el currículo actual (ligero y una sola vez por montaje).
 */

type Props = {
  curriculumId: string;
  limit?: number;
};

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
        // Indexar por objectiveId para parchear rápido
        const byObjectiveId: Record<
          string,
          {
            competencyName?: string;
            standardName?: string;
            objectiveName?: string;
          }
        > = {};

        for (const comp of tree.competencies) {
          for (const std of comp.standards) {
            for (const lo of std.learningObjectives) {
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
        // (manteniendo orden del storage completo)
        const all = readRecentObjectives();
        const allPatched = backfillNames(all, byObjectiveId);
        writeRecentObjectives(allPatched);
      } catch {
        // Si falla, no rompemos UI
      } finally {
        if (!cancelled) setDidBackfill(true);
      }
    })();
    return () => {
      cancelled = true;
    };
    // Sólo queremos correr cuando cambia curriculumId o el set inicial de items
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curriculumId, items.length]);

  const visible = useMemo(() => items.slice(0, limit), [items, limit]);

  if (visible.length === 0) return null;

  return (
    <section
      aria-label="Recientes"
      className="mb-6 rounded-xl border p-3 md:p-4 dark:border-gray-700 bg-white/80 dark:bg-gray-900/40"
    >
      <header className="mb-2 flex items-center justify-between">
        <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-100">
          🕒 Recientes
        </h3>
      </header>

      <div
        className="flex gap-3 overflow-x-auto pb-1"
        role="list"
        aria-label="Lista de objetivos recientes"
      >
        {visible.map((it) => {
          const title =
            it.objectiveName && it.competencyName
              ? `${it.competencyName} — ${it.objectiveName}`
              : it.objectiveName || it.standardName || "Objetivo reciente";

          const to = `/student/practice/${it.curriculumId}/${it.competencyId}/${it.standardId}/${it.objectiveId}`;

          return (
            <article
              key={`${it.objectiveId}-${it.ts}`}
              role="listitem"
              className="min-w-[240px] max-w-[320px] shrink-0 rounded-lg border bg-white dark:bg-gray-900 dark:border-gray-800 p-3 hover:shadow-sm transition"
            >
              <div className="text-sm text-gray-700 dark:text-gray-200 font-medium line-clamp-2">
                {title}
              </div>
              {it.standardName && (
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                  {it.standardName}
                </div>
              )}
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
