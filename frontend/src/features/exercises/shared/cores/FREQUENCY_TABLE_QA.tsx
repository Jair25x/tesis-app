import type { ReactNode } from "react";
import type { FreqQAParams } from "../../../../types/exercise/TemplateParams";
import FreqTableQAView from "../../../../components/student/FreqTableQAView";

export type QA_Params = FreqQAParams;
export type QA_Value = Record<string, string | number>;

const core = {
  guard(p: unknown): QA_Params | null {
    if (!p || typeof p !== "object") return null;
    const o = p as FreqQAParams;
    if (
      !Array.isArray(o.columns) ||
      !Array.isArray(o.rows) ||
      !Array.isArray(o.questions)
    ) {
      return null;
    }
    return o;
  },

  /** read tolerante:
   *  - { answers: {...} }
   *  - { value: { answers: {...} } }
   *  - si no hay nada válido → {}
   */
  read(raw: string | undefined): QA_Value {
    const clean = (x: unknown): QA_Value => {
      const out: QA_Value = {};
      if (!x || typeof x !== "object") return out;
      for (const [k, v] of Object.entries(x as Record<string, unknown>)) {
        if (typeof v === "string") out[k] = v;
        else if (typeof v === "number" && Number.isFinite(v)) out[k] = v;
      }
      return out;
    };

    if (!raw) return {};
    try {
      const obj = JSON.parse(raw) as unknown;
      if (obj && typeof obj === "object") {
        const o = obj as Record<string, unknown>;
        if (o.answers && typeof o.answers === "object") {
          return clean(o.answers);
        }
        if (o.value && typeof o.value === "object") {
          const inner = o.value as Record<string, unknown>;
          if (inner.answers && typeof inner.answers === "object") {
            return clean(inner.answers);
          }
        }
      }
      return {};
    } catch {
      return {};
    }
  },

  isValid(v: QA_Value, p: QA_Params): boolean {
    // si hay preguntas específicas, exige respuesta para cada id
    const ids = (p.questions ?? []).map((q) => q.id);
    if (!ids.length) return Object.keys(v).length > 0;
    return ids.every((id) => v[id] !== undefined && v[id] !== "");
  },

  Render({
    params,
    value,
    onChange,
    statementHtml,
  }: {
    params: QA_Params;
    value: QA_Value;
    onChange: (next: QA_Value) => void;
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
        <FreqTableQAView params={params} value={value} onChange={onChange} />
      </>
    );
  },
};

export default core;
