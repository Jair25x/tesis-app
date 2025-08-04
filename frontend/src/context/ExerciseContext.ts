import { createContext } from "react";
import type { ExerciseResponse } from "../types/exercise/ExerciseResponse";

export interface ExerciseContextType {
  exercises: ExerciseResponse[];
  status: "all" | "active" | "inactive";
  setStatus: (status: "all" | "active" | "inactive") => void;
  refreshExercises: (
    curriculumId: string,
    competencyId: string,
    standardId: string,
    learningObjectiveId: string
  ) => Promise<void>;
  loading: boolean;
  error: string;
}

export const ExerciseContext = createContext<ExerciseContextType | undefined>(
  undefined
);
