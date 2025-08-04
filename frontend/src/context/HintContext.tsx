import { createContext } from "react";
import type { HintResponse } from "../types/exercise/HintResponse";

export interface HintContextType {
  hints: HintResponse[];
  status: "all" | "active" | "inactive";
  setStatus: (status: "all" | "active" | "inactive") => void;
  refreshHints: (
    curriculumId: string,
    competencyId: string,
    standardId: string,
    learningObjectiveId: string,
    exerciseId: string
  ) => Promise<void>;
  loading: boolean;
  error: string;
}

export const HintContext = createContext<HintContextType | undefined>(
  undefined
);
