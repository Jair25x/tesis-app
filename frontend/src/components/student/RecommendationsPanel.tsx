import { useQuery } from "@tanstack/react-query";
import { getMyRecommendations } from "../../services/aiService";
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
import { useState } from "react";

type Props = {
  limit?: number;
  subject?: "math" | "lang";
  onResolve?: (ex: RecommendationItem) => void;
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

export default function RecommendationsPanel({
  limit = 8,
  subject = "math",
  onResolve,
}: Props) {
  const { goToExercise } = useExerciseDeepLink();
  const [ensuring, setEnsuring] = useState(false); // evita múltiples clics

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["ai", "reco", { limit, subject }],
    queryFn: () => getMyRecommendations({ limit, subject }),
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div
        className="text-sm text-muted-foreground"
        role="status"
        aria-live="polite"
      >
        Cargando recomendaciones…
      </div>
    );
  }
  if (isError) {
    const msg =
      error instanceof Error
        ? error.message
        : "Error al cargar recomendaciones.";
    return (
      <div className="text-sm text-red-500" role="alert">
        {msg}
      </div>
    );
  }
  if (!data || data.length === 0) {
    return (
      <div
        className="text-sm text-muted-foreground"
        role="status"
        aria-live="polite"
      >
        No hay recomendaciones por ahora.
      </div>
    );
  }

  async function ensureCurriculumSelected(): Promise<boolean> {
    try {
      const current = getCurrentCurriculumId();
      if (current) return true;
      setEnsuring(true);
      const list = await getActiveCurricula();
      if (Array.isArray(list) && list.length > 0) {
        localStorage.setItem("app:curriculumId", list[0].id);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setEnsuring(false);
    }
  }

  const handleResolve = async (item: RecommendationItem) => {
    if (onResolve) {
      onResolve(item);
      return;
    }

    const ok = await ensureCurriculumSelected();
    if (!ok) {
      showToast.warning("Selecciona un currículo antes de abrir ejercicios.");
      return;
    }

    if (!item.objectiveId) {
      showToast.warning("La recomendación no incluye objectiveId.");
      return;
    }

    // Atribución -> se consumirá en el Player (sessionStorage, one-shot)
    setRecoAttribution(item.exerciseId, {
      source: "AI_RECO",
      objectiveId: item.objectiveId,
      at: new Date().toISOString(),
      sourceRefId: newSourceRefId(),
    });

    goToExercise(item.exerciseId, item.objectiveId);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {data.map((item) => {
        const fallbackTitle = `Ejercicio ${item.exerciseId.slice(0, 8)}`;
        const displayTitle = (item.title ?? "").trim() || fallbackTitle;

        return (
          <article
            key={item.exerciseId}
            className="rounded-2xl border shadow-sm bg-white/90 dark:bg-gray-900/40 dark:border-gray-800 p-4 hover:shadow-md transition"
            aria-label={`Recomendación: ${displayTitle}`}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold leading-snug text-gray-900 dark:text-gray-100">
                {displayTitle}
              </h3>
              {difficultyPill(item.difficulty)}
            </div>

            {/* Razón */}
            {item.reason && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                {item.reason}
              </p>
            )}

            {/* CTA */}
            <div className="mt-3">
              <button
                onClick={() => void handleResolve(item)}
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
  );
}
