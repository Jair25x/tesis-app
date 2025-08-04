import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useParams } from "react-router-dom";
import { HintContext } from "./HintContext";
import type { HintResponse } from "../types/exercise/HintResponse";
import { getHints } from "../services/hintService";

export const HintProvider = ({ children }: { children: ReactNode }) => {
  const {
    curriculumId,
    competencyId,
    standardId,
    learningObjectiveId,
    exerciseId,
  } = useParams<{
    curriculumId: string;
    competencyId: string;
    standardId: string;
    learningObjectiveId: string;
    exerciseId: string;
  }>();

  const [hints, setHints] = useState<HintResponse[]>([]);
  const [status, setStatus] = useState<"all" | "active" | "inactive">("active");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refreshHints = async (
    curriculumIdParam: string,
    competencyIdParam: string,
    standardIdParam: string,
    learningObjectiveIdParam: string,
    exerciseIdParam: string
  ) => {
    if (
      !curriculumIdParam ||
      !competencyIdParam ||
      !standardIdParam ||
      !learningObjectiveIdParam ||
      !exerciseIdParam
    )
      return;

    setLoading(true);
    setError("");

    try {
      const data = await getHints(
        curriculumIdParam,
        competencyIdParam,
        standardIdParam,
        learningObjectiveIdParam,
        exerciseIdParam,
        status
      );
      setHints(data);
    } catch (err) {
      console.error("Error al cargar pistas:", err);
      setHints([]);
      setError("No se pudieron cargar las pistas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      curriculumId &&
      competencyId &&
      standardId &&
      learningObjectiveId &&
      exerciseId
    ) {
      refreshHints(
        curriculumId,
        competencyId,
        standardId,
        learningObjectiveId,
        exerciseId
      );
    }
  }, [
    status,
    curriculumId,
    competencyId,
    standardId,
    learningObjectiveId,
    exerciseId,
  ]);

  return (
    <HintContext.Provider
      value={{
        hints,
        status,
        setStatus,
        refreshHints,
        loading,
        error,
      }}
    >
      {children}
    </HintContext.Provider>
  );
};
