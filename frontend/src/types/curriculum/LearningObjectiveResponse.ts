/**
 * Respuesta detallada de un objetivo de aprendizaje.
 */
export interface LearningObjectiveResponse {
  id: string;
  name: string;
  description: string;
  code: string;

  curriculumId: string;
  competencyId: string;
  standardId: string;
  standardName: string;

  createdAt: string;
  updatedAt: string;
  active: boolean;
}

/**
 * Payload para crear o actualizar un objetivo de aprendizaje.
 */
export interface LearningObjectiveRequest {
  name: string;        // Nombre del objetivo
  description: string; // Descripción detallada
  code: string;        // Código único (ej. LO.02.01)
}