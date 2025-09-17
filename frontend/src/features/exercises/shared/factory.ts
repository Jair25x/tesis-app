import type { CoreModule, RuntimeAdapter, ExamAdapter } from "./types";

/** Factory para “runtime” (práctica). */
export function makeRuntimeAdapter<TParams, TValue>(
  core: CoreModule<TParams, TValue>,
  writer: (v: TValue) => Record<string, unknown>
): RuntimeAdapter<TParams, TValue> {
  return {
    ...core,
    write: (v: unknown) => writer(v as TValue),
  };
}

/** Factory para “exam” (assessment). */
export function makeExamAdapter<
  TParams,
  TValue,
  TWire extends Record<string, unknown>
>(
  core: CoreModule<TParams, TValue>,
  writer: (v: TValue) => TWire
): ExamAdapter<TParams, TValue, TWire> {
  return {
    ...core,
    write: (v: unknown) => writer(v as TValue),
  };
}
