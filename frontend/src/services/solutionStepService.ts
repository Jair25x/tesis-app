import api from "./api";
import type {
  SolutionStepRequest,
  SolutionStepResponse,
} from "../types/exercise/SolutionStepResponse";

const BASE_PATH = "/curricula";

export const getSolutionSteps = async (
  curriculumId: string,
  competencyId: string,
  standardId: string,
  learningObjectiveId: string,
  exerciseId: string,
  status: "all" | "active" | "inactive" = "active"
): Promise<SolutionStepResponse[]> => {
  // Nota: solo los roles ADMIN y TEACHER pueden usar 'all'
  const includeAll = status === "all";
  const suffix = includeAll ? "/all" : "";
  const { data } = await api.get(
    `${BASE_PATH}/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises/${exerciseId}/solution-steps${suffix}`
  );
  return data;
};

export const getSolutionStepById = async (
  curriculumId: string,
  competencyId: string,
  standardId: string,
  learningObjectiveId: string,
  exerciseId: string,
  stepId: string
): Promise<SolutionStepResponse> => {
  const { data } = await api.get(
    `${BASE_PATH}/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises/${exerciseId}/solution-steps/${stepId}`
  );
  return data;
};

export const createSolutionStep = async (
  curriculumId: string,
  competencyId: string,
  standardId: string,
  learningObjectiveId: string,
  exerciseId: string,
  payload: SolutionStepRequest
): Promise<SolutionStepResponse> => {
  const { data } = await api.post(
    `${BASE_PATH}/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises/${exerciseId}/solution-steps`,
    payload
  );
  return data;
};

export const updateSolutionStep = async (
  curriculumId: string,
  competencyId: string,
  standardId: string,
  learningObjectiveId: string,
  exerciseId: string,
  stepId: string,
  payload: SolutionStepRequest
): Promise<SolutionStepResponse> => {
  const { data } = await api.put(
    `${BASE_PATH}/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises/${exerciseId}/solution-steps/${stepId}`,
    payload
  );
  return data;
};

export const deleteSolutionStep = async (
  curriculumId: string,
  competencyId: string,
  standardId: string,
  learningObjectiveId: string,
  exerciseId: string,
  stepId: string
): Promise<void> => {
  await api.delete(
    `${BASE_PATH}/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises/${exerciseId}/solution-steps/${stepId}`
  );
};

export const reactivateSolutionStep = async (
  curriculumId: string,
  competencyId: string,
  standardId: string,
  learningObjectiveId: string,
  exerciseId: string,
  stepId: string
): Promise<void> => {
  await api.patch(
    `${BASE_PATH}/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises/${exerciseId}/solution-steps/${stepId}/reactivate`
  );
};
