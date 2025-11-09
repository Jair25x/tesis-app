import type { ReactNode } from "react";
import type { PlaceValueParams } from "../../../../types/exercise/TemplateParams";

export type PV_Params = PlaceValueParams;
export type PV_Value = string | number;

const NUMERIC_ASKS: PV_Params["ask"][] = [
  "compose",
  "tens_count",
  "hundreds_to_units",
  "value_of_digit",
];

const core = {
  guard(p: unknown): PV_Params | null {
    if (!p || typeof p !== "object") return null;
    const o = p as PlaceValueParams;
    return o.ask ? o : null;
  },

  read(raw?: string): PV_Value {
    if (!raw) return "";
    try {
      const obj = JSON.parse(raw) as Record<string, unknown>;
      const v = obj?.value;
      if (typeof v === "number" && Number.isFinite(v)) return v;
      if (typeof v === "string") return v;
      return "";
    } catch {
      return "";
    }
  },

  isValid(v: PV_Value, params: PV_Params): boolean {
    // evita warning por param no usado en algunos asks:
    void params;

    if (NUMERIC_ASKS.includes((params as PV_Params).ask)) {
      return typeof v === "number" && Number.isFinite(v);
    }
    if ((params as PV_Params).ask === "expanded_choice") {
      if (typeof v !== "string" || v.trim() === "") return false;
      const choices = (params as PV_Params).choices ?? [];
      return choices.length ? choices.includes(v) : true;
    }
    if (typeof v === "string") return v.trim().length > 0;
    return false;
  },

  Render({
    params,
    value,
    onChange,
    statementHtml,
  }: {
    params: PV_Params;
    value: PV_Value;
    onChange: (next: PV_Value) => void;
    statementHtml?: string | null;
    submissionItemId: string;
  }): ReactNode {
    const isChoice = Array.isArray(params.choices) && params.choices.length > 0;
    const numericMode = NUMERIC_ASKS.includes(params.ask);

    return (
      <>
        {statementHtml && (
          <div
            className="prose prose-sm max-w-none dark:prose-invert mb-3"
            dangerouslySetInnerHTML={{ __html: statementHtml }}
          />
        )}

        {isChoice ? (
          <div className="flex flex-col gap-2">
            {params.choices!.map((opt) => (
              <label key={opt} className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="pv_choice"
                  value={opt}
                  checked={value === opt}
                  onChange={() => onChange(opt)}
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        ) : (
          <input
            type="text"
            inputMode={numericMode ? "numeric" : "text"}
            className="w-60 rounded-md border px-2 py-1 dark:bg-zinc-900"
            value={typeof value === "number" ? String(value) : value}
            onChange={(e) => {
              const raw = e.target.value;
              if (!numericMode) return onChange(raw);
              const t = raw.trim();
              if (t === "") return onChange("");
              const n = Number(t.replace(",", "."));
              if (Number.isFinite(n)) onChange(n);
            }}
            placeholder="Tu respuesta"
            aria-label="Respuesta"
          />
        )}
      </>
    );
  },
};

export default core;
