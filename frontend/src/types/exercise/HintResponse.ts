/**
 * Pista o hint asociada a un ejercicio.
 */
export interface HintResponse {
  id: string;
  hintText: string;
  cost: number;

  // Relación
  exerciseId: string;

  // Auditoría
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string;

  active: boolean;
}


/**
 * Payload para crear o actualizar una pista (hint) de un ejercicio.
 * El ID del ejercicio se envía por la ruta, no en el body.
 */
export interface HintRequest {
  hintText: string; // Texto de la pista
  cost: number;     // Coste en puntos (debe ser >= 0)
}
