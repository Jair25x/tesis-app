// src/hooks/progress/useObjectiveCoverage.ts
import { useQuery } from "@tanstack/react-query";
import { getObjectiveCoverage } from "../../services/progressService";
import type { ObjectiveCoverageItem } from "../../types/progress/ProgressTypes";
import { qk } from "./queryKeys";

export type CoverageMap = Record<
  string,
  { solvedDistinct: number; totalExercises: number }
>;

export function useObjectiveCoverage(curriculumId?: string) {
  return useQuery({
    queryKey: qk.objectiveCoverage(curriculumId),
    queryFn: async () => {
      const items: ObjectiveCoverageItem[] = await getObjectiveCoverage(
        curriculumId
      );
      const map: CoverageMap = {};
      for (const it of items) {
        map[it.objectiveId] = {
          solvedDistinct: it.solvedDistinct ?? 0,
          totalExercises: it.totalExercises ?? 0,
        };
      }
      return map;
    },
    staleTime: 60_000,
  });
}
