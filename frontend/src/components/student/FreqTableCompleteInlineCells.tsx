// src/components/student/FreqTableCompleteInlineCells.tsx
import { useMemo } from "react";
import type { FreqCompleteParams } from "../../types/exercise/TemplateParams";
import { ExerciseTable, type TableRow } from "./ExerciseTable";

/**
 * Soporta tres convenciones para "missing.cell":
 *  - "total"
 *  - "row_{i}_frecuencia"  (clave técnica)
 *  - "<Etiqueta de la fila>" (p.ej., "Cantar")
 *
 * Además, si en params viene "targetTotal", lo mostramos como total esperado.
 * Si no viene y total no está en missing, mostramos una suma en vivo (incluye inputs).
 */

// Extiende el tipo para leer targetTotal si existe (passthrough del backend)
type FreqCompleteParamsWithTarget = FreqCompleteParams & {
  targetTotal?: number;
};

export default function FreqTableCompleteInlineCells({
  params,
  value,
  onChange,
}: {
  params: FreqCompleteParams;
  value: Record<string, number>;
  onChange: (next: Record<string, number>) => void;
}) {
  const columns = params.columns;
  const missingSet = useMemo(
    () => new Set(params.missing.map((m) => m.cell)),
    [params.missing]
  );
  const targetTotal = (params as FreqCompleteParamsWithTarget).targetTotal;

  // Normaliza filas a la forma que muestra la tabla
  const normRows: TableRow[] = useMemo(() => {
    const [colA = "Actividad", colF = "Frecuencia"] = columns;
    return params.rows.map((r) => ({
      [colA]: String(r.actividad ?? ""),
      [colF]: r.frecuencia ?? "",
    }));
  }, [columns, params.rows]);

  /**
   * Para cada fila i, determina qué clave ORIGINAL (de missing) corresponde:
   *  - Si missing contiene "row_{i}_frecuencia" → usa esa
   *  - Si missing contiene "<Etiqueta>"          → usa esa
   *  - Si no es missing → null
   */
  const uiKeyByRowIndex: (string | null)[] = useMemo(() => {
    return params.rows.map((row, i) => {
      const label = String(row.actividad ?? "");
      const techKey = `row_${i}_frecuencia`;
      if (missingSet.has(techKey)) return techKey;
      if (missingSet.has(label)) return label;
      return null;
    });
  }, [params.rows, missingSet]);

  // Suma en vivo: usa el valor escrito por el alumno si la fila es missing; si no, usa la frecuencia base
  const liveSum = useMemo(() => {
    return params.rows.reduce((acc, r, i) => {
      const uiKey = uiKeyByRowIndex[i];
      if (uiKey) {
        const filled = value[uiKey];
        return acc + (Number.isFinite(filled) ? filled : 0);
      }
      return acc + (typeof r.frecuencia === "number" ? r.frecuencia : 0);
    }, 0);
  }, [params.rows, uiKeyByRowIndex, value]);

  const handleRowFreqChange = (uiKey: string, raw: string) => {
    const n = Number(raw);
    const next = { ...value, [uiKey]: Number.isFinite(n) ? n : 0 };
    onChange(next);
  };

  const handleTotalChange = (raw: string) => {
    const n = Number(raw);
    const next = { ...value, total: Number.isFinite(n) ? n : 0 };
    onChange(next);
  };

  // Construimos filas con inputs inline donde aplique
  const rowsWithInputs: TableRow[] = normRows.map((row, i) => {
    const uiKey = uiKeyByRowIndex[i]; // null si esa fila no es "missing"
    const [colA = "Actividad", colF = "Frecuencia"] = columns;

    return {
      [colA]: row[colA],
      [colF]:
        uiKey !== null ? (
          <input
            inputMode="numeric"
            pattern="[0-9]*"
            className="w-20 rounded-md border px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            value={value[uiKey] ?? ""}
            onChange={(e) => handleRowFreqChange(uiKey, e.target.value)}
            aria-label={`Frecuencia de ${row[colA] as string}`}
          />
        ) : (
          row[colF]
        ),
    };
  });

  return (
    <div className="rounded-lg border bg-white p-4 dark:border-gray-800 dark:bg-gray-800">
      <ExerciseTable
        columns={columns}
        rows={rowsWithInputs}
        align="center"
        compact
        footer={
          <div className="flex items-center justify-end gap-2 text-sm">
            <span className="text-gray-600 dark:text-gray-300">
              {missingSet.has("total")
                ? "Total:"
                : typeof targetTotal === "number"
                ? "Total esperado:"
                : "Total:"}
            </span>

            {missingSet.has("total") ? (
              <input
                inputMode="numeric"
                pattern="[0-9]*"
                className="w-24 rounded-md border px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                value={value.total ?? ""}
                onChange={(e) => handleTotalChange(e.target.value)}
                aria-label="Total de la tabla"
              />
            ) : typeof targetTotal === "number" ? (
              <span className="font-semibold dark:text-gray-100">
                {targetTotal}
              </span>
            ) : (
              <span className="font-semibold dark:text-gray-100">
                {liveSum}
              </span>
            )}
          </div>
        }
      />
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Completa las celdas con fondo editable y luego envía tu respuesta.
      </p>
    </div>
  );
}
