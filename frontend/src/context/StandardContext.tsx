import { createContext } from "react";
import type { StandardResponse } from "../types/curriculum/StandardResponse";
export type StatusType = "all" | "active" | "inactive";

export interface StandardContextType {
  standards: StandardResponse[];
  status: "all" | "active" | "inactive";
  setStatus: (status: "all" | "active" | "inactive") => void;
  refreshStandards: (
    curriculumId: string,
    competencyId: string
  ) => Promise<void>;
  loading: boolean;
  error: string;
}

export const StandardContext = createContext<StandardContextType | undefined>(
  undefined
);
