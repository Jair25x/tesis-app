import type { TemplateType } from "../../../types/exercise/TemplateSchemaResponse";
import type { ExamAdapter } from "../../exercises/shared/types";

// Adaptadores existentes
import EQUATION_SINGLE_CHOICE from "./adapters/EQUATION_SINGLE_CHOICE";
import FREQUENCY_TABLE_QA from "./adapters/FREQUENCY_TABLE_QA";
import FREQUENCY_TABLE_COMPLETE from "./adapters/FREQUENCY_TABLE_COMPLETE";

// === NUEVOS (Unidad 1 – 4.º) ===
// OJO: estos deben venir de ./adapters/..., no de shared/cores
import NUMBER_WORDS_BIDIR from "./adapters/NUMBER_WORDS_BIDIR";
import PLACE_VALUE_QA from "./adapters/PLACE_VALUE_QA";
import BASE_TEN_BLOCKS_QA from "./adapters/BASE_TEN_BLOCKS_QA";
import NUMBER_SEQUENCE_QA from "./adapters/NUMBER_SEQUENCE_QA";

/** Tipo heterogéneo para el registro. */
export type AnyExamModule = ExamAdapter<
  unknown,
  unknown,
  Record<string, unknown>
>;

/** Exporta como `registry` (lo usas en TakeAssessment). */
export const registry: Record<TemplateType, AnyExamModule> = {
  EQUATION_SINGLE_CHOICE: EQUATION_SINGLE_CHOICE as AnyExamModule,
  FREQUENCY_TABLE_QA: FREQUENCY_TABLE_QA as AnyExamModule,
  FREQUENCY_TABLE_COMPLETE: FREQUENCY_TABLE_COMPLETE as AnyExamModule,

  // NUEVOS
  NUMBER_WORDS_BIDIR: NUMBER_WORDS_BIDIR as AnyExamModule,
  PLACE_VALUE_QA: PLACE_VALUE_QA as AnyExamModule,
  BASE_TEN_BLOCKS_QA: BASE_TEN_BLOCKS_QA as AnyExamModule,
  NUMBER_SEQUENCE_QA: NUMBER_SEQUENCE_QA as AnyExamModule,
};
