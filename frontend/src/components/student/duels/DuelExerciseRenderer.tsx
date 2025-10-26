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
      <div className="p-4 rounded-md border bg-white">
        <div className="font-medium mb-2">
          Plantilla no soportada aún ({templateType})
        </div>
        <div className="text-sm opacity-70">
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
        className="rounded-lg border bg-white p-4"
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "enter") {
            e.preventDefault();
            if (!disabled && isValid) doSubmit();
          }
        }}
      >
        <mod.Render
          params={guardedParams as never}
          value={value as never}
          onChange={(next) => setValue(next)}
          statementHtml={statementHtml ?? null}
          submissionItemId={submissionKey}
        />
      </div>

      <div className="flex items-center justify-end">
        <button
          onClick={doSubmit}
          disabled={!!disabled || !isValid}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
        >
          Enviar
        </button>
      </div>
    </div>
  );
};

export default DuelExerciseRenderer;
