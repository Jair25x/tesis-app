// src/services/exerciseService.ts

import api from "./api";
import type { ExerciseRequest } from "../types/exercise/ExerciseRequest";
import type { ExerciseResponse } from "../types/exercise/ExerciseResponse";
import type {
  CheckAnswerRequest,
  CheckAnswerResponse,
} from "../types/exercise/CheckAnswer";
import type { ExerciseAttemptRequest } from "../types/exercise/ExerciseAttempt";

const BASE_PATH = "/curricula";

// ✅ Obtener todos los ejercicios por objetivo
export const getExercises = async (
  curriculumId: string,
  competencyId: string,
  standardId: string,
  learningObjectiveId: string,
  status: "all" | "active" | "inactive" = "active"
): Promise<ExerciseResponse[]> => {
  const { data } = await api.get(
    `${BASE_PATH}/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises`,
    { params: { status } }
  );
  return data;
};

// ✅ Alias semántico usado en Practice.tsx
export const getExercisesByObjective = getExercises;

// ✅ Obtener ejercicio por ID
export const getExerciseById = async (
  curriculumId: string,
  competencyId: string,
  standardId: string,
  learningObjectiveId: string,
  exerciseId: string
): Promise<ExerciseResponse> => {
  const { data } = await api.get(
    `${BASE_PATH}/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises/${exerciseId}`
  );
  return data;
};

// ✅ Crear nuevo ejercicio
export const createExercise = async (
  curriculumId: string,
  competencyId: string,
  standardId: string,
  learningObjectiveId: string,
  payload: ExerciseRequest
): Promise<ExerciseResponse> => {
  const { data } = await api.post(
    `${BASE_PATH}/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises`,
    payload
  );
  return data;
};

// ✅ Actualizar ejercicio existente
export const updateExercise = async (
  curriculumId: string,
  competencyId: string,
  standardId: string,
  learningObjectiveId: string,
  exerciseId: string,
  payload: ExerciseRequest
): Promise<ExerciseResponse> => {
  const { data } = await api.put(
    `${BASE_PATH}/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises/${exerciseId}`,
    payload
  );
  return data;
};

// ✅ Eliminar ejercicio (soft delete)
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

// ✅ Reactivar ejercicio
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

// ✅ Verificar respuesta del estudiante
export const checkAnswer = async (
  curriculumId: string,
  competencyId: string,
  standardId: string,
  learningObjectiveId: string,
  exerciseId: string,
  payload: CheckAnswerRequest
): Promise<CheckAnswerResponse> => {
  const { data } = await api.post(
    `${BASE_PATH}/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises/${exerciseId}/check`,
    payload
  );
  return data;
};

// ✅ Registrar intento de respuesta
export const submitExerciseAttempt = async (
  payload: ExerciseAttemptRequest
): Promise<void> => {
  await api.post("/exercise-attempts", payload);
};
