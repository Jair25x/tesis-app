// src/features/exercises/shared/cores/FREQUENCY_TABLE_COMPLETE.tsx
import type { ReactNode } from "react";
import type { FreqCompleteParams } from "../../../../types/exercise/TemplateParams";
import FreqTableCompleteInlineCells from "../../../../components/student/FreqTableCompleteInlineCells";

export type FC_Params = FreqCompleteParams;
export type FC_Value = Record<string, number>;

/** Extrae las claves "missing" tolerando string | number | { cell: string } */
function getMissingKeysFromArray(arr: ReadonlyArray<unknown>): string[] {
  const out: string[] = [];
  for (const m of arr) {
    if (typeof m === "string" || typeof m === "number") {
      out.push(String(m));
    } else if (m && typeof m === "object") {
      const cell = (m as { cell?: unknown }).cell;
      if (typeof cell === "string" && cell.trim()) out.push(cell);
    }
  }
  return out;
}

/** Normaliza un objeto arbitrario a Record<string, number> (acepta strings numéricos) */
function toNumberMap(x: unknown): FC_Value {
  const out: FC_Value = {};
  if (!x || typeof x !== "object") return out;
  for (const [k, v] of Object.entries(x as Record<string, unknown>)) {
    if (typeof v === "number" && Number.isFinite(v)) {
      out[k] = v;
    } else if (typeof v === "string") {
      const n = Number(v.replace(",", ".").trim());
      if (Number.isFinite(n)) out[k] = n;
    }
  }
  return out;
}

const core = {
  guard(p: unknown): FC_Params | null {
    if (!p || typeof p !== "object") return null;
    const o = p as FreqCompleteParams;
    if (
      !Array.isArray(o.columns) ||
      !Array.isArray(o.rows) ||
      !Array.isArray(o.missing)
    ) {
      return null;
    }
    return o;
  },

  /** read tolerante:
   *  - { filled: {...} }
   *  - { value: { filled: {...} } }
   *  - si no hay nada válido → {}
   */
  read(raw: string | undefined): FC_Value {
    if (!raw) return {};
    try {
      const obj = JSON.parse(raw) as unknown;
      if (obj && typeof obj === "object") {
        const o = obj as Record<string, unknown>;
        if (o.filled && typeof o.filled === "object") {
          return toNumberMap(o.filled);
        }
        if (o.value && typeof o.value === "object") {
          const inner = o.value as Record<string, unknown>;
          if (inner.filled && typeof inner.filled === "object") {
            return toNumberMap(inner.filled);
          }
        }
      }
      return {};
    } catch {
      return {};
    }
  },

  isValid(v: FC_Value, p: FC_Params): boolean {
    // Si el backend indicó "missing", exige todas esas claves presentes y numéricas
    const want = getMissingKeysFromArray(
      p.missing as unknown as ReadonlyArray<unknown>
    );
    if (!want.length) return Object.keys(v).length > 0;
    return want.every((k) => Number.isFinite(v[k]));
  },

  Render({
    params,
    value,
    onChange,
    statementHtml,
  }: {
    params: FC_Params;
    value: FC_Value;
    onChange: (next: FC_Value) => void;
    statementHtml?: string | null;
    submissionItemId: string;
  }): ReactNode {
    return (
      <>
        {statementHtml && (
          <div
            className="prose prose-sm max-w-none dark:prose-invert mb-3"
            dangerouslySetInnerHTML={{ __html: statementHtml }}
          />
        )}
        <FreqTableCompleteInlineCells
          params={params}
          value={value}
          onChange={onChange}
        />
      </>
    );
  },
};

export default core;
