import type { ReactNode } from "react";
import type { NumberWordsParams } from "../../../../types/exercise/TemplateParams";

export type NW_Params = NumberWordsParams;
export type NW_Value = string;

const core = {
  guard(p: unknown): NW_Params | null {
    if (!p || typeof p !== "object") return null;
    const o = p as NumberWordsParams;
    return o.direction === "WORDS_TO_DIGITS" ||
      o.direction === "DIGITS_TO_WORDS"
      ? o
      : null;
  },

  read(raw?: string): NW_Value {
    if (!raw) return "";
    try {
      const obj = JSON.parse(raw) as Record<string, unknown>;
      const v = obj?.value;
      if (typeof v === "string") return v;
      if (typeof v === "number" && Number.isFinite(v)) return String(v);
      return "";
    } catch {
      return "";
    }
  },

  isValid(v: NW_Value, p: NW_Params): boolean {
    const trimmed = v.trim();
    if (!trimmed) return false;
    if (p.direction === "DIGITS_TO_WORDS") {
      const n = Number(trimmed.replace(/\s/g, "").replace(",", "."));
      return Number.isFinite(n);
    }
    return true;
  },

  Render({
    params,
    value,
    onChange,
    statementHtml,
  }: {
    params: NW_Params;
    value: NW_Value;
    onChange: (next: NW_Value) => void;
    statementHtml?: string | null;
    submissionItemId: string;
  }): ReactNode {
    const placeholder =
      params.direction === "DIGITS_TO_WORDS"
        ? "Escribe el número (ej. 47 305)"
        : "Escribe en palabras (ej. 'cuarenta y siete mil trescientos cinco')";
    return (
      <>
        {statementHtml && (
          <div
            className="prose prose-sm max-w-none dark:prose-invert mb-3"
            dangerouslySetInnerHTML={{ __html: statementHtml }}
          />
        )}
        <input
          type="text"
          inputMode={
            params.direction === "DIGITS_TO_WORDS" ? "numeric" : "text"
          }
          className="w-full rounded-md border px-3 py-2 dark:bg-zinc-900"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label="Tu respuesta"
        />
      </>
    );
  },
};

export default core;
