// src/context/CompetencyContext.ts
import { createContext } from "react";
import type { CompetencyResponse } from "../types/curriculum/Competency";

export interface CompetencyContextType {
  competencies: CompetencyResponse[];
  status: "all" | "active" | "inactive";
  setStatus: (status: "all" | "active" | "inactive") => void;
  refreshCompetencies: (curriculumId: string) => Promise<void>;
  loading: boolean;
  error: string;
}

export const CompetencyContext = createContext<
  CompetencyContextType | undefined
>(undefined);
