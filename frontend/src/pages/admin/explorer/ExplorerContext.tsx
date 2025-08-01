// src/pages/admin/explorer/ExplorerContext.ts
import { createContext, useContext } from "react";
import type { CurriculumResponse } from "../../../types/curriculum/Curriculum";
import type { CompetencyResponse } from "../../../types/curriculum/Competency";
import type { StandardResponse } from "../../../types/curriculum/StandardResponse";
import type { LearningObjectiveResponse } from "../../../types/curriculum/LearningObjectiveResponse"; // 👈

export interface ExplorerContextType {
  selectedCurriculum: CurriculumResponse | null;
  setSelectedCurriculum: (curriculum: CurriculumResponse | null) => void;

  selectedCompetency: CompetencyResponse | null;
  setSelectedCompetency: (competency: CompetencyResponse | null) => void;

  selectedStandard: StandardResponse | null;
  setSelectedStandard: (standard: StandardResponse | null) => void;

  selectedObjective: LearningObjectiveResponse | null; // 👈
  setSelectedObjective: (objective: LearningObjectiveResponse | null) => void; // 👈
}

export const ExplorerContext = createContext<ExplorerContextType | undefined>(
  undefined
);

export const useExplorerContext = () => {
  const context = useContext(ExplorerContext);
  if (!context) {
    throw new Error(
      "useExplorerContext debe usarse dentro de ExplorerProvider"
    );
  }
  return context;
};
