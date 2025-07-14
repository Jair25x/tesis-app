import api from "./api";
import type { ExerciseResponse } from "../types/ExerciseResponse";

export const getExercisesByObjective = async (objectiveId: string): Promise<ExerciseResponse[]> => {
  const response = await api.get(`/learning-objectives/${objectiveId}/exercises`);
  return response.data;
};

export const getExerciseById = async (objectiveId: string, exerciseId: string): Promise<ExerciseResponse> => {
  const response = await api.get(`/learning-objectives/${objectiveId}/exercises/${exerciseId}`);
  return response.data;
};
