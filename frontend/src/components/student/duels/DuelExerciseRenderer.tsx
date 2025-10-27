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
    () => mod?.guard(params) ?? null,
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
    const wire: WireAnswer = mod.write(value as never);
    onSubmit(wire);
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
