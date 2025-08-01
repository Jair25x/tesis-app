import { useState, useEffect } from "react";
import { getAllCurricula } from "../services/curriculumService";
import { CurriculumContext } from "./CurriculumContext";
import type { CurriculumResponse } from "../types/curriculum/Curriculum";
import type { CurriculumContextType } from "./CurriculumContext";

export const CurriculumProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [curricula, setCurricula] = useState<CurriculumResponse[]>([]);

  const refreshCurricula: CurriculumContextType["refreshCurricula"] =
    async () => {
      try {
        const res = await getAllCurricula("active");
        setCurricula(res.data);
      } catch (error) {
        console.error("Error al cargar los currículos:", error);
        setCurricula([]);
      }
    };

  useEffect(() => {
    refreshCurricula();
  }, []);

  return (
    <CurriculumContext.Provider value={{ curricula, refreshCurricula }}>
      {children}
    </CurriculumContext.Provider>
  );
};
