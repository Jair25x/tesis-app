export interface StandardResponse {
  id: string;
  name: string;
  description: string;
  code: string;

  competencyId: string;
  competencyName: string;

  createdAt: string;
  updatedAt: string;
  active: boolean;

  deletedAt?: string;
  deletedBy?: string;
  createdBy?: string;
  updatedBy?: string;
}

/**
 * Payload para crear o actualizar un estándar dentro de una competencia.
 */
export interface StandardRequest {
  name: string; // Nombre del estándar (obligatorio)
  description: string; // Descripción detallada del estándar (obligatorio)
  code: string; // Código único del estándar (obligatorio)
}
