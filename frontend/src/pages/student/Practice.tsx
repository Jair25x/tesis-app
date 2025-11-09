// src/pages/student/Practice.tsx
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axios, { AxiosError } from "axios";

import { getExercises } from "../../services/exerciseService";
import { getCurriculumFull } from "../../services/curriculumService";
import type { ExerciseResponse } from "../../types/exercise/ExerciseResponse";
import type { CurriculumFullResponse } from "../../types/curriculum/CurriculumFullResponse";

import LoadingScreen from "../../components/LoadingScreen";
import ExerciseCard from "../../components/student/ExerciseCard";
import { showToast } from "../../utils/showToast";
import { pushRecentObjective } from "../../utils/recentObjectives";

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

  // Metadatos para “Recientes”
  const [meta, setMeta] = useState<{
    competencyName: string;
    standardName: string;
    objectiveName: string;
  }>({ competencyName: "", standardName: "", objectiveName: "" });

  // Evita empujar a recientes más de una vez por montaje / set de IDs
  const pushedRef = useRef<boolean>(false);

  // Carga de ejercicios
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
        if (isAbortError(e)) return;
        console.error(e);
        setError("No se pudieron cargar los ejercicios.");
        showToast.error("No se pudieron cargar los ejercicios.");
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [curriculumId, competencyId, standardId, learningObjectiveId]);

  // Carga de nombres (competencia/estándar/objetivo) desde el currículo completo
  useEffect(() => {
    if (!curriculumId || !competencyId || !standardId || !learningObjectiveId) {
      return;
    }
    const ac = new AbortController();

    (async () => {
      try {
        const tree: CurriculumFullResponse = await getCurriculumFull(
          curriculumId,
          ac.signal
        );

        const comp = tree.competencies.find((c) => c.id === competencyId);
        const std = comp?.standards.find((s) => s.id === standardId);
        const lo = std?.learningObjectives.find(
          (o) => o.id === learningObjectiveId
        );

        setMeta({
          competencyName: comp?.name ?? "",
          standardName: std?.name ?? "",
          objectiveName: lo?.name ?? "",
        });
      } catch (e) {
        if (isAbortError(e)) return;
        // No rompemos la práctica si falla el árbol; solo quedarán nombres vacíos.
        console.warn("No se pudo resolver nombres para recientes:", e);
      }
    })();

    return () => ac.abort();
  }, [curriculumId, competencyId, standardId, learningObjectiveId]);

  // Empujar a “Recientes” (una sola vez por combinación de IDs)
  useEffect(() => {
    if (pushedRef.current) return;

    if (curriculumId && competencyId && standardId && learningObjectiveId) {
      pushedRef.current = true; // marca para evitar duplicados

      pushRecentObjective({
        curriculumId,
        competencyId,
        competencyName: meta.competencyName, // puede ir vacío si aún no cargó
        standardId,
        standardName: meta.standardName, // puede ir vacío si aún no cargó
        objectiveId: learningObjectiveId,
        objectiveName: meta.objectiveName, // puede ir vacío si aún no cargó
        ts: new Date().toISOString(),
      });
    }
    // Solo depende de los IDs; los nombres pueden llegar luego y se actualizarán la próxima visita
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curriculumId, competencyId, standardId, learningObjectiveId]);

  if (loading) return <LoadingScreen />;
  if (error) {
    return <div className="p-4 text-red-600 dark:text-red-400">{error}</div>;
  }

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

  // AbortController nativo
  return (
    typeof DOMException !== "undefined" &&
    e instanceof DOMException &&
    e.name === "AbortError"
  );
}
