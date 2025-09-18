// src/hooks/useExerciseByHierarchy.ts
import { useQuery } from "@tanstack/react-query";
import { getExerciseById } from "../services/exerciseService";
import type { ExerciseResponse } from "../types/exercise/ExerciseResponse";

export interface ExercisePathParams {
  curriculumId: string;
  competencyId: string;
  standardId: string;
  learningObjectiveId: string;
  exerciseId: string;
}

export function useExerciseByHierarchy(params: ExercisePathParams) {
  const {
    curriculumId,
    competencyId,
    standardId,
    learningObjectiveId,
    exerciseId,
  } = params;

  return useQuery<ExerciseResponse>({
    queryKey: [
      "exercise",
      curriculumId,
      competencyId,
      standardId,
      learningObjectiveId,
      exerciseId,
    ],
    queryFn: () =>
      getExerciseById(
        curriculumId,
        competencyId,
        standardId,
        learningObjectiveId,
        exerciseId
      ),
    enabled: Object.values(params).every(Boolean),
    staleTime: 30_000,
  });
}

/**
 * ⚠️ Importante:
 * Si en algún lugar del código aún importas `useCheckExerciseByHierarchy`,
 * elimínalo y usa `useAttemptMutation` (hooks/progress/useAttemptMutation)
 * como hiciste en ExercisePlayerByHierarchy.
 */
