import React, { useEffect, useMemo, useState } from "react";
import type { TemplateType } from "../../../types/exercise/TemplateSchemaResponse";
import { runtimeRegistry } from "../../../features/exercises/runtime/registry";

/** Valor serializado que enviamos al WS (objeto json plano). */
type WireAnswer = Record<string, unknown>;

type Props = {
  templateType: TemplateType;
  params: unknown;
  submissionKey: string; // p.ej. duel:<matchId>:r<round>
  onSubmit: (answer: WireAnswer) => void;
  disabled?: boolean;
  statementHtml?: string | null; // opcional si en params no viene renderizado
};

/** Type guard útil para trabajar como objeto indexable sin usar `any`. */
function isRecordUnknown(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

/**
 * Normaliza la forma del wire para el servidor de duelo:
 * - Si viene un campo "template", lo elimina.
 * - Si además queda una única clave útil (p.ej. "filled", "answers" o "value"),
 *   devuelve un objeto con solo esa clave.
 */
function normalizeWireForDuel(
  w: Record<string, unknown>
): Record<string, unknown> {
  if ("template" in w) {
    const keys = Object.keys(w).filter((k) => k !== "template");
    if (keys.length === 1) {
      const key = keys[0];
      const result: Record<string, unknown> = {};
      result[key] = w[key];
      return result;
    }
  }
  return w;
}

const DuelExerciseRenderer: React.FC<Props> = ({
  templateType,
  params,
  submissionKey,
  onSubmit,
  disabled,
  statementHtml,
}) => {
  const mod = runtimeRegistry[templateType];

  const guardedParams = useMemo(
    () => (mod ? mod.guard(params) : null),
    [mod, params]
  );

  const [value, setValue] = useState<unknown>(() =>
    mod ? mod.read(undefined) : null
  );

  useEffect(() => {
    if (mod) setValue(mod.read(undefined));
  }, [mod, submissionKey]);

  if (!mod || !guardedParams) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-2 font-medium text-gray-800 dark:text-gray-100">
          Plantilla no soportada aún ({templateType})
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          No se pudo renderizar este ejercicio.
        </div>
      </div>
    );
  }

  const isValid =
    typeof mod.isValid === "function"
      ? mod.isValid(value as never, guardedParams as never)
      : value != null;

  const doSubmit = () => {
    if (disabled) return;
    try {
      const wireRaw = mod.write(value as never);
      // Aseguramos que sea un objeto indexable y normalizamos sin usar `any`.
      const wireObject: Record<string, unknown> = isRecordUnknown(wireRaw)
        ? (wireRaw as Record<string, unknown>)
        : { value: wireRaw as unknown };
      const normalized = normalizeWireForDuel(wireObject);
      console.log("[DUEL renderer doSubmit]", { wire: wireObject, normalized });
      onSubmit(normalized);
    } catch (e) {
      console.error("[DUEL renderer doSubmit ERROR]", e);
    }
  };

  return (
    <div className="space-y-4">
      <div
        className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "enter") {
            e.preventDefault();
            if (!disabled && isValid) doSubmit();
          }
        }}
      >
        <div className="prose prose-sm max-w-none text-gray-800 dark:prose-invert dark:text-gray-100">
          <mod.Render
            params={guardedParams as never}
            value={value as never}
            onChange={(next) => setValue(next)}
            statementHtml={statementHtml ?? null}
            submissionItemId={submissionKey}
          />
        </div>
      </div>

      <div className="flex items-center justify-end">
        <button
          onClick={doSubmit}
          disabled={!!disabled || !isValid}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          Enviar
        </button>
      </div>
    </div>
  );
};

export default DuelExerciseRenderer;
