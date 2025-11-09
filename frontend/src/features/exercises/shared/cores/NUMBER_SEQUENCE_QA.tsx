import type { ReactNode } from "react";
import type { NumberSequenceParams } from "../../../../types/exercise/TemplateParams";

export type NS_Params = NumberSequenceParams;
export type NS_Value = number | number[] | "";

const core = {
  guard(p: unknown): NS_Params | null {
    if (!p || typeof p !== "object") return null;
    const o = p as NS_Params;
    return Array.isArray(o.sequence) ? o : null;
  },

  read(raw?: string): NS_Value {
    if (!raw) return "";
    try {
      const obj = JSON.parse(raw) as Record<string, unknown>;
      const v = obj?.value;
      if (typeof v === "number" && Number.isFinite(v)) return v;
      if (
        Array.isArray(v) &&
        v.every((x) => typeof x === "number" && Number.isFinite(x))
      ) {
        return v as number[];
      }
      if (typeof v === "string") {
        const n = Number(v.replace(",", "."));
        if (Number.isFinite(n)) return n;
      }
      return "";
    } catch {
      return "";
    }
  },

  isValid(v: NS_Value, params: NS_Params): boolean {
    const expected =
      params.missingIndices && params.missingIndices.length > 0
        ? params.missingIndices.length
        : params.missingIndex != null
        ? 1
        : 1;

    if (Array.isArray(v))
      return v.length === expected && v.every(Number.isFinite);
    return typeof v === "number" && Number.isFinite(v);
  },

  Render({
    params,
    value,
    onChange,
    statementHtml,
  }: {
    params: NS_Params;
    value: NS_Value;
    onChange: (next: NS_Value) => void;
    statementHtml?: string | null;
    submissionItemId: string;
  }): ReactNode {
    const display = params.sequence
      .map((x) =>
        x == null ? "____" : new Intl.NumberFormat("es-PE").format(x)
      )
      .join(", ");

    const many = !!(params.missingIndices && params.missingIndices.length > 1);

    return (
      <>
        {statementHtml && (
          <div
            className="prose prose-sm max-w-none dark:prose-invert mb-3"
            dangerouslySetInnerHTML={{ __html: statementHtml }}
          />
        )}

        <div className="mb-2 text-sm">
          <strong>Secuencia:</strong> {display}
          {params.rule ? (
            <div className="text-xs opacity-80">Regla: {params.rule}</div>
          ) : null}
        </div>

        {!many ? (
          <input
            type="text"
            inputMode="numeric"
            className="w-40 rounded-md border px-2 py-1 dark:bg-zinc-900"
            value={typeof value === "number" ? String(value) : ""}
            onChange={(e) => {
              const raw = e.target.value.trim();
              if (raw === "") return onChange("");
              const n = Number(raw.replace(",", "."));
              if (Number.isFinite(n)) onChange(n);
            }}
            placeholder="Número faltante"
            aria-label="Número faltante"
          />
        ) : (
          <div className="flex flex-col gap-2">
            {params.missingIndices!.map((idx, i) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-xs opacity-80">Hueco {i + 1}</span>
                <input
                  type="text"
                  inputMode="numeric"
                  className="w-40 rounded-md border px-2 py-1 dark:bg-zinc-900"
                  value={
                    Array.isArray(value) && Number.isFinite(value[i] as number)
                      ? String(value[i])
                      : ""
                  }
                  onChange={(e) => {
                    const raw = e.target.value.trim();
                    const n = raw === "" ? NaN : Number(raw.replace(",", "."));
                    const current = Array.isArray(value)
                      ? [...value]
                      : Array(params.missingIndices!.length).fill(NaN);
                    current[i] = Number.isFinite(n) ? n : NaN;
                    onChange(current);
                  }}
                  placeholder={`Hueco ${i + 1}`}
                />
              </div>
            ))}
          </div>
        )}
      </>
    );
  },
};

export default core;
