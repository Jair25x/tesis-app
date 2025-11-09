// src/types/exercise/TemplateParams.ts
import type { TemplateType } from "./TemplateSchemaResponse";

/** 1) Mustache + opciones (ya existente) */
export interface EquationParams {
  a?: number;
  b?: number;
  choices: string[];
  answer: string; // solo admin/ejemplo
}

/** 2) Tabla con preguntas (ya existente) */
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

/** 3) Completar celdas (ya existente) */
export interface FreqCompleteMissingCell {
  cell: string;
}
export interface FreqCompleteParams {
  columns: string[];
  rows: { actividad: string; frecuencia?: number }[];
  missing: FreqCompleteMissingCell[];
}

/** 4) NUEVOS — NUMBER_WORDS_BIDIR */
export type NumberWordsDirection = "WORDS_TO_DIGITS" | "DIGITS_TO_WORDS";
export interface NumberWordsParams {
  direction: NumberWordsDirection; // seeds usan "direction"
  value: number | string; // 47_305 o "cuarenta y siete mil…"
  answer?: number | string; // opcional en FE
  locale?: "es-PE" | "es-ES";
}

/** 5) NUEVOS — PLACE_VALUE_QA */
export type PlaceAsk =
  | "hundreds"
  | "tens"
  | "units"
  | "expanded"
  | "positional_of_digit"
  | "value_of_digit"
  | "compose"
  | "tens_count"
  | "hundreds_to_units"
  | "expanded_choice";
export interface PlaceValueParams {
  number?: number; // cuando aplique
  ask: PlaceAsk;
  digit?: number; // cuando aplique
  hundreds?: number; // cuando aplique (equivalencias)
  choices?: string[]; // cuando es de opción múltiple
  answer?: number | string;
}

/** 6) NUEVOS — BASE_TEN_BLOCKS_QA */
export interface BaseTenBlocksParams {
  hundreds: number;
  tens: number;
  ones: number;
  altText?: string;
  answer?: number;
}

/** 7) NUEVOS — NUMBER_SEQUENCE_QA */
export interface NumberSequenceParams {
  sequence: Array<number | null>; // null = hueco(s)
  rule?: string; // texto orientador
  missingIndex?: number; // uno
  missingIndices?: number[]; // o varios
  answers?: number[]; // cuando varios huecos
  answer?: number; // cuando 1 hueco
}

/** Parámetros discriminados por templateType */
export type ExerciseParams =
  | ({
      templateType: Extract<TemplateType, "EQUATION_SINGLE_CHOICE">;
    } & EquationParams)
  | ({
      templateType: Extract<TemplateType, "FREQUENCY_TABLE_QA">;
    } & FreqQAParams)
  | ({
      templateType: Extract<TemplateType, "FREQUENCY_TABLE_COMPLETE">;
    } & FreqCompleteParams)
  | ({
      templateType: Extract<TemplateType, "NUMBER_WORDS_BIDIR">;
    } & NumberWordsParams)
  | ({
      templateType: Extract<TemplateType, "PLACE_VALUE_QA">;
    } & PlaceValueParams)
  | ({
      templateType: Extract<TemplateType, "BASE_TEN_BLOCKS_QA">;
    } & BaseTenBlocksParams)
  | ({
      templateType: Extract<TemplateType, "NUMBER_SEQUENCE_QA">;
    } & NumberSequenceParams);

/** Respuesta del estudiante (shape por template) */
export type StudentAnswerShape =
  | { template: "EQUATION_SINGLE_CHOICE"; value: string }
  | { template: "FREQUENCY_TABLE_QA"; answers: Record<string, string | number> }
  | { template: "FREQUENCY_TABLE_COMPLETE"; filled: Record<string, number> }
  | { template: "NUMBER_WORDS_BIDIR"; value: string } // FE envía string (número o palabras)
  | { template: "PLACE_VALUE_QA"; value: string | number }
  | { template: "BASE_TEN_BLOCKS_QA"; value: number }
  | { template: "NUMBER_SEQUENCE_QA"; value: number | number[] };
