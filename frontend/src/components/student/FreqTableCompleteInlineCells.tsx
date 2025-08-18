import { useMemo } from "react";
import type { FreqCompleteParams } from "../../types/exercise/TemplateParams";
import { ExerciseTable, type TableRow } from "./ExerciseTable";

/**
 * Soporta tres convenciones para "missing":
 *  - "total"
 *  - "row_{i}_frecuencia"   (clave técnica)
 *  - "<Etiqueta de la fila>" (p.ej., "Cantar")
 *
 * Además, si en params viene "targetTotal", lo mostramos como total esperado.
 * Si no viene y total no está en missing, mostramos una suma en vivo (incluye inputs).
 */

// Extiende el tipo para leer targetTotal si existe (passthrough del backend)
type FreqCompleteParamsWithTarget = FreqCompleteParams & {
  targetTotal?: number;
};

// Extrae una lista de claves (string) desde params.missing (puede venir como string u objeto)
function getMissingKeys(missing: FreqCompleteParams["missing"]): string[] {
  const out: string[] = [];
  for (const m of missing as unknown[]) {
    if (typeof m === "string" || typeof m === "number") {
      out.push(String(m));
    } else if (m && typeof m === "object") {
      const cell = (m as { cell?: unknown }).cell;
      if (typeof cell === "string" && cell.trim()) out.push(cell);
    }
  }
  return out;
}

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

  // Conjunto de claves "missing" (como strings legibles)
  const missingSet = useMemo(
    () => new Set(getMissingKeys(params.missing)),
    [params.missing]
  );

  const targetTotal = (params as FreqCompleteParamsWithTarget).targetTotal;

  // Normaliza filas a la forma que muestra la tabla
  const normRows: TableRow[] = useMemo(() => {
    const [colA = "Actividad", colF = "Frecuencia"] = columns;
    return params.rows.map((r) => ({
      [colA]: String(r.actividad ?? ""),
      [colF]: typeof r.frecuencia === "number" ? r.frecuencia : "",
    }));
  }, [columns, params.rows]);

  /**
   * Mapea índice de fila -> clave UI que se debe completar:
   *  - Si missing contiene "row_{i}_frecuencia" → usa esa
   *  - Si missing contiene "<Etiqueta>"         → usa esa
   *  - Si no está missing → null (no editable)
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

  // Helpers onChange: si el input queda vacío o no numérico → eliminamos la clave
  const setCell = (key: string, raw: string) => {
    const trimmed = raw.trim();
    const next = { ...value };
    if (!trimmed) {
      delete next[key];
      onChange(next);
      return;
    }
    const n = Number(trimmed.replace(",", "."));
    if (Number.isFinite(n)) {
      next[key] = n;
      onChange(next);
    } else {
      delete next[key];
      onChange(next);
    }
  };

  const handleRowFreqChange = (uiKey: string, raw: string) =>
    setCell(uiKey, raw);
  const handleTotalChange = (raw: string) => setCell("total", raw);

  // Construimos filas con inputs inline donde aplique
  const rowsWithInputs: TableRow[] = normRows.map((row, i) => {
    const uiKey = uiKeyByRowIndex[i]; // null si esa fila no es "missing"
    const [colA = "Actividad", colF = "Frecuencia"] = columns;

    return {
      [colA]: row[colA],
      [colF]:
        uiKey !== null ? (
          <input
            // Usamos text+inputMode para teclado numérico móvil, y parseamos manual
            type="text"
            inputMode="numeric"
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
                type="text"
                inputMode="numeric"
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
