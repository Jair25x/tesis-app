import api from "./api";
import type {
  StandardRequest,
  StandardResponse,
} from "../types/curriculum/StandardResponse";

// Base path: /api/curricula/{curriculumId}/competencies/{competencyId}/standards
const basePath = (curriculumId: string, competencyId: string) =>
  `/curricula/${curriculumId}/competencies/${competencyId}/standards`;

export const getStandards = (
  curriculumId: string,
  competencyId: string,
  status: "all" | "active" | "inactive" = "active"
) => {
  return api.get<StandardResponse[]>(
    `${basePath(curriculumId, competencyId)}?status=${status}`
  );
};

export const getStandardById = (
  curriculumId: string,
  competencyId: string,
  standardId: string
) => {
  return api.get<StandardResponse>(
    `${basePath(curriculumId, competencyId)}/${standardId}`
  );
};

export const createStandard = (
  curriculumId: string,
  competencyId: string,
  data: StandardRequest
) => {
  return api.post<StandardResponse>(
    `${basePath(curriculumId, competencyId)}`,
    data
  );
};

export const updateStandard = (
  curriculumId: string,
  competencyId: string,
  standardId: string,
  data: StandardRequest
) => {
  return api.put<StandardResponse>(
    `${basePath(curriculumId, competencyId)}/${standardId}`,
    data
  );
};

export const deleteStandard = (
  curriculumId: string,
  competencyId: string,
  standardId: string
) => {
  return api.delete<void>(
    `${basePath(curriculumId, competencyId)}/${standardId}`
  );
};

export const reactivateStandard = (
  curriculumId: string,
  competencyId: string,
  standardId: string
) => {
  return api.patch<void>(
    `${basePath(curriculumId, competencyId)}/${standardId}/reactivate`
  );
};
