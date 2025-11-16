import api from "./api";
import type { ExerciseRequest } from "../types/exercise/ExerciseRequest";
import type { ExerciseResponse } from "../types/exercise/ExerciseResponse";
import type { ExamExerciseResponse } from "../types/exercise/ExamExerciseResponse";
import type {
  CheckAnswerPayload,
  CheckAnswerRequest,
  CheckAnswerResponse,
} from "../types/exercise/CheckAnswer";

const BASE_PATH = "/curricula";

/** Obtener todos los ejercicios por objetivo */
export async function getExercises(
  curriculumId: string,
  competencyId: string,
  standardId: string,
  learningObjectiveId: string,
  status: "active" | "all" | "inactive" = "active",
  signal?: AbortSignal
): Promise<ExerciseResponse[]> {
  const { data } = await api.get<ExerciseResponse[]>(
    `${BASE_PATH}/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises`,
    {
      params: { status },
      signal,
    }
  );

  const list = data ?? [];
  return list;
}

/** Alias semántico usado en varias vistas */
export const getExercisesByObjective = getExercises;

/** Obtener ejercicio por ID (vista estudiante, ruta jerárquica) */
export const getExerciseById = async (
  curriculumId: string,
  competencyId: string,
  standardId: string,
  learningObjectiveId: string,
  exerciseId: string
): Promise<ExerciseResponse> => {
  const { data } = await api.get<ExerciseResponse>(
    `${BASE_PATH}/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises/${exerciseId}`
  );
  return data;
};

/** Crear ejercicio */
export const createExercise = async (
  curriculumId: string,
  competencyId: string,
  standardId: string,
  learningObjectiveId: string,
  payload: ExerciseRequest
): Promise<ExerciseResponse> => {
  const { data } = await api.post<ExerciseResponse>(
    `${BASE_PATH}/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises`,
    payload
  );
  return data;
};

/** Actualizar ejercicio */
export const updateExercise = async (
  curriculumId: string,
  competencyId: string,
  standardId: string,
  learningObjectiveId: string,
  exerciseId: string,
  payload: ExerciseRequest
): Promise<ExerciseResponse> => {
  const { data } = await api.put<ExerciseResponse>(
    `${BASE_PATH}/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises/${exerciseId}`,
    payload
  );
  return data;
};

/** Eliminar ejercicio (soft delete) */
export const deleteExercise = async (
  curriculumId: string,
  competencyId: string,
  standardId: string,
  learningObjectiveId: string,
  exerciseId: string
): Promise<void> => {
  await api.delete(
    `${BASE_PATH}/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises/${exerciseId}`
  );
};

/** Reactivar ejercicio */
export const reactivateExercise = async (
  curriculumId: string,
  competencyId: string,
  standardId: string,
  learningObjectiveId: string,
  exerciseId: string
): Promise<void> => {
  await api.patch(
    `${BASE_PATH}/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises/${exerciseId}/reactivate`
  );
};

/** Obtener ejercicios del diagnóstico */
export const getDiagnosticExercises = async (): Promise<ExerciseResponse[]> => {
  const { data } = await api.get<ExerciseResponse[]>(
    "/curricula/exercises/diagnostic"
  );
  return data ?? [];
};

export interface ExerciseAdminResponse extends ExerciseResponse {
  correctAnswer?: string | null;
}

/** Obtener ejercicio (vista admin) */
export const getExerciseAdminById = async (
  curriculumId: string,
  competencyId: string,
  standardId: string,
  learningObjectiveId: string,
  exerciseId: string
): Promise<ExerciseAdminResponse> => {
  const { data } = await api.get<ExerciseAdminResponse>(
    `${BASE_PATH}/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises/${exerciseId}/admin`
  );
  return data;
};

/**
 * Verificar respuesta de un ejercicio concreto usando el atajo plano:
 *
 *   POST /curricula/exercises/{exerciseId}/check
 *
 * El payload `answer` es el mismo que se envía en AttemptRequestDto.answer
 * y el servicio lo envuelve como { answer: payload }.
 */
export async function checkAnswer(
  exerciseId: string,
  answer: CheckAnswerPayload
): Promise<CheckAnswerResponse> {
  const body: CheckAnswerRequest = { answer };

  const { data } = await api.post<CheckAnswerResponse>(
    `/curricula/exercises/${exerciseId}/check`,
    body
  );

  return data;
}

/**
 * Obtener ejercicio para examen (sin hints/steps si el BE aplica examMode=true).
 * Usa el shortcut plano + mode=exam.
 */
export const getExerciseForExam = async (
  exerciseId: string,
  signal?: AbortSignal
): Promise<ExamExerciseResponse> => {
  const { data } = await api.get<ExamExerciseResponse>(
    `/curricula/exercises/${exerciseId}`,
    {
      params: { mode: "exam" },
      signal,
    }
  );
  return data;
};
