import api from "./api";
import type { ExerciseRequest } from "../types/exercise/ExerciseRequest";
import type { ExerciseResponse } from "../types/exercise/ExerciseResponse";
import type { ExamExerciseResponse } from "../types/exercise/ExamExerciseResponse";
import type {
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
  // Si piden "inactive", usamos /all y filtramos en FE por active=false.
  const suffix =
    status === "all" ? "/all" : status === "inactive" ? "/all" : "";

  const { data } = await api.get<ExerciseResponse[]>(
    `${BASE_PATH}/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises${suffix}`,
    { signal }
  );

  const list = data ?? [];
  if (status === "inactive") {
    return list.filter((e) => e.active === false);
  }
  if (status === "active") {
    return list.filter((e) => e.active !== false); // tolerante si no viene el campo
  }
  return list;
}

/** Alias semántico usado en varias vistas */
export const getExercisesByObjective = getExercises;

/** Obtener ejercicio por ID (vista estudiante) */
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
  return data;
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
 * ✅ Compatibilidad para hooks antiguos:
 * Verifica respuesta contra el atajo del curriculum-service (si existe).
 * Si tu BE no expone este endpoint, puedes eliminar esta función y
 * actualizar los imports de los hooks que lo usaban.
 */
export async function checkAnswer(
  payload: CheckAnswerRequest
): Promise<CheckAnswerResponse> {
  const { data } = await api.post<CheckAnswerResponse>(
    `/curricula/exercises/check`,
    payload
  );
  return data;
}

/**
 * Obtener ejercicio para examen (sin hints/steps si el BE aplica examMode=true).
 * ⚠️ Recomendado: expón en BE GET /curricula/exercises/{exerciseId}?mode=exam
 */
export const getExerciseForExam = async (
  exerciseId: string
): Promise<ExamExerciseResponse> => {
  const { data } = await api.get<ExamExerciseResponse>(
    `/curricula/exercises/${exerciseId}`,
    { params: { mode: "exam" } }
  );
  return data;
};
