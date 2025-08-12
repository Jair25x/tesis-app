import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllTemplates } from "../services/templateService";
import { createExercise } from "../services/exerciseService";
import type { TemplateSchemaResponse } from "../types/exercise/TemplateSchemaResponse";
import type { ExerciseRequest } from "../types/exercise/ExerciseRequest";

type CreateExerciseVars = {
  curriculumId: string;
  competencyId: string;
  standardId: string;
  learningObjectiveId: string;
  body: ExerciseRequest;
};

export function useTemplatesQuery(curriculumId: string) {
  return useQuery<TemplateSchemaResponse[]>({
    queryKey: ["templates", curriculumId],
    queryFn: () => getAllTemplates(curriculumId),
    enabled: Boolean(curriculumId),
    staleTime: 5 * 60_000,
  });
}

export function useCreateExerciseMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: CreateExerciseVars) =>
      createExercise(
        vars.curriculumId,
        vars.competencyId,
        vars.standardId,
        vars.learningObjectiveId,
        vars.body
      ),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({
        queryKey: [
          "exercisesByLO",
          vars.curriculumId,
          vars.competencyId,
          vars.standardId,
          vars.learningObjectiveId,
        ],
      });
    },
  });
}
