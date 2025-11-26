// src/types/exercise/TemplateParams.ts
import type { TemplateType } from "./TemplateSchemaResponse";

/** 1) Mustache + opciones (ya existente) */
export interface EquationParams {
  a?: number;
  b?: number;
  choices: string[];
  /** Respuesta correcta (para autoría / BE). */
  answer: string;
}

/** 2) Tabla con preguntas (FREQUENCY_TABLE_QA) */
export interface FreqQAQuestion {
  id: string;
  kind: "single_choice" | "numeric";
  prompt: string;
  options?: string[];
  /**
   * Respuesta esperada; el backend la usa para corrección
   * (string si kind = single_choice, number si kind = numeric).
   */
  answer?: string | number;
}

export interface FreqQAParams {
  columns: string[];
  rows: { actividad: string; frecuencia: number }[];
  questions: FreqQAQuestion[];
}

/** 3) Completar celdas (FREQUENCY_TABLE_COMPLETE) */
export interface FreqCompleteMissingCell {
  /** Identificador de la celda (p. ej. 'total', 'row_2_frecuencia', etc.). */
  cell: string;
  /** Valor correcto para esa celda (numérico). */
  answer?: number;
}

export interface FreqCompleteRow {
  actividad: string;
  /**
   * Si la frecuencia está ausente, la completará el estudiante.
   * Si está presente, se muestra como dato fijo.
   */
  frecuencia?: number;
}

export interface FreqCompleteParams {
  columns: string[];
  rows: FreqCompleteRow[];
  missing: FreqCompleteMissingCell[];
}

/** 4) NUEVOS — NUMBER_WORDS_BIDIR */
export type NumberWordsDirection = "WORDS_TO_DIGITS" | "DIGITS_TO_WORDS";

/**
 * Contrato alineado con el BE:
 * - direction: hacia dónde convierte el estudiante.
 * - value: lo que se muestra en el enunciado (número o palabras).
 * - answer: forma esperada normalizada (opcional en FE si solo muestra).
 */
export interface NumberWordsParams {
  direction: NumberWordsDirection;
  value: number | string; // 47_305 o "cuarenta y siete mil…"
  answer?: number | string;
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
  /** Número principal sobre el que se pregunta (cuando aplica). */
  number?: number;
  /** Tipo de pregunta (ver lista PlaceAsk). */
  ask: PlaceAsk;
  /** Cifra relevante (en preguntas tipo value_of_digit, positional_of_digit, etc.). */
  digit?: number;
  /** Cantidad de centenas usada en equivalencias (cuando aplique). */
  hundreds?: number;
  /** Opciones cuando el ítem es de opción múltiple. */
  choices?: string[];
  /**
   * Para corrección: puede ser numérico (p.ej. 70000) o string
   * ("70 000", "70,000", etc.).
   */
  answer?: number | string;
}

/** 6) NUEVOS — BASE_TEN_BLOCKS_QA */
export interface BaseTenBlocksParams {
  hundreds: number;
  tens: number;
  ones: number;
  altText?: string;
  /** Número total esperado, opcional si solo se usa visualmente. */
  answer?: number;
}

/** 7) NUEVOS — NUMBER_SEQUENCE_QA */
export interface NumberSequenceParams {
  /**
   * Secuencia mostrada al estudiante. Puedes usar null en las posiciones
   * donde haya huecos que el estudiante debe completar.
   */
  sequence: Array<number | null>;
  /** Pista textual opcional sobre la regla de la secuencia. */
  rule?: string;
  /** Un solo hueco (índice en sequence). */
  missingIndex?: number;
  /** Varios huecos: indices en sequence. */
  missingIndices?: number[];
  /** Respuesta cuando hay varios huecos. */
  answers?: number[];
  /** Respuesta cuando hay un solo hueco. */
  answer?: number;
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
  | {
      template: "FREQUENCY_TABLE_QA";
      /** answers[idPregunta] = respuesta del estudiante. */
      answers: Record<string, string | number>;
    }
  | {
      template: "FREQUENCY_TABLE_COMPLETE";
      /** filled[cellId] = valor numérico ingresado. */
      filled: Record<string, number>;
    }
  | {
      template: "NUMBER_WORDS_BIDIR";
      /** FE envía siempre string (número o palabras). */
      value: string;
    }
  | {
      template: "PLACE_VALUE_QA";
      value: string | number;
    }
  | {
      template: "BASE_TEN_BLOCKS_QA";
      value: number;
    }
  | {
      template: "NUMBER_SEQUENCE_QA";
      /** Puede ser un solo valor o varios (según el contrato del ejercicio). */
      value: number | number[];
    };
