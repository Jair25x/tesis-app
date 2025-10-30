import { useEffect, useMemo, useState } from "react";
import type { TemplateType } from "../../../types/exercise/TemplateSchemaResponse";
import { registry } from "../../../features/assessments/exam/registry";

/**
 * Renderer de ejercicios para DUEL que reutiliza el mismo registry de EXAM.
 * Envía la respuesta con el shape { value: ... } hacia el padre.
 */
type Props = {
  templateType: TemplateType;
  params: unknown;
  statementHtml?: string | null;
  disabled?: boolean;
  submissionKey: string; // clave única por ronda/pregunta para persistencia ligera
  onSubmit: (answer: Record<string, unknown>) => void;
};

export default function DuelExerciseRenderer({
  templateType,
  params,
  statementHtml,
  disabled,
  submissionKey,
  onSubmit,
}: Props) {
  // 1) Resolver módulo del registro
  const mod = registry[templateType];
  const guarded = useMemo(
    () => (mod ? mod.guard(params) : null),
    [mod, params]
  );

  // 2) Estado de valor según módulo (persistencia ligera local)
  const [value, setValue] = useState<unknown>(() => {
    try {
      const raw = localStorage.getItem(`duel:ans:${submissionKey}`);
      if (raw) {
        // Si hay módulo y soporta read(), úsalo para reconstruir desde el "wire"
        const parsed = JSON.parse(raw);
        if (mod && typeof mod.read === "function") {
          return mod.read(parsed);
        }
        return parsed;
      }
    } catch {
      /* noop */
    }
    return mod ? mod.read(undefined) : null;
  });

  // Persistencia ligera en localStorage (guardamos el wire que espera el BE)
  useEffect(() => {
    try {
      const wire = mod ? mod.write(value) : { value };
      localStorage.setItem(`duel:ans:${submissionKey}`, JSON.stringify(wire));
    } catch {
      /* noop */
    }
  }, [value, submissionKey, mod]);

  // 3) Render según disponibilidad del módulo
  if (!mod || !guarded) {
    return (
      <JsonFallback
        statementHtml={statementHtml ?? null}
        disabled={disabled}
        submissionKey={submissionKey}
        value={value}
        setValue={setValue}
        onSubmit={onSubmit}
      />
    );
  }

  return (
    <ModBlock
      mod={mod}
      guarded={guarded}
      value={value}
      setValue={setValue}
      statementHtml={statementHtml ?? null}
      disabled={disabled}
      submissionKey={submissionKey}
      onSubmit={onSubmit}
    />
  );
}

/* ============================
   Subcomponentes SIN hooks condicionales
   ============================ */

type JsonFallbackProps = {
  statementHtml: string | null;
  disabled?: boolean;
  submissionKey: string;
  value: unknown;
  setValue: (v: unknown) => void;
  onSubmit: (answer: Record<string, unknown>) => void;
};

/** Fallback JSON (sin módulo) */
function JsonFallback({
  statementHtml,
  disabled,
  submissionKey,
  value,
  setValue,
  onSubmit,
}: JsonFallbackProps) {
  // Estado local del textarea (solo aquí, sin condicionales)
  const [text, setText] = useState<string>(() => {
    try {
      const raw = localStorage.getItem(`duel:ans:${submissionKey}`);
      if (!raw) return "";
      const parsed = JSON.parse(raw);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return "";
    }
  });

  // Sincroniza `text` si cambia submissionKey (pregunta nueva)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`duel:ans:${submissionKey}`);
      if (!raw) {
        setText("");
        return;
      }
      const parsed = JSON.parse(raw);
      setText(JSON.stringify(parsed, null, 2));
    } catch {
      setText("");
    }
  }, [submissionKey]);

  return (
    <div className="rounded-md border p-3 dark:border-gray-700 dark:bg-gray-900">
      {statementHtml ? (
        <div
          className="prose prose-sm max-w-none dark:prose-invert mb-3"
          dangerouslySetInnerHTML={{ __html: statementHtml }}
        />
      ) : null}

      <div className="text-xs opacity-70 mb-2">
        Tipo no soportado o configuración inválida. Puedes responder con JSON.
      </div>

      <textarea
        className="w-full rounded border px-3 py-2 font-mono text-xs dark:border-gray-700 dark:bg-gray-900"
        rows={8}
        placeholder='Ej.: {"selected":"A"}  — se enviará como { "value": ... }'
        value={text}
        onChange={(e) => {
          const t = e.target.value;
          setText(t);
          try {
            const parsed = JSON.parse(t);
            setValue(parsed); // esto actualiza el "value" global para persistencia
          } catch {
            // ignora parse inválido
          }
        }}
        disabled={disabled}
        aria-label="Respuesta en formato JSON"
      />

      <div className="mt-2">
        <button
          className="rounded bg-indigo-600 px-3 py-1.5 text-xs text-white disabled:opacity-50"
          onClick={() => onSubmit({ value })}
          disabled={disabled}
          title="Enviar respuesta"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}

type ModBlockProps = {
  mod: (typeof registry)[TemplateType];
  guarded: unknown; // tipo ya validado por mod.guard
  value: unknown;
  setValue: (v: unknown) => void;
  statementHtml: string | null;
  disabled?: boolean;
  submissionKey: string;
  onSubmit: (answer: Record<string, unknown>) => void;
};

/** Render con módulo del registry */
function ModBlock({
  mod,
  guarded,
  value,
  setValue,
  statementHtml,
  disabled,
  submissionKey,
  onSubmit,
}: ModBlockProps) {
  const canSubmit =
    typeof mod.isValid === "function" ? mod.isValid(value, guarded) : true;

  return (
    <div className="rounded-md border p-3 dark:border-gray-700">
      {/* Los cores renderizan su propio statement; no duplicamos statementHtml aquí */}
      <mod.Render
        params={guarded}
        value={value}
        onChange={(next: unknown) => setValue(next)}
        statementHtml={statementHtml}
        submissionItemId={submissionKey}
      />

      <div className="mt-3">
        <button
          className="rounded bg-indigo-600 px-4 py-2 text-sm text-white disabled:opacity-50"
          onClick={() => {
            const wire = mod.write(value);
            onSubmit({ value: wire });
          }}
          disabled={disabled || !canSubmit}
          title={!canSubmit ? "Completa la respuesta para enviar" : "Enviar"}
          aria-disabled={disabled || !canSubmit}
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
