/**
 * Paso de solución asociado a un ejercicio.
 */
export interface SolutionStepResponse {
  id: string;
  stepNumber: number;
  explanation: string;
  exerciseId: string;

  // Auditoría
  createdAt: string;
  updatedAt: string;
  active: boolean;
  deletedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string;
}

/**
 * Payload para crear o actualizar un paso de solución de un ejercicio.
 */
export interface SolutionStepRequest {
  stepNumber: number;     // Número de orden del paso (mínimo 1)
  explanation: string;    // Texto explicativo del paso
}