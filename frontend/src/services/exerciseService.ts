import api from "./api";
import type {
  ExerciseResponse,
  CheckAnswerRequest,
  CheckAnswerResponse,
  ExerciseAttemptRequest,
  ExerciseAttemptResponse,
} from "../types/exercise/ExerciseResponse";

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

/** Envía el intento de ejercicio al backend */
export const submitExerciseAttempt = async (
  payload: ExerciseAttemptRequest
): Promise<ExerciseAttemptResponse> => {
  const { data } = await api.post<ExerciseAttemptResponse>(
    "/curricula/attempts",
    payload
  );
  return data;
};

/** Obtiene los intentos anteriores del usuario para un ejercicio */
export const getAttemptsByExercise = async (
  exerciseId: string
): Promise<ExerciseAttemptResponse[]> => {
  const { data } = await api.get<ExerciseAttemptResponse[]>(
    `/curricula/attempts/exercise/${exerciseId}`
  );
  return data;
};