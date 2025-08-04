import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useParams } from "react-router-dom";
import { LearningObjectiveContext } from "./LearningObjectiveContext";
import type { LearningObjectiveResponse } from "../types/curriculum/LearningObjectiveResponse";
import { getLearningObjectives } from "../services/learningObjectiveService";

export const LearningObjectiveProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { curriculumId, competencyId, standardId } = useParams<{
    curriculumId: string;
    competencyId: string;
    standardId: string;
  }>();

  const [learningObjectives, setLearningObjectives] = useState<
    LearningObjectiveResponse[]
  >([]);
  const [status, setStatus] = useState<"all" | "active" | "inactive">("active");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refreshLearningObjectives = async (
    curriculumIdParam: string,
    competencyIdParam: string,
    standardIdParam: string
  ) => {
    if (!curriculumIdParam || !competencyIdParam || !standardIdParam) return;
    setLoading(true);
    setError("");

    try {
      const data = await getLearningObjectives(
        curriculumIdParam,
        competencyIdParam,
        standardIdParam,
        status
      );
      setLearningObjectives(data);
    } catch (err) {
      console.error("Error al cargar objetivos de aprendizaje:", err);
      setLearningObjectives([]);
      setError("No se pudieron cargar los objetivos de aprendizaje.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (curriculumId && competencyId && standardId) {
      refreshLearningObjectives(curriculumId, competencyId, standardId);
    }
  }, [status, curriculumId, competencyId, standardId]);

  return (
    <LearningObjectiveContext.Provider
      value={{
        learningObjectives,
        status,
        setStatus,
        refreshLearningObjectives,
        loading,
        error,
      }}
    >
      {children}
    </LearningObjectiveContext.Provider>
  );
};
