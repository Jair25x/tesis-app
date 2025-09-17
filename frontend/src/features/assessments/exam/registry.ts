import type { TemplateType } from "../../../types/exercise/TemplateSchemaResponse";
import type { ExamAdapter } from "../../exercises/shared/types";

import EQUATION_SINGLE_CHOICE from "./adapters/EQUATION_SINGLE_CHOICE";
import FREQUENCY_TABLE_QA from "./adapters/FREQUENCY_TABLE_QA";
import FREQUENCY_TABLE_COMPLETE from "./adapters/FREQUENCY_TABLE_COMPLETE";

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
};
