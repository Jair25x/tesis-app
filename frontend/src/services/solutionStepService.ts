import axios from "axios";
import type { SolutionStepRequest, SolutionStepResponse } from "../types/exercise/SolutionStepResponse";


// Base para las rutas anidadas
const BASE_URL = "/curricula";

export async function getSolutionSteps(
  curriculumId: string,
  competencyId: string,
  standardId: string,
  learningObjectiveId: string,
  exerciseId: string,
  includeAll: boolean = false
): Promise<SolutionStepResponse[]> {
  const suffix = includeAll ? "/all" : "";
  const response = await axios.get(
    `${BASE_URL}/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises/${exerciseId}/solution-steps${suffix}`
  );
  return response.data;
}

export async function getSolutionStepById(
  curriculumId: string,
  competencyId: string,
  standardId: string,
  learningObjectiveId: string,
  exerciseId: string,
  stepId: string
): Promise<SolutionStepResponse> {
  const response = await axios.get(
    `${BASE_URL}/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises/${exerciseId}/solution-steps/${stepId}`
  );
  return response.data;
}

export async function createSolutionStep(
  curriculumId: string,
  competencyId: string,
  standardId: string,
  learningObjectiveId: string,
  exerciseId: string,
  payload: SolutionStepRequest
): Promise<SolutionStepResponse> {
  const response = await axios.post(
    `${BASE_URL}/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises/${exerciseId}/solution-steps`,
    payload
  );
  return response.data;
}

export async function updateSolutionStep(
  curriculumId: string,
  competencyId: string,
  standardId: string,
  learningObjectiveId: string,
  exerciseId: string,
  stepId: string,
  payload: SolutionStepRequest
): Promise<SolutionStepResponse> {
  const response = await axios.put(
    `${BASE_URL}/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises/${exerciseId}/solution-steps/${stepId}`,
    payload
  );
  return response.data;
}

export async function deleteSolutionStep(
  curriculumId: string,
  competencyId: string,
  standardId: string,
  learningObjectiveId: string,
  exerciseId: string,
  stepId: string
): Promise<void> {
  await axios.delete(
    `${BASE_URL}/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises/${exerciseId}/solution-steps/${stepId}`
  );
}

export async function reactivateSolutionStep(
  curriculumId: string,
  competencyId: string,
  standardId: string,
  learningObjectiveId: string,
  exerciseId: string,
  stepId: string
): Promise<void> {
  await axios.patch(
    `${BASE_URL}/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises/${exerciseId}/solution-steps/${stepId}/reactivate`
  );
}
