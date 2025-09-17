// src/hooks/progress/useObjectiveStatuses.ts
import { useQuery } from "@tanstack/react-query";
import { getObjectiveStatuses } from "../../services/progressService";
import type { ObjectiveStatusSets } from "../../types/progress/ProgressTypes";
import { qk } from "./queryKeys";

export function useObjectiveStatuses(curriculumId?: string) {
  return useQuery({
    queryKey: qk.objectiveStatuses(curriculumId),
    queryFn: async () => {
      const items = await getObjectiveStatuses(curriculumId);
      const completedIds = new Set<string>();
      const inProgressIds = new Set<string>();
      const notStartedIds = new Set<string>();
      for (const it of items) {
        if (it.status === "COMPLETED") completedIds.add(it.objectiveId);
        else if (it.status === "IN_PROGRESS") inProgressIds.add(it.objectiveId);
        else notStartedIds.add(it.objectiveId);
      }
      const sets: ObjectiveStatusSets = {
        completedIds,
        inProgressIds,
        notStartedIds,
      };
      return sets;
    },
    staleTime: 60_000,
  });
}
