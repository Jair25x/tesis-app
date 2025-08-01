// src/types/curriculum/Curriculum.ts

/**
 * Payload para crear o actualizar un currículo.
 */
export interface CurriculumRequest {
  name: string;
  description?: string; // opcional, como en el backend
  code: string;
  grade: string;
}

/**
 * Respuesta detallada de un currículo, con metadatos y auditoría.
 */
export interface CurriculumResponse {
  id: string;
  code: string;
  name: string;
  description: string;
  grade: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  createdBy: string;
  updatedBy: string;
  deletedBy?: string | null;
}
