// src/services/exerciseService.ts
import api from "./api";
import type { ExerciseRequest } from "../types/exercise/ExerciseRequest";
import type { ExerciseResponse } from "../types/exercise/ExerciseResponse";

const BASE_PATH = "/curricula";

/** Obtener todos los ejercicios por objetivo */
export async function getExercises(
  curriculumId: string,
  competencyId: string,
  standardId: string,
  learningObjectiveId: string,
  status: "active" | "all" = "active",
  signal?: AbortSignal
): Promise<ExerciseResponse[]> {
  const suffix = status === "all" ? "/all" : "";
  const { data } = await api.get<ExerciseResponse[]>(
    `${BASE_PATH}/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises${suffix}`,
    { signal }
  );
  return data ?? [];
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
 * DEPRECADO en FE:
 * - checkAnswer -> usar progress-service (POST /api/progress/attempts)
 * - submitExerciseAttempt -> ya lo hace el endpoint anterior
 */
