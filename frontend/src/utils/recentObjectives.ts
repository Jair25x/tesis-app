// src/utils/recentObjectives.ts
/**
 * Gestión de "Recientes" (objetivos abiertos).
 * Sin "any", persistencia en localStorage, sin duplicados por objectiveId.
 */

export type RecentObjectiveItem = {
  curriculumId: string;
  competencyId: string;
  standardId: string;
  objectiveId: string;

  // Metadatos opcionales (pueden llegar vacíos y se backfillean luego)
  curriculumName?: string;
  competencyName?: string;
  standardName?: string;
  objectiveName?: string;

  /**
   * Momento en que el estudiante abrió/practicó este objetivo.
   * ISO-8601 (ej: "2025-11-16T14:23:00.000Z").
   * Se usa para ordenar y mostrar "Última vez: hace X".
   */
  ts: string;
};

const STORAGE_KEY = "app:recentObjectives";
const MAX_ITEMS = 10;

export function readRecentObjectives(): RecentObjectiveItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    // Validación mínima de campos
    return parsed.filter((x) => x && typeof x.objectiveId === "string");
  } catch {
    return [];
  }
}

export function writeRecentObjectives(items: RecentObjectiveItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* noop */
  }
}

/**
 * Inserta/actualiza un ítem, evita duplicados por objectiveId, recorta a MAX_ITEMS.
 */
export function pushRecentObjective(item: RecentObjectiveItem): void {
  const list = readRecentObjectives();
  const withoutDup = list.filter((x) => x.objectiveId !== item.objectiveId);
  const next = [item, ...withoutDup].slice(0, MAX_ITEMS);
  writeRecentObjectives(next);
}

/**
 * Elimina un objetivo de la lista de "Recientes" por objectiveId.
 * Pensado para usarse desde el botón "X" en la UI.
 */
export function removeRecentObjective(objectiveId: string): void {
  if (!objectiveId) return;
  const list = readRecentObjectives();
  const filtered = list.filter((x) => x.objectiveId !== objectiveId);
  writeRecentObjectives(filtered);
}

/**
 * Limpia por completo la lista de "Recientes".
 * Útil para un botón "Borrar todo" o para resets manuales.
 */
export function clearRecentObjectives(): void {
  writeRecentObjectives([]);
}

/**
 * Backfill de nombres para un subconjunto por objectiveId.
 */
export function backfillNames(
  items: RecentObjectiveItem[],
  namesByObjectiveId: Record<
    string,
    { competencyName?: string; standardName?: string; objectiveName?: string }
  >
): RecentObjectiveItem[] {
  return items.map((it) => {
    const patch = namesByObjectiveId[it.objectiveId];
    if (!patch) return it;
    return {
      ...it,
      competencyName: it.competencyName || patch.competencyName,
      standardName: it.standardName || patch.standardName,
      objectiveName: it.objectiveName || patch.objectiveName,
    };
  });
}
