// src/hooks/progress/useAttemptMutation.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postAttempt } from "../../services/progressService";
import type {
  AttemptRequest,
  AttemptResponse,
  ObjectiveStatusSets,
} from "../../types/progress/ProgressTypes";
import { qk } from "./queryKeys";

const PREFETCH_RECO_ON_ATTEMPT =
  (import.meta.env.VITE_RECO_PREFETCH_ON_ATTEMPT ?? "true") === "true";

export const useAttemptMutation = () => {
  const qc = useQueryClient();

  return useMutation<AttemptResponse, unknown, AttemptRequest>({
    mutationFn: postAttempt,
    onSuccess: async (res, vars) => {
      // 1) Update optimista de estados por objetivo
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

            completedIds.delete(objectiveId);
            inProgressIds.delete(objectiveId);
            notStartedIds.delete(objectiveId);

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

      // 2) Invalidaciones de progresos agregados
      qc.invalidateQueries({ queryKey: qk.overview });
      qc.invalidateQueries({ queryKey: qk.streak });
      qc.invalidateQueries({ queryKey: qk.achievements });

      // 3) Estados/cobertura (todas las variantes cacheadas)
      qc.invalidateQueries({
        predicate: (q) =>
          Array.isArray(q.queryKey) &&
          q.queryKey[0] === "progress" &&
          (q.queryKey[1] === "objective-statuses" ||
            q.queryKey[1] === "objective-coverage"),
      });

      // 4) Series personales
      qc.invalidateQueries({
        predicate: (q) =>
          Array.isArray(q.queryKey) &&
          q.queryKey[0] === "progress" &&
          q.queryKey[1] === "me" &&
          q.queryKey[2] === "series",
      });

      // 5) Recomendaciones: invalida ambos esquemas de clave (legacy + nuevo hook)
      qc.invalidateQueries({
        predicate: (q) =>
          Array.isArray(q.queryKey) &&
          ((q.queryKey[0] === "ai" && q.queryKey[1] === "reco") ||
            q.queryKey[0] === "reco"),
      });

      // 6) (Opcional) Prefetch del set principal con fresh=true para UX instantáneo
      if (PREFETCH_RECO_ON_ATTEMPT) {
        const { getRecommendationsMe } = await import(
          "../../services/aiService"
        );
        await qc.prefetchQuery({
          queryKey: ["reco", "me", 8, "math", "any"], // ajusta a tu panel principal
          queryFn: () =>
            getRecommendationsMe({ fresh: true, limit: 8, subject: "math" }),
        });
      }
    },
  });
};
