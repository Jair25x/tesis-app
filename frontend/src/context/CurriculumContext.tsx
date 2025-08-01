import { createContext } from "react";
import type { CurriculumResponse } from "../types/curriculum/Curriculum";

export interface CurriculumContextType {
  curricula: CurriculumResponse[];
  refreshCurricula: () => Promise<void>;
}

export const CurriculumContext = createContext<
  CurriculumContextType | undefined
>(undefined);
