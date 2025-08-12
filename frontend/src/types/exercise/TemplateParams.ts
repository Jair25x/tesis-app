// src/types/exercise/TemplateParams.ts
import type { TemplateType } from "./TemplateSchemaResponse";

/** 1) Mustache + opciones */
export interface EquationParams {
  a?: number;
  b?: number;
  choices: string[];
  answer: string; // solo admin/ejemplo
}

/** 2) Tabla con preguntas */
export interface FreqQAQuestion {
  id: string;
  kind: "single_choice" | "numeric";
  prompt: string;
  options?: string[];
}
export interface FreqQAParams {
  columns: string[];
  rows: { actividad: string; frecuencia: number }[];
  questions: FreqQAQuestion[];
}

/** 3) Completar celdas */
export interface FreqCompleteMissingCell {
  cell: string;
}
export interface FreqCompleteParams {
  columns: string[];
  rows: { actividad: string; frecuencia?: number }[];
  missing: FreqCompleteMissingCell[];
}

/** Parámetros (con la etiqueta templateType para discriminar) */
export type ExerciseParams =
  | ({
      templateType: Extract<TemplateType, "EQUATION_SINGLE_CHOICE">;
    } & EquationParams)
  | ({
      templateType: Extract<TemplateType, "FREQUENCY_TABLE_QA">;
    } & FreqQAParams)
  | ({
      templateType: Extract<TemplateType, "FREQUENCY_TABLE_COMPLETE">;
    } & FreqCompleteParams);

/** Respuesta del estudiante */
export type StudentAnswerShape =
  | { template: "EQUATION_SINGLE_CHOICE"; value: string }
  | { template: "FREQUENCY_TABLE_QA"; answers: Record<string, string | number> }
  | { template: "FREQUENCY_TABLE_COMPLETE"; filled: Record<string, number> };
