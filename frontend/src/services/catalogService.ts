// src/services/catalogService.ts
import api from "./api";
import type {
  CatalogCompetencyDto,
  CatalogStandardDto,
  CatalogObjectiveDto,
  CatalogExerciseDto,
  PageResponse,
  CatalogCommonQuery,
  UUID,
} from "../types/curriculum/Catalog";
import type { Difficulty } from "../types/exercise/Difficulty";

const BASE = "/curricula/catalog";

export interface CompetenciesQuery extends CatalogCommonQuery {
  curriculumId?: UUID;
}
export interface StandardsQuery extends CatalogCommonQuery {
  curriculumId?: UUID;
  competencyId?: UUID;
}
export interface ObjectivesQuery extends CatalogCommonQuery {
  curriculumId?: UUID;
  competencyId?: UUID;
  standardId?: UUID;
}
export interface ExercisesQuery extends CatalogCommonQuery {
  curriculumId?: UUID;
  competencyId?: UUID;
  standardId?: UUID;
  objectiveId?: UUID;
  difficulty?: Difficulty;
  from?: string; // ISO date-time
  to?: string; // ISO date-time
}

export async function getCatalogCompetencies(
  params: CompetenciesQuery
): Promise<PageResponse<CatalogCompetencyDto>> {
  const { data } = await api.get<PageResponse<CatalogCompetencyDto>>(
    `${BASE}/competencies`,
    { params }
  );
  return data;
}

export async function getCatalogStandards(
  params: StandardsQuery
): Promise<PageResponse<CatalogStandardDto>> {
  const { data } = await api.get<PageResponse<CatalogStandardDto>>(
    `${BASE}/standards`,
    { params }
  );
  return data;
}

export async function getCatalogObjectives(
  params: ObjectivesQuery
): Promise<PageResponse<CatalogObjectiveDto>> {
  const { data } = await api.get<PageResponse<CatalogObjectiveDto>>(
    `${BASE}/objectives`,
    { params }
  );
  return data;
}

export async function getCatalogExercises(
  params: ExercisesQuery
): Promise<PageResponse<CatalogExerciseDto>> {
  const { data } = await api.get<PageResponse<CatalogExerciseDto>>(
    `${BASE}/exercises`,
    { params }
  );
  return data;
}
