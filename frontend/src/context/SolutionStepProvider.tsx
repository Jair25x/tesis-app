import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useParams } from "react-router-dom";
import { SolutionStepContext } from "./SolutionStepContext";
import type { SolutionStepResponse } from "../types/exercise/SolutionStepResponse";
import { getSolutionSteps } from "../services/solutionStepService";

export const SolutionStepProvider = ({ children }: { children: ReactNode }) => {
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

  const [solutionSteps, setSolutionSteps] = useState<SolutionStepResponse[]>(
    []
  );
  const [status, setStatus] = useState<"all" | "active" | "inactive">("active");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refreshSolutionSteps = async (
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
      const statusParam: "all" | "active" | "inactive" =
        status === "all" ? "all" : "active";

      const data = await getSolutionSteps(
        curriculumIdParam,
        competencyIdParam,
        standardIdParam,
        learningObjectiveIdParam,
        exerciseIdParam,
        statusParam
      );

      // Si se pide estado específico, filtrar manualmente
      const filteredData =
        status === "active"
          ? data.filter((s) => s.active)
          : status === "inactive"
          ? data.filter((s) => !s.active)
          : data;

      setSolutionSteps(filteredData);
    } catch (err) {
      console.error("Error al cargar pasos de solución:", err);
      setSolutionSteps([]);
      setError("No se pudieron cargar los pasos de solución.");
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
      refreshSolutionSteps(
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
    <SolutionStepContext.Provider
      value={{
        solutionSteps,
        status,
        setStatus,
        refreshSolutionSteps,
        loading,
        error,
      }}
    >
      {children}
    </SolutionStepContext.Provider>
  );
};
