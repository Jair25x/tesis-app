import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useParams } from "react-router-dom";
import { ExerciseContext } from "./ExerciseContext";
import type { ExerciseResponse } from "../types/exercise/ExerciseResponse";
import { getExercises } from "../services/exerciseService";

export const ExerciseProvider = ({ children }: { children: ReactNode }) => {
  const { curriculumId, competencyId, standardId, learningObjectiveId } =
    useParams<{
      curriculumId: string;
      competencyId: string;
      standardId: string;
      learningObjectiveId: string;
    }>();

  const [exercises, setExercises] = useState<ExerciseResponse[]>([]);
  const [status, setStatus] = useState<"all" | "active" | "inactive">("active");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refreshExercises = async (
    curriculumIdParam: string,
    competencyIdParam: string,
    standardIdParam: string,
    learningObjectiveIdParam: string
  ) => {
    if (
      !curriculumIdParam ||
      !competencyIdParam ||
      !standardIdParam ||
      !learningObjectiveIdParam
    )
      return;

    setLoading(true);
    setError("");

    try {
      const data = await getExercises(
        curriculumIdParam,
        competencyIdParam,
        standardIdParam,
        learningObjectiveIdParam,
        status
      );
      setExercises(data);
    } catch (err) {
      console.error("Error al cargar ejercicios:", err);
      setExercises([]);
      setError("No se pudieron cargar los ejercicios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (curriculumId && competencyId && standardId && learningObjectiveId) {
      refreshExercises(
        curriculumId,
        competencyId,
        standardId,
        learningObjectiveId
      );
    }
  }, [status, curriculumId, competencyId, standardId, learningObjectiveId]);

  return (
    <ExerciseContext.Provider
      value={{
        exercises,
        status,
        setStatus,
        refreshExercises,
        loading,
        error,
      }}
    >
      {children}
    </ExerciseContext.Provider>
  );
};
