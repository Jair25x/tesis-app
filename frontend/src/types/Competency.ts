// src/types/Competency.ts
export interface CompetencyResponse {
  id: string;
  name: string;
  description: string;
  code: string;
  curriculumId: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CompetencyRequest {
  name: string;
  description: string;
  code: string;
  curriculumId: string;
}
