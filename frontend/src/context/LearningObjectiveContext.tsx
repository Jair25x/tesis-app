import { createContext } from "react";
import type { LearningObjectiveResponse } from "../types/curriculum/LearningObjectiveResponse";

export interface LearningObjectiveContextType {
  learningObjectives: LearningObjectiveResponse[];
  status: "all" | "active" | "inactive";
  setStatus: (status: "all" | "active" | "inactive") => void;
  refreshLearningObjectives: (
    curriculumId: string,
    competencyId: string,
    standardId: string
  ) => Promise<void>;
  loading: boolean;
  error: string;
}

export const LearningObjectiveContext = createContext<
  LearningObjectiveContextType | undefined
>(undefined);
