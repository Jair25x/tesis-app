import type { ReactNode } from "react";
import type { BaseTenBlocksParams } from "../../../../types/exercise/TemplateParams";

export type BT_Params = BaseTenBlocksParams;
export type BT_Value = number | "";

const core = {
  guard(p: unknown): BT_Params | null {
    if (!p || typeof p !== "object") return null;
    const o = p as BaseTenBlocksParams;
    if (
      typeof o.hundreds !== "number" ||
      typeof o.tens !== "number" ||
      typeof o.ones !== "number"
    )
      return null;
    return o;
  },

  read(raw?: string): BT_Value {
    if (!raw) return "";
    try {
      const obj = JSON.parse(raw) as Record<string, unknown>;
      const v = obj?.value;
      if (typeof v === "number" && Number.isFinite(v)) return v;
      if (typeof v === "string") {
        const t = v.trim();
        if (t === "") return "";
        const n = Number(t.replace(",", "."));
        if (Number.isFinite(n)) return n;
      }
      return "";
    } catch {
      return "";
    }
  },

  isValid(v: BT_Value, params: BT_Params): boolean {
    // para evitar warning de variable no utilizada si cambias la lógica:
    void params;
    return typeof v === "number" && Number.isFinite(v);
  },

  Render({
    params,
    value,
    onChange,
    statementHtml,
  }: {
    params: BT_Params;
    value: BT_Value;
    onChange: (next: BT_Value) => void;
    statementHtml?: string | null;
    submissionItemId: string;
  }): ReactNode {
    const alt =
      params.altText ??
      `${params.hundreds} centenas, ${params.tens} decenas y ${params.ones} unidades`;

    return (
      <>
        {statementHtml && (
          <div
            className="prose prose-sm max-w-none dark:prose-invert mb-3"
            dangerouslySetInnerHTML={{ __html: statementHtml }}
          />
        )}
        <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">
          <strong>Representación:</strong> {alt}
        </div>
        <input
          type="text"
          inputMode="numeric"
          className="w-40 rounded-md border px-2 py-1 dark:bg-zinc-900"
          value={value === "" ? "" : String(value)}
          onChange={(e) => {
            const raw = e.target.value.trim();
            if (raw === "") return onChange("");
            const n = Number(raw.replace(",", "."));
            if (Number.isFinite(n)) onChange(n);
          }}
          placeholder="Número"
          aria-label="Respuesta numérica"
        />
      </>
    );
  },
};

export default core;
