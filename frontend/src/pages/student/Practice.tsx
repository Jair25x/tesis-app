// src/pages/student/Practice.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getExercises } from "../../services/exerciseService";
import type { ExerciseResponse } from "../../types/exercise/ExerciseResponse";
import LoadingScreen from "../../components/LoadingScreen";
import { showToast } from "../../utils/showToast";
import ExerciseCard from "../../components/student/ExerciseCard";


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
    (async () => {
      try {
        const data = await getExercises(
          curriculumId,
          competencyId,
          standardId,
          learningObjectiveId,
          "active"
        );
        setItems(data ?? []);
      } catch (e) {
        console.error(e);
        setError("No se pudieron cargar los ejercicios.");
        showToast.error("No se pudieron cargar los ejercicios.");
      } finally {
        setLoading(false);
      }
    })();
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
