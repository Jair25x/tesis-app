import api from "./api";
import type {
  ExerciseResponse,
  CheckAnswerRequest,
  CheckAnswerResponse,
} from "../types/ExerciseResponse";

/** Devuelve lista completa del OA */
export const getExercisesByObjective = async (
  curriculumId: string,
  competencyId: string,
  standardId: string,
  learningObjectiveId: string
): Promise<ExerciseResponse[]> => {
  const url =
    `/curricula/${curriculumId}/competencies/${competencyId}` +
    `/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises`;
  const { data } = await api.get<ExerciseResponse[]>(url);
  return data;
};

/** Verifica la respuesta */
export const checkAnswer = async (
  curriculumId: string,
  competencyId: string,
  standardId: string,
  learningObjectiveId: string,
  exerciseId: string,
  payload: CheckAnswerRequest
): Promise<CheckAnswerResponse> => {
  const url =
    `/curricula/${curriculumId}/competencies/${competencyId}` +
    `/standards/${standardId}/learning-objectives/${learningObjectiveId}` +
    `/exercises/${exerciseId}/check`;
  const { data } = await api.post<CheckAnswerResponse>(url, payload);
  return data;
};
