// src/services/curriculumService.ts
import api from "./api";
import type {
  CurriculumRequest,
  CurriculumResponse,
} from "../types/curriculum/Curriculum";
import type { CurriculumFullResponse } from "../types/curriculum/CurriculumFullResponse";
type Page<T> = { content: T[] };
/* 1) Listar currículos */
export const getAllCurricula = async (
  status: "all" | "active" | "inactive" = "all",
  signal?: AbortSignal
): Promise<CurriculumResponse[]> => {
  const { data } = await api.get<
    CurriculumResponse[] | Page<CurriculumResponse>
  >("/curricula", { params: { status }, signal });
  return Array.isArray(data) ? data : data.content;
};

/* 2) Obtener currículo simple por ID */
export const getCurriculumById = async (
  id: string,
  includeFull = false,
  signal?: AbortSignal
): Promise<CurriculumResponse> => {
  const { data } = await api.get<CurriculumResponse>(`/curricula/${id}`, {
    params: { includeFull },
    signal,
  });
  return data;
};

/* 3) Obtener currículo completo */
export const getCurriculumFull = async (
  curriculumId: string,
  signal?: AbortSignal
): Promise<CurriculumFullResponse> => {
  const { data } = await api.get<CurriculumFullResponse>(
    `/curricula/${curriculumId}`,
    { params: { includeFull: true }, signal }
  );
  return data;
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
// src/services/curriculumService.ts
export const getActiveCurricula = async (): Promise<CurriculumResponse[]> => {
  const { data } = await api.get<CurriculumResponse[]>("/curricula", {
    params: { status: "active" },
  });
  return data;
};
