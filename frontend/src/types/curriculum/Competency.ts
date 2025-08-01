// src/types/curriculum/Competency.ts

/**
 * Tipo para solicitud de creación/edición de una competencia.
 */
export interface CompetencyRequest {
  name: string;
  description: string;
  code: string;
  curriculumId: string; // UUID como string
}

/**
 * Tipo de respuesta que representa una Competencia con campos de auditoría.
 */
export interface CompetencyResponse {
  id: string;
  name: string;
  description: string;
  code: string;
  curriculumId: string;
  active: boolean;

  // Auditoría
  createdBy: string;
  updatedBy: string;
  deletedBy: string | null;
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
  deletedAt: string | null;
}
