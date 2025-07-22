// src/context/CompetencyProvider.tsx
import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { CompetencyContext } from "./CompetencyContext";
import type { CompetencyResponse } from "../types/Competency";
import { getCompetenciesByCurriculum } from "../services/competencyService";
import { useParams } from "react-router-dom";

export const CompetencyProvider = ({ children }: { children: ReactNode }) => {
  const { curriculumId } = useParams<{ curriculumId: string }>();
  const [competencies, setCompetencies] = useState<CompetencyResponse[]>([]);
  const [status, setStatus] = useState<"all" | "active" | "inactive">("active");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refreshCompetencies = async (curriculumIdParam: string) => {
    if (!curriculumIdParam) return;
    setLoading(true);
    setError("");
    try {
      const data = await getCompetenciesByCurriculum(curriculumIdParam, status);
      setCompetencies(data);
    } catch (err) {
      console.error("Error al cargar competencias:", err);
      setCompetencies([]);
      setError("No se pudo cargar competencias.");
    } finally {
      setLoading(false);
    }
  };

  // Auto refresh cuando cambie el estado del filtro
  useEffect(() => {
    if (curriculumId) {
      refreshCompetencies(curriculumId);
    }
  }, [status, curriculumId]);

  return (
    <CompetencyContext.Provider
      value={{
        competencies,
        refreshCompetencies,
        status,
        setStatus,
        loading,
        error,
      }}
    >
      {children}
    </CompetencyContext.Provider>
  );
};
