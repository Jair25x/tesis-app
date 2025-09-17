import type { TemplateType } from "../../../types/exercise/TemplateSchemaResponse";
import type { RuntimeAdapter } from "../shared/types";

import EQUATION_SINGLE_CHOICE from "./adapters/EQUATION_SINGLE_CHOICE";
import FREQUENCY_TABLE_QA from "./adapters/FREQUENCY_TABLE_QA";
import FREQUENCY_TABLE_COMPLETE from "./adapters/FREQUENCY_TABLE_COMPLETE";

/** Tipo heterogéneo para el registro. */
export type AnyModule = RuntimeAdapter<unknown, unknown>;

/** Registro principal. */
export const registry: Record<TemplateType, AnyModule> = {
  EQUATION_SINGLE_CHOICE: EQUATION_SINGLE_CHOICE as AnyModule,
  FREQUENCY_TABLE_QA: FREQUENCY_TABLE_QA as AnyModule,
  FREQUENCY_TABLE_COMPLETE: FREQUENCY_TABLE_COMPLETE as AnyModule,
};

/** Alias para compatibilidad con tus imports actuales. */
export const runtimeRegistry = registry;
