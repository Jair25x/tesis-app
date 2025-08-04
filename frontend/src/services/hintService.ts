import type { HintRequest, HintResponse } from "../types/exercise/HintResponse";
import api from "./api";


const BASE_PATH = "/curricula";

export const getHints = async (
  curriculumId: string,
  competencyId: string,
  standardId: string,
  learningObjectiveId: string,
  exerciseId: string,
  status: "all" | "active" | "inactive" = "active"
): Promise<HintResponse[]> => {
  const { data } = await api.get(
    `${BASE_PATH}/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises/${exerciseId}/hints`,
    { params: { status } }
  );
  return data;
};

export const getHintById = async (
  curriculumId: string,
  competencyId: string,
  standardId: string,
  learningObjectiveId: string,
  exerciseId: string,
  hintId: string
): Promise<HintResponse> => {
  const { data } = await api.get(
    `${BASE_PATH}/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises/${exerciseId}/hints/${hintId}`
  );
  return data;
};

export const createHint = async (
  curriculumId: string,
  competencyId: string,
  standardId: string,
  learningObjectiveId: string,
  exerciseId: string,
  payload: HintRequest
): Promise<HintResponse> => {
  const { data } = await api.post(
    `${BASE_PATH}/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises/${exerciseId}/hints`,
    payload
  );
  return data;
};

export const updateHint = async (
  curriculumId: string,
  competencyId: string,
  standardId: string,
  learningObjectiveId: string,
  exerciseId: string,
  hintId: string,
  payload: HintRequest
): Promise<HintResponse> => {
  const { data } = await api.put(
    `${BASE_PATH}/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises/${exerciseId}/hints/${hintId}`,
    payload
  );
  return data;
};

export const deleteHint = async (
  curriculumId: string,
  competencyId: string,
  standardId: string,
  learningObjectiveId: string,
  exerciseId: string,
  hintId: string
): Promise<void> => {
  await api.delete(
    `${BASE_PATH}/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises/${exerciseId}/hints/${hintId}`
  );
};

export const reactivateHint = async (
  curriculumId: string,
  competencyId: string,
  standardId: string,
  learningObjectiveId: string,
  exerciseId: string,
  hintId: string
): Promise<void> => {
  await api.patch(
    `${BASE_PATH}/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises/${exerciseId}/hints/${hintId}/reactivate`
  );
};
