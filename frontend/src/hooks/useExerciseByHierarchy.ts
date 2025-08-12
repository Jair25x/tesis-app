import { useQuery, useMutation } from "@tanstack/react-query";
import { getExerciseById, checkAnswer } from "../services/exerciseService";
import type { ExerciseResponse } from "../types/exercise/ExerciseResponse";
import type { CheckAnswerResponse } from "../types/exercise/CheckAnswer";
import type { StudentAnswerShape } from "../types/exercise/TemplateParams";

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
 * Adaptador temporal:
 * Backend espera { studentAnswer: string }; enviamos JSON.stringify(shape).
 * Cuando migres a { answer: ... }, sólo cambia aquí.
 */
export function useCheckExerciseByHierarchy(params: ExercisePathParams) {
  return useMutation<CheckAnswerResponse, unknown, StudentAnswerShape>({
    mutationFn: (shape: StudentAnswerShape) =>
      checkAnswer(
        params.curriculumId,
        params.competencyId,
        params.standardId,
        params.learningObjectiveId,
        params.exerciseId,
        { studentAnswer: JSON.stringify(shape) }
      ),
  });
}
