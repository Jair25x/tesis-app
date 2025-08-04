import api from "./api";
import type {
  LearningObjectiveRequest,
  LearningObjectiveResponse,
} from "../types/curriculum/LearningObjectiveResponse";

/* 📄 Base path helper */
const basePath = (
  curriculumId: string,
  competencyId: string,
  standardId: string
) =>
  `/curricula/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives`;

/* 🔎 1. Listar objetivos por estado */
export const getLearningObjectives = async (
  curriculumId: string,
  competencyId: string,
  standardId: string,
  status: "all" | "active" | "inactive" = "active"
): Promise<LearningObjectiveResponse[]> => {
  const res = await api.get(
    `${basePath(curriculumId, competencyId, standardId)}?status=${status}`
  );
  return res.data;
};

/* 🔎 2. Obtener un objetivo por ID */
export const getLearningObjectiveById = async (
  curriculumId: string,
  competencyId: string,
  standardId: string,
  id: string
): Promise<LearningObjectiveResponse> => {
  const res = await api.get(
    `${basePath(curriculumId, competencyId, standardId)}/${id}`
  );
  return res.data;
};

/* ✅ 3. Crear nuevo objetivo */
export const createLearningObjective = async (
  curriculumId: string,
  competencyId: string,
  standardId: string,
  data: LearningObjectiveRequest
): Promise<LearningObjectiveResponse> => {
  const res = await api.post(
    basePath(curriculumId, competencyId, standardId),
    data
  );
  return res.data;
};

/* ♻️ 4. Actualizar objetivo existente */
export const updateLearningObjective = async (
  curriculumId: string,
  competencyId: string,
  standardId: string,
  id: string,
  data: LearningObjectiveRequest
): Promise<LearningObjectiveResponse> => {
  const res = await api.put(
    `${basePath(curriculumId, competencyId, standardId)}/${id}`,
    data
  );
  return res.data;
};

/* 🗑 5. Eliminar (soft delete) */
export const deleteLearningObjective = async (
  curriculumId: string,
  competencyId: string,
  standardId: string,
  id: string
) => {
  await api.delete(
    `${basePath(curriculumId, competencyId, standardId)}/${id}`
  );
};

/* 🔁 6. Reactivar objetivo */
export const reactivateLearningObjective = async (
  curriculumId: string,
  competencyId: string,
  standardId: string,
  id: string
) => {
  await api.post(
    `${basePath(curriculumId, competencyId, standardId)}/${id}/reactivate`
  );
};
