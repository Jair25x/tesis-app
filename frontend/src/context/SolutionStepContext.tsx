import { createContext } from "react";
import type { SolutionStepResponse } from "../types/exercise/SolutionStepResponse";

export interface SolutionStepContextType {
  solutionSteps: SolutionStepResponse[];
  status: "all" | "active" | "inactive";
  setStatus: (status: "all" | "active" | "inactive") => void;
  refreshSolutionSteps: (
    curriculumId: string,
    competencyId: string,
    standardId: string,
    learningObjectiveId: string,
    exerciseId: string
  ) => Promise<void>;
  loading: boolean;
  error: string;
}

export const SolutionStepContext = createContext<
  SolutionStepContextType | undefined
>(undefined);
