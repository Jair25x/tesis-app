// src/features/exercises/runtime/registry.ts
import type { TemplateType } from "../../../types/exercise/TemplateSchemaResponse";
import type { RuntimeAdapter } from "../shared/types";

import EQUATION_SINGLE_CHOICE from "./adapters/EQUATION_SINGLE_CHOICE";
import FREQUENCY_TABLE_QA from "./adapters/FREQUENCY_TABLE_QA";
import FREQUENCY_TABLE_COMPLETE from "./adapters/FREQUENCY_TABLE_COMPLETE";

import NUMBER_WORDS_BIDIR from "./adapters/NUMBER_WORDS_BIDIR";
import PLACE_VALUE_QA from "./adapters/PLACE_VALUE_QA";
import BASE_TEN_BLOCKS_QA from "./adapters/BASE_TEN_BLOCKS_QA";
import NUMBER_SEQUENCE_QA from "./adapters/NUMBER_SEQUENCE_QA";

/** Tipo heterogéneo para el registro. */
export type AnyModule = RuntimeAdapter<unknown, unknown>;

/** Registro principal (todas las plantillas soportadas en FE). */
export const registry: Record<TemplateType, AnyModule> = {
  EQUATION_SINGLE_CHOICE: EQUATION_SINGLE_CHOICE as AnyModule,
  FREQUENCY_TABLE_QA: FREQUENCY_TABLE_QA as AnyModule,
  FREQUENCY_TABLE_COMPLETE: FREQUENCY_TABLE_COMPLETE as AnyModule,

  NUMBER_WORDS_BIDIR: NUMBER_WORDS_BIDIR as AnyModule,
  PLACE_VALUE_QA: PLACE_VALUE_QA as AnyModule,
  BASE_TEN_BLOCKS_QA: BASE_TEN_BLOCKS_QA as AnyModule,
  NUMBER_SEQUENCE_QA: NUMBER_SEQUENCE_QA as AnyModule,
};

/** Helper seguro para leer del registro */
export function getRuntimeAdapter(
  tpl: string | TemplateType
): AnyModule | undefined {
  // narrow a las keys válidas
  if ((tpl as TemplateType) in registry) {
    return registry[tpl as TemplateType];
  }
  return undefined;
}

/** Alias para compatibilidad con tus imports actuales. */
export const runtimeRegistry = registry;
