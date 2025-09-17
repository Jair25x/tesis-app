// src/services/curriculumService.ts
import api from "./api";
import type {
  CurriculumRequest,
  CurriculumResponse,
} from "../types/curriculum/Curriculum";
import type { CurriculumFullResponse } from "../types/curriculum/CurriculumFullResponse";

/** Algunas APIs devuelven array plano y otras un Page<T> */
type Page<T> = { content: T[] };

const CURR_STORAGE_KEY = "app:curriculumId";

/* ================================
 * Helpers de estado (storage)
 * ================================ */

/** Lee el currículo activo guardado en storage (si existe). */
export function getCurrentCurriculumId(): string | null {
  try {
    return localStorage.getItem(CURR_STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Setea (o limpia) el currículo activo en storage. */
export function setCurrentCurriculumId(id: string | null): void {
  try {
    if (!id) localStorage.removeItem(CURR_STORAGE_KEY);
    else localStorage.setItem(CURR_STORAGE_KEY, id);
  } catch {
    // noop
  }
}

/**
 * Garantiza que haya un currículo activo:
 * - Si ya hay uno en storage, lo devuelve.
 * - Si no, consulta /curricula?status=active y toma el primero activo (o el primero de la lista).
 * Devuelve el id seleccionado o null si no hay currículos.
 */
export async function ensureActiveCurriculum(
  signal?: AbortSignal
): Promise<string | null> {
  const current = getCurrentCurriculumId();
  if (current) return current;

  try {
    const list = await getAllCurricula("active", signal);
    const pick =
      (list.find((c) => (c as CurriculumResponse).active) ?? list[0])?.id ??
      null;
    if (pick) setCurrentCurriculumId(pick);
    return pick;
  } catch {
    return null;
  }
}

/* ================================
 * Endpoints CRUD básicos
 * ================================ */

/** 1) Listar currículos (all/active/inactive). Soporta payload paginado o array plano. */
export const getAllCurricula = async (
  status: "all" | "active" | "inactive" = "all",
  signal?: AbortSignal
): Promise<CurriculumResponse[]> => {
  const { data } = await api.get<
    CurriculumResponse[] | Page<CurriculumResponse>
  >("/curricula", { params: { status }, signal });
  return Array.isArray(data) ? data : data.content;
};

/** 2) Obtener currículo simple por ID (includeFull opcional) */
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

/** 3) Obtener currículo completo (estructura expandida) */
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

/** ✅ 4) Crear currículo */
export const createCurriculum = (data: CurriculumRequest) =>
  api.post("/curricula", data);

/** ♻️ 5) Actualizar currículo */
export const updateCurriculum = (id: string, data: CurriculumRequest) =>
  api.put(`/curricula/${id}`, data);

/** 🗑 6) Soft-delete */
export const deleteCurriculum = (id: string) => api.delete(`/curricula/${id}`);

/** ♻️ 7) Reactivar currículo */
export const reactivateCurriculum = (id: string) =>
  api.patch(`/curricula/${id}/reactivate`);

/** 🧩 8) Listar solo activos (atajo para menús o selector rápido) */
export const getActiveCurricula = async (): Promise<CurriculumResponse[]> => {
  const { data } = await api.get<CurriculumResponse[]>("/curricula", {
    params: { status: "active" },
  });
  return data;
};
