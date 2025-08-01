// src/services/competencyService.ts
import api from "./api";
import type {
  CompetencyRequest,
  CompetencyResponse,
} from "../types/curriculum/Competency";

export const getCompetencyById = async (
  curriculumId: string,
  competencyId: string
): Promise<CompetencyResponse> => {
  const res = await api.get<CompetencyResponse>(
    `/curricula/${curriculumId}/competencies/${competencyId}`
  );
  return res.data;
};

/**
 * Obtiene competencias filtradas por estado: 'active' | 'inactive' | 'all'
 */
export const getCompetenciesByCurriculum = async (
  curriculumId: string,
  status: "active" | "inactive" | "all" = "active"
): Promise<CompetencyResponse[]> => {
  const res = await api.get<CompetencyResponse[]>(
    `/curricula/${curriculumId}/competencies`,
    {
      params: { status },
    }
  );
  return res.data;
};

export const createCompetency = async (
  curriculumId: string,
  data: CompetencyRequest
) => {
  const res = await api.post<CompetencyResponse>(
    `/curricula/${curriculumId}/competencies`,
    data
  );
  return res.data;
};

export const updateCompetency = async (
  curriculumId: string,
  competencyId: string,
  data: CompetencyRequest
) => {
  const res = await api.put<CompetencyResponse>(
    `/curricula/${curriculumId}/competencies/${competencyId}`,
    data
  );
  return res.data;
};

export const deleteCompetency = async (
  curriculumId: string,
  competencyId: string
) => {
  await api.delete(`/curricula/${curriculumId}/competencies/${competencyId}`);
};

export async function reactivateCompetency(
  curriculumId: string,
  competencyId: string
) {
  return await api.patch(
    `/curricula/${curriculumId}/competencies/${competencyId}/reactivate`,
    {}
  );
}
