// src/pages/student/Practice.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getExercises } from "../../services/exerciseService";
import type { ExerciseResponse } from "../../types/exercise/ExerciseResponse";
import LoadingScreen from "../../components/LoadingScreen";
import { showToast } from "../../utils/showToast";
import ExerciseCard from "../../components/student/ExerciseCard";
import axios, { AxiosError } from "axios";

export default function Practice() {
  const { curriculumId, competencyId, standardId, learningObjectiveId } =
    useParams<{
      curriculumId: string;
      competencyId: string;
      standardId: string;
      learningObjectiveId: string;
    }>();

  const [items, setItems] = useState<ExerciseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!curriculumId || !competencyId || !standardId || !learningObjectiveId) {
      setError("Ruta inválida (faltan identificadores).");
      setLoading(false);
      return;
    }
    const ac = new AbortController();
    (async () => {
      try {
        const data = await getExercises(
          curriculumId,
          competencyId,
          standardId,
          learningObjectiveId,
          "active",
          ac.signal
        );
        setItems(data ?? []);
      } catch (e) {
        if (isAbortError(e)) return; // ⬅️ sin warnings de any
        console.error(e);
        setError("No se pudieron cargar los ejercicios.");
        showToast.error("No se pudieron cargar los ejercicios.");
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [curriculumId, competencyId, standardId, learningObjectiveId]);

  if (loading) return <LoadingScreen />;
  if (error)
    return <div className="p-4 text-red-600 dark:text-red-400">{error}</div>;

  return (
    <div className="p-4 md:p-8">
      <h1 className="mb-6 text-2xl font-bold text-emerald-700 dark:text-emerald-300">
        📝 Práctica
      </h1>

      {items.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-300">
          Aún no hay ejercicios para este objetivo de aprendizaje.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {items.map((ex, idx) => (
            <ExerciseCard
              key={ex.id}
              exercise={ex}
              curriculumId={curriculumId!}
              competencyId={competencyId!}
              standardId={standardId!}
              learningObjectiveId={learningObjectiveId!}
              index={idx}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function isAbortError(e: unknown): boolean {
  // axios v1 cancela con code 'ERR_CANCELED'
  if (axios.isCancel && axios.isCancel(e)) return true;
  const ax = e as AxiosError;
  if (ax && ax.code === "ERR_CANCELED") return true;

  // fetch/Dom AbortController
  return (
    typeof DOMException !== "undefined" &&
    e instanceof DOMException &&
    e.name === "AbortError"
  );
}
