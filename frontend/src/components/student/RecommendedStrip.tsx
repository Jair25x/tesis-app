import { memo } from "react";
import { useRecommendations } from "../../hooks/ai/useRecommendations";
import { useExerciseDeepLink } from "../../hooks/exercises/useExerciseDeepLink";
import type {
  RecommendationItem,
  RecommendationsResponse,
} from "../../types/ai/Recommendations";
import { postRecoEvent } from "../../services/aiService";
import {
  newSourceRefId,
  setRecoAttribution,
} from "../../utils/recoAttribution";

type Props = {
  curriculumId: string; // no se usa para navegar; lo consumimos para evitar warning
  pathBuilder: (compId: string, stdId: string, loId: string) => string; // legado
  limit?: number;
};

function DifficultyPill({
  difficulty,
}: {
  difficulty: RecommendationItem["difficulty"];
}) {
  const label =
    difficulty === "EASY"
      ? "Fácil"
      : difficulty === "MEDIUM"
      ? "Medio"
      : difficulty === "HARD"
      ? "Difícil"
      : "—";
  const base = "inline-block text-xs px-2 py-0.5 rounded-full border";
  const color =
    difficulty === "EASY"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-200 dark:border-emerald-800"
      : difficulty === "MEDIUM"
      ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-200 dark:border-amber-800"
      : difficulty === "HARD"
      ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-200 dark:border-rose-800"
      : "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
  return <span className={`${base} ${color}`}>Dificultad: {label}</span>;
}

function fmtAgo(iso?: string | null) {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  const mins = Math.max(0, Math.floor((Date.now() - t) / 60000));
  if (mins < 1) return "actualizado ahora";
  if (mins === 1) return "actualizado hace 1 min";
  return `actualizado hace ${mins} min`;
}

export default memo(function RecommendedStrip({
  curriculumId,
  pathBuilder,
  limit = 3,
}: Props) {
  // Consumimos los props para evitar warnings de no usados (compatibilidad)
  void curriculumId;
  void pathBuilder;

  const { goToExercise } = useExerciseDeepLink();
  const { data, isLoading, isError } = useRecommendations({
    limit,
    subject: "math",
  });

  if (isLoading || isError) return null;

  const payload: RecommendationsResponse | undefined = data;
  const items: RecommendationItem[] = payload?.items ?? [];
  if (items.length === 0) return null;

  async function handleOpen(item: RecommendationItem) {
    if (!item.exerciseId) return;

    // Atribución coherente con el tipo (objectiveId puede ser null)
    const sourceRefId = newSourceRefId();
    setRecoAttribution(item.exerciseId, {
      source: "AI_RECO",
      objectiveId: item.objectiveId, // ← ahora es string | null, OK
      at: new Date().toISOString(),
      sourceRefId,
    });

    // Evento CTR (objectiveId opcional para el endpoint)
    void postRecoEvent({
      event: "OPEN",
      exerciseId: item.exerciseId,
      objectiveId: item.objectiveId ?? undefined,
      sourceRefId,
      ts: new Date().toISOString(),
      difficulty: item.difficulty ?? undefined,
    });

    // Navegación por deep-link (string, string|null)
    goToExercise(item.exerciseId, item.objectiveId);
  }

  return (
    <section className="mt-4" aria-label="Recomendaciones personalizadas">
      {payload?.generatedAt && (
        <div className="mb-2 text-xs text-muted-foreground">
          {fmtAgo(payload.generatedAt)}
        </div>
      )}

      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-base md:text-lg font-semibold text-emerald-700 dark:text-emerald-300">
          🌟 Recomendado para ti
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {items.slice(0, limit).map((rec) => {
          const displayTitle =
            (rec.title ?? "").trim() ||
            `Ejercicio ${rec.exerciseId.slice(0, 8)}`;

          return (
            <article
              key={rec.exerciseId}
              className="rounded-2xl border shadow-sm bg-white/90 dark:bg-gray-900/40 dark:border-gray-800 p-4 hover:shadow-md transition"
              aria-label={`Recomendación: ${displayTitle}`}
            >
              <div className="flex items-start justify-between gap-3">
                <h4 className="font-semibold leading-snug text-gray-900 dark:text-gray-100">
                  {displayTitle}
                </h4>
                <DifficultyPill difficulty={rec.difficulty ?? null} />
              </div>

              {rec.reason && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                  {rec.reason}
                </p>
              )}

              <div className="mt-3">
                <button
                  onClick={() => void handleOpen(rec)}
                  className="w-full rounded-lg px-3 py-2 border hover:bg-gray-50 dark:hover:bg-gray-800 transition text-sm"
                  aria-label={`Resolver ejercicio recomendado: ${displayTitle}`}
                >
                  Resolver
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
});
