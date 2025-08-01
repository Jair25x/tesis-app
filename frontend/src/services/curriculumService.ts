// src/services/curriculumService.ts
import api from "./api";
import type {
  CurriculumRequest,
  CurriculumResponse,
} from "../types/curriculum/Curriculum";
import type { CurriculumFullResponse } from "../types/curriculum/CurriculumFullResponse";

/* 🔎 1. Listar currículos por estado: all | active | inactive */
export const getAllCurricula = async (
  status: "all" | "active" | "inactive" = "all"
): Promise<CurriculumResponse[]> => {
  const res = await api.get(`/curricula?status=${status}`);
  return Array.isArray(res.data) ? res.data : res.data.content || [];
};

/* 🔎 2. Obtener currículo simple por ID */
export const getCurriculumById = (id: string, includeFull = false) =>
  api.get<CurriculumResponse>(`/curricula/${id}?includeFull=${includeFull}`);

/* 🔎 3. Obtener currículo completo (incluye jerarquía) */
export const getCurriculumFull = async (
  curriculumId: string
): Promise<CurriculumFullResponse> => {
  const res = await api.get<CurriculumFullResponse>(
    `/curricula/${curriculumId}?includeFull=true`
  );
  return res.data;
};

/* ✅ 4. Crear currículo */
export const createCurriculum = (data: CurriculumRequest) =>
  api.post("/curricula", data);

/* ♻️ 5. Actualizar currículo */
export const updateCurriculum = (id: string, data: CurriculumRequest) =>
  api.put(`/curricula/${id}`, data);

/* 🗑 6. Eliminar (soft-delete) */
export const deleteCurriculum = (id: string) => api.delete(`/curricula/${id}`);

/* ♻️ 7. Reactivar currículo */
export const reactivateCurriculum = (id: string) =>
  api.patch(`/curricula/${id}/reactivate`);

/* 🧩 8. Obtener solo los currículos activos (para el menú dinámico) */
export const getActiveCurricula = async (): Promise<CurriculumResponse[]> => {
  const res = await api.get<CurriculumResponse[]>("/curricula/active");
  return res.data;
};
