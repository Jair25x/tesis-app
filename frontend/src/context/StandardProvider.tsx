import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { StandardContext } from "./StandardContext";
import { getStandards } from "../services/standardService";
import type { StandardResponse } from "../types/curriculum/StandardResponse";
import { useParams } from "react-router-dom";

export const StandardProvider = ({ children }: { children: ReactNode }) => {
  const { curriculumId, competencyId } = useParams<{
    curriculumId: string;
    competencyId: string;
  }>();

  const [standards, setStandards] = useState<StandardResponse[]>([]);
  const [status, setStatus] = useState<"all" | "active" | "inactive">("active");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refreshStandards = async (
    curriculumIdParam: string,
    competencyIdParam: string
  ) => {
    if (!curriculumIdParam || !competencyIdParam) return;
    setLoading(true);
    setError("");

    try {
      const { data } = await getStandards(
        curriculumIdParam,
        competencyIdParam,
        status
      );
      setStandards(data);
    } catch (err) {
      console.error("Error al cargar estándares:", err);
      setStandards([]);
      setError("No se pudo cargar estándares.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-recarga al cambiar el filtro
  useEffect(() => {
    if (curriculumId && competencyId) {
      refreshStandards(curriculumId, competencyId);
    }
  }, [status, curriculumId, competencyId]);

  return (
    <StandardContext.Provider
      value={{
        standards,
        refreshStandards,
        status,
        setStatus,
        loading,
        error,
      }}
    >
      {children}
    </StandardContext.Provider>
  );
};
