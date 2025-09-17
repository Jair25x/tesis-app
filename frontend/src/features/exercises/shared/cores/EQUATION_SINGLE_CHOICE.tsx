import type { ReactNode } from "react";
import { SingleChoiceGroup } from "../../../../components/student/SingleChoiceGroup";

export type SC_Params = { choices: string[] };
export type SC_Value = string;

/** Core EQUATION_SINGLE_CHOICE (sin write, sólo guard/read/Render) */
const core = {
  guard(p: unknown): SC_Params | null {
    if (!p || typeof p !== "object") return null;
    const o = p as { choices?: unknown };
    if (!Array.isArray(o.choices)) return null;
    // normaliza a strings
    const choices = o.choices.map((c) => String(c ?? ""));
    return { choices };
  },

  /** read tolerante: soporta:
   *  - top-level: { value: string } | legacy { selected: string }
   *  - anidado:   { value: { value: string } } | { value: { selected: string } }
   *  - si no hay nada válido → ""
   */
  read(raw: string | undefined): SC_Value {
    if (!raw) return "";
    try {
      const obj = JSON.parse(raw) as unknown;

      const extract = (x: unknown): string | undefined => {
        if (!x || typeof x !== "object") return undefined;
        const o = x as Record<string, unknown>;

        // 1) top-level
        const topVal = o.value;
        if (typeof topVal === "string") return topVal;
        const topSel = o.selected;
        if (typeof topSel === "string") return topSel;

        // 2) anidado bajo "value"
        if (topVal && typeof topVal === "object") {
          const inner = topVal as Record<string, unknown>;
          if (typeof inner.value === "string") return inner.value;
          if (typeof inner.selected === "string") return inner.selected;
        }

        return undefined;
      };

      return extract(obj) ?? "";
    } catch {
      return "";
    }
  },

  isValid(v: SC_Value): boolean {
    return typeof v === "string" && v.trim().length > 0;
  },

  Render({
    params,
    value,
    onChange,
    statementHtml,
    submissionItemId,
  }: {
    params: SC_Params;
    value: SC_Value;
    onChange: (next: SC_Value) => void;
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
        <div className="rounded-lg border bg-white p-4 dark:border-gray-800 dark:bg-gray-800">
          <SingleChoiceGroup
            name={`sc-${submissionItemId}`}
            options={params.choices}
            value={value}
            onChange={onChange}
          />
        </div>
      </>
    );
  },
};

export default core;
