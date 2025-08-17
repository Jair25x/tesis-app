// src/context/CurriculumProvider.tsx
import { useState, useEffect, useCallback } from "react";
import { getAllCurricula } from "../services/curriculumService";
import { CurriculumContext } from "./CurriculumContext";
import type { CurriculumResponse } from "../types/curriculum/Curriculum";
import type { CurriculumContextType } from "./CurriculumContext";
import { useAuth } from "../context/useAuth";

export const CurriculumProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { isAuthenticated } = useAuth();
  const [curricula, setCurricula] = useState<CurriculumResponse[]>([]);

  const refreshCurricula: CurriculumContextType["refreshCurricula"] =
    useCallback(async () => {
      const ctrl = new AbortController();
      try {
        const res = await getAllCurricula("active", ctrl.signal);
        setCurricula(res); // ⬅️ antes: res.data (incorrecto)
      } catch (error) {
        // si fue cancelación, ignora
        if (
          (error as Error)?.name !== "CanceledError" &&
          (error as Error)?.name !== "AbortError"
        ) {
          console.error("Error al cargar los currículos:", error);
          setCurricula([]);
        }
      }
      // no exponemos ctrl hacia fuera; refresh manual no cancela
    }, []);

  useEffect(() => {
    if (!isAuthenticated) return; // ⬅️ no pegues sin sesión
    const ctrl = new AbortController();
    getAllCurricula("active", ctrl.signal)
      .then(setCurricula)
      .catch((error) => {
        if (
          (error as Error)?.name !== "CanceledError" &&
          (error as Error)?.name !== "AbortError"
        ) {
          console.error("Error al cargar los currículos:", error);
          setCurricula([]);
        }
      });
    return () => ctrl.abort();
  }, [isAuthenticated]);

  return (
    <CurriculumContext.Provider value={{ curricula, refreshCurricula }}>
      {children}
    </CurriculumContext.Provider>
  );
};
