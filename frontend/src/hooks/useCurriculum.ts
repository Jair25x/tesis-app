import { useContext } from "react";
import { CurriculumContext } from "../context/CurriculumContext";

export const useCurriculum = () => {
  const context = useContext(CurriculumContext);
  if (!context) {
    throw new Error("useCurriculum debe usarse dentro de CurriculumProvider");
  }
  return context;
};
