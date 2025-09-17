// src/hooks/progress/useAttemptMutation.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postAttempt } from "../../services/progressService";
import type {
  AttemptRequest,
  AttemptResponse,
  ObjectiveStatusSets,
} from "../../types/progress/ProgressTypes";
import { qk } from "./queryKeys";

export const useAttemptMutation = () => {
  const qc = useQueryClient();

  return useMutation<AttemptResponse, unknown, AttemptRequest>({
    mutationFn: postAttempt,
    onSuccess: (res, vars) => {
      // 1) Update optimista: mover el OA a su set correcto según sop.status
      //    (MASTERED -> COMPLETED; IN_PROGRESS -> IN_PROGRESS; NOT_STARTED -> NOT_STARTED)
      const next = res.sop?.status;
      const objectiveId = vars.learningObjectiveId;
      const curriculumId = vars.curriculumId;

      if (next && objectiveId) {
        qc.setQueryData<ObjectiveStatusSets | undefined>(
          qk.objectiveStatuses(curriculumId),
          (prev) => {
            if (!prev) return prev;
            const completedIds = new Set(prev.completedIds);
            const inProgressIds = new Set(prev.inProgressIds);
            const notStartedIds = new Set(prev.notStartedIds);

            // quitar de todos
            completedIds.delete(objectiveId);
            inProgressIds.delete(objectiveId);
            notStartedIds.delete(objectiveId);

            // agregar al set destino
            if (next === "MASTERED") {
              completedIds.add(objectiveId);
            } else if (next === "IN_PROGRESS") {
              inProgressIds.add(objectiveId);
            } else {
              notStartedIds.add(objectiveId);
            }

            return { completedIds, inProgressIds, notStartedIds };
          }
        );
      }

      // 2) Invalidaciones para consolidar datos (resuelve cobertura, overview, etc.)
      qc.invalidateQueries({ queryKey: qk.overview });
      qc.invalidateQueries({ queryKey: qk.streak });
      qc.invalidateQueries({ queryKey: qk.achievements });

      // Estados y cobertura (todas las variantes cacheadas)
      qc.invalidateQueries({
        predicate: (q) =>
          Array.isArray(q.queryKey) &&
          q.queryKey[0] === "progress" &&
          (q.queryKey[1] === "objective-statuses" ||
            q.queryKey[1] === "objective-coverage"),
      });

      // Series personales
      qc.invalidateQueries({
        predicate: (q) =>
          Array.isArray(q.queryKey) &&
          q.queryKey[0] === "progress" &&
          q.queryKey[1] === "me" &&
          q.queryKey[2] === "series",
      });
    },
  });
};
