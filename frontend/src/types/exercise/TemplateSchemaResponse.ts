import type { FieldDescriptor } from "./FieldDescriptor";

/**
 * Tipos oficiales alineados con el BE (incluye los 4 nuevos).
 */
export type TemplateType =
  | "EQUATION_SINGLE_CHOICE"
  | "FREQUENCY_TABLE_QA"
  | "FREQUENCY_TABLE_COMPLETE"
  // NUEVOS (Unidad 1 – 4.º)
  | "NUMBER_WORDS_BIDIR"   // palabras ↔ cifras
  | "PLACE_VALUE_QA"       // valor posicional / descomposición
  | "BASE_TEN_BLOCKS_QA"   // bloques base diez → número
  | "NUMBER_SEQUENCE_QA";  // reglas y continuación de secuencias

/**
 * Extensión compatible hacia adelante/legacy (si en algún punto
 * recibes etiquetas antiguas o alias, puedes mapearlas).
 */
export type ExtendedTemplateType =
  | TemplateType
  | "SINGLE_CHOICE"
  | "LEGACY_VALUE"
  | "VALUE_ONLY";

/** Predicados de conveniencia (no rompen si mañana agregas nuevas) */
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

/** Predicados opcionales para los nuevos tipos (útiles en UI/Player) */
export function isNumberWords(t: string): boolean {
  return t === "NUMBER_WORDS_BIDIR";
}
export function isPlaceValue(t: string): boolean {
  return t === "PLACE_VALUE_QA";
}
export function isBaseTenBlocks(t: string): boolean {
  return t === "BASE_TEN_BLOCKS_QA";
}
export function isNumberSequence(t: string): boolean {
  return t === "NUMBER_SEQUENCE_QA";
}

/**
 * Respuesta del esquema de plantilla.
 * Mantén 'type' estrictamente como TemplateType para aprovechar el tipado.
 */
export interface TemplateSchemaResponse {
  type: TemplateType;
  description: string;
  example: Record<string, unknown>;
  uiHints?: Record<string, unknown>;

  // opcionales: úsalos si tu backend los expone para Mustache
  pattern?: string | null;
  fields?: FieldDescriptor[] | null;
}
