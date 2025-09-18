// src/hooks/catalog/useCatalog.ts
import { useQuery } from "@tanstack/react-query";
import {
  getCatalogCompetencies,
  getCatalogStandards,
  getCatalogObjectives,
  getCatalogExercises,
  type CompetenciesQuery,
  type StandardsQuery,
  type ObjectivesQuery,
  type ExercisesQuery,
} from "../../services/catalogService";
import type {
  PageResponse,
  CatalogCompetencyDto,
  CatalogStandardDto,
  CatalogObjectiveDto,
  CatalogExerciseDto,
} from "../../types/curriculum/Catalog";

// Mantener datos 1 minuto (mejora UX al paginar)
const STALE = 60 * 1000;

/**
 * NOTA (TanStack v5):
 * - keepPreviousData fue eliminado. Usar placeholderData: (prev) => prev.
 * - Especificar genéricos para que `data` no sea {}.
 */

export function useCatalogCompetencies(params: CompetenciesQuery) {
  return useQuery<PageResponse<CatalogCompetencyDto>, Error>({
    queryKey: ["catalog", "competencies", params] as const,
    queryFn: () => getCatalogCompetencies(params),
    staleTime: STALE,
    placeholderData: (prev) => prev,
  });
}

export function useCatalogStandards(params: StandardsQuery) {
  return useQuery<PageResponse<CatalogStandardDto>, Error>({
    queryKey: ["catalog", "standards", params] as const,
    queryFn: () => getCatalogStandards(params),
    staleTime: STALE,
    placeholderData: (prev) => prev,
  });
}

export function useCatalogObjectives(params: ObjectivesQuery) {
  return useQuery<PageResponse<CatalogObjectiveDto>, Error>({
    queryKey: ["catalog", "objectives", params] as const,
    queryFn: () => getCatalogObjectives(params),
    staleTime: STALE,
    placeholderData: (prev) => prev,
  });
}

export function useCatalogExercises(params: ExercisesQuery) {
  return useQuery<PageResponse<CatalogExerciseDto>, Error>({
    queryKey: ["catalog", "exercises", params] as const,
    queryFn: () => getCatalogExercises(params),
    staleTime: STALE,
    placeholderData: (prev) => prev,
  });
}
