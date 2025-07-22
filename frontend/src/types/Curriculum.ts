// src/types/Curriculum.ts
export interface CurriculumRequest {
  code: string;
  name: string;
  description: string;
  grade: string;
}

export interface CurriculumResponse {
  id: string;
  code: string;
  name: string;
  description: string;
  grade: string;
  createdAt: string;
  updatedAt: string;
  active: boolean;
}
