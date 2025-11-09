// src/components/student/RecommendationsPanel.tsx
import { useMemo, useState } from "react";
import type { RecommendationItem } from "../../types/ai/Recommendations";
import { showToast } from "../../utils/showToast";
import { useExerciseDeepLink } from "../../hooks/exercises/useExerciseDeepLink";
import {
  newSourceRefId,
  setRecoAttribution,
} from "../../utils/recoAttribution";
import {
  getActiveCurricula,
  getCurrentCurriculumId,
} from "../../services/curriculumService";
import { useRecommendations } from "../../hooks/ai/useRecommendations";
import { postRecoEvent } from "../../services/aiService";
import RecoEmpty from "./RecoEmpty";

type Props = {
  limit?: number;
  subject?: "math" | "lang";
  onResolve?: (ex: RecommendationItem) => void;
  title?: string;
};

function difficultyPill(d?: "EASY" | "MEDIUM" | "HARD" | null) {
  const label =
    d === "EASY"
      ? "Fácil"
      : d === "MEDIUM"
      ? "Medio"
      : d === "HARD"
      ? "Difícil"
      : "—";
  const base = "inline-block text-xs px-2 py-0.5 rounded-full border";
  const color =
    d === "EASY"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-200 dark:border-emerald-800"
      : d === "MEDIUM"
      ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-200 dark:border-amber-800"
      : d === "HARD"
      ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-200 dark:border-rose-800"
      : "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
  return <span className={`${base} ${color}`}>Dificultad: {label}</span>;
}

function fmtAgo(iso?: string) {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (!t) return null;
  const mins = Math.max(0, Math.floor((Date.now() - t) / 60000));
  if (mins < 1) return "actualizado ahora";
  if (mins === 1) return "actualizado hace 1 min";
  return `actualizado hace ${mins} min`;
}

async function ensureCurriculumSelected(): Promise<boolean> {
  try {
    const current = getCurrentCurriculumId();
    if (current) return true;
    const list = await getActiveCurricula();
    if (Array.isArray(list) && list.length > 0) {
      localStorage.setItem("app:curriculumId", list[0].id);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export default function RecommendationsPanel({
  limit = 6,
  subject = "math",
  onResolve,
  title = "🌟 Recomendado para ti",
}: Props) {
  const { goToExercise } = useExerciseDeepLink();
  const [ensuring, setEnsuring] = useState(false);

  const args = useMemo(() => ({ limit, subject }), [limit, subject]);
  const { data, isLoading, isError, error } = useRecommendations(args);

  if (isLoading) {
    // Mantén la pantalla limpia: sin placeholder ruidoso.
    return null;
  }
  if (isError) {
    const msg =
      error instanceof Error
        ? error.message
        : "Error al cargar recomendaciones.";
    return (
      <div
        className="rounded-xl border p-4 text-sm text-red-500 dark:border-gray-700"
        role="alert"
      >
        {msg}
      </div>
    );
  }

  const items = data?.items ?? [];

  const handleResolve = async (item: RecommendationItem) => {
    if (onResolve) {
      onResolve(item);
      return;
    }
    setEnsuring(true);
    const ok = await ensureCurriculumSelected();
    setEnsuring(false);

    if (!ok) {
      showToast.warning("Selecciona un currículo antes de abrir ejercicios.");
      return;
    }
    if (!item.objectiveId) {
      showToast.warning("La recomendación no incluye objectiveId.");
      return;
    }

    // Correlación + atribución (consumida por el Player)
    const refId = newSourceRefId();
    setRecoAttribution(item.exerciseId, {
      source: "AI_RECO",
      objectiveId: item.objectiveId, // string (no null aquí por el guard)
      at: new Date().toISOString(),
      sourceRefId: refId,
    });

    // Evento CTR (fire & forget)
    void postRecoEvent({
      event: "OPEN",
      exerciseId: item.exerciseId,
      objectiveId: item.objectiveId,
      sourceRefId: refId,
      ts: new Date().toISOString(),
      difficulty: item.difficulty ?? undefined,
    });

    // Deep-link
    goToExercise(item.exerciseId, item.objectiveId);
  };

  return (
    <section aria-label="Recomendaciones personalizadas" className="mt-2">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-base md:text-lg font-semibold text-emerald-700 dark:text-emerald-300">
          {title}
        </h3>
        {data?.generatedAt && (
          <div className="text-xs text-muted-foreground">
            {fmtAgo(data.generatedAt)}
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <RecoEmpty />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
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
                  {difficultyPill(rec.difficulty ?? null)}
                </div>

                {rec.reason && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                    {rec.reason}
                  </p>
                )}

                <div className="mt-3">
                  <button
                    onClick={() => void handleResolve(rec)}
                    disabled={ensuring}
                    className="w-full rounded-lg px-3 py-2 border hover:bg-gray-50 dark:hover:bg-gray-800 transition text-sm"
                    aria-label={`Resolver ejercicio recomendado: ${displayTitle}`}
                  >
                    {ensuring ? "Preparando…" : "Resolver"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
