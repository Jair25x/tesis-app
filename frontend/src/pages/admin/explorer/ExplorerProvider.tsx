// src/pages/admin/explorer/ExplorerProvider.tsx
import { useState } from "react";
import type { ReactNode } from "react";
import { ExplorerContext } from "./ExplorerContext";

import type { CurriculumResponse } from "../../../types/curriculum/Curriculum";
import type { CompetencyResponse } from "../../../types/curriculum/Competency";
import type { StandardResponse } from "../../../types/curriculum/StandardResponse";
import type { LearningObjectiveResponse } from "../../../types/curriculum/LearningObjectiveResponse"; // ✅ Agregado

export const ExplorerProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCurriculum, setSelectedCurriculum] =
    useState<CurriculumResponse | null>(null);

  const [selectedCompetency, setSelectedCompetency] =
    useState<CompetencyResponse | null>(null);

  const [selectedStandard, setSelectedStandard] =
    useState<StandardResponse | null>(null);

  const [selectedObjective, setSelectedObjective] =
    useState<LearningObjectiveResponse | null>(null); // ✅ Añadido

  return (
    <ExplorerContext.Provider
      value={{
        selectedCurriculum,
        setSelectedCurriculum,
        selectedCompetency,
        setSelectedCompetency,
        selectedStandard,
        setSelectedStandard,
        selectedObjective,
        setSelectedObjective, 
      }}
    >
      {children}
    </ExplorerContext.Provider>
  );
};
