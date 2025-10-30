import type { FieldDescriptor } from "./FieldDescriptor";

// Tipos oficiales actuales (BE hoy)
export type TemplateType =
  | "EQUATION_SINGLE_CHOICE"
  | "FREQUENCY_TABLE_QA"
  | "FREQUENCY_TABLE_COMPLETE";

// Extensión compatible hacia adelante/legacy (FE tolerante a variantes)
export type ExtendedTemplateType =
  | TemplateType
  | "SINGLE_CHOICE"
  | "LEGACY_VALUE"
  | "VALUE_ONLY";

// Predicados de conveniencia (no rompen si mañana agregas nuevas)
export function isSingleChoiceLike(t: string): boolean {
  return (
    t === "EQUATION_SINGLE_CHOICE" ||
    t === "SINGLE_CHOICE" ||
    t === "LEGACY_VALUE" ||
    t === "VALUE_ONLY"
  );
}

export function isFrequencyQa(t: string): boolean {
  return t === "FREQUENCY_TABLE_QA";
}

export function isFrequencyComplete(t: string): boolean {
  return t === "FREQUENCY_TABLE_COMPLETE";
}

export interface TemplateSchemaResponse {
  type: TemplateType; // aquí mantenemos el contrato actual del BE
  description: string;
  example: Record<string, unknown>;
  uiHints?: Record<string, unknown>;

  // opcionales: úsalos si tu backend los expone
  pattern?: string | null;
  fields?: FieldDescriptor[] | null;
}
