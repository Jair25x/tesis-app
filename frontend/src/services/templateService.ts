
import type { TemplateSchemaResponse } from "../types/exercise/TemplateSchemaResponse";
import api from "./api";

// GET: Listar todas las plantillas para un currículo
export async function getAllTemplates(
  curriculumId: string
): Promise<TemplateSchemaResponse[]> {
  const response = await api.get(
    `/curricula/${curriculumId}/exercise-templates`
  );
  return response.data;
}

// GET: Obtener esquema completo por tipo (opcional)
export async function getTemplateSchemaByType(
  curriculumId: string,
  type: string
): Promise<TemplateSchemaResponse> {
  const response = await api.get(
    `/curricula/${curriculumId}/exercise-templates/${type}`
  );
  return response.data;
}
