import type { FieldDescriptor } from "./FieldDescriptor";

// src/types/exercise/TemplateSchemaResponse.ts
export type TemplateType =
  | "EQUATION_SINGLE_CHOICE"
  | "FREQUENCY_TABLE_QA"
  | "FREQUENCY_TABLE_COMPLETE";

export interface TemplateSchemaResponse {
  type: TemplateType;
  description: string;
  example: Record<string, unknown>;
  uiHints?: Record<string, unknown>;

  // opcionales: úsalos si tu backend los expone
  pattern?: string | null;
  fields?: FieldDescriptor[] | null;
}
