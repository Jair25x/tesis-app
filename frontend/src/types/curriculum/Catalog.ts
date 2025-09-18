// src/types/curriculum/Catalog.ts
import type { Difficulty } from "../exercise/Difficulty";

export type UUID = string;

export interface PageResponse<T> {
  content: T[];
  number: number; // página actual (0-based)
  size: number; // tamaño de página pedido
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

export interface CatalogCompetencyDto {
  id: UUID;
  code: string;
  name: string;
  description: string;
  curriculumId: UUID;
  curriculumName: string;
}

export interface CatalogStandardDto {
  id: UUID;
  code: string;
  name: string;
  description: string;
  curriculumId: UUID;
  curriculumName: string;
  competencyId: UUID;
  competencyName: string;
}

export interface CatalogObjectiveDto {
  id: UUID;
  code: string;
  name: string;
  description: string;
  curriculumId: UUID;
  curriculumName: string;
  competencyId: UUID;
  competencyName: string;
  standardId: UUID;
  standardName: string;
}

export interface CatalogExerciseDto {
  id: UUID;
  type: string;
  difficulty: Difficulty | string; // el backend serializa enum como texto
  statementPreview: string;
  curriculumId: UUID;
  curriculumName: string;
  competencyId: UUID;
  competencyName: string;
  standardId: UUID;
  standardName: string;
  objectiveId: UUID;
  objectiveName: string;
}

export interface CatalogCommonQuery {
  q?: string;
  page?: number; // 0-based
  size?: number;
  sort?: string; // ej: "name,asc"
}
