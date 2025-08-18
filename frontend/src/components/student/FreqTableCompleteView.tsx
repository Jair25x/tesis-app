import { useMemo } from "react";
import type { FreqCompleteParams } from "../../types/exercise/TemplateParams";
import { ExerciseTable, type TableRow } from "./ExerciseTable";

type FilledMap = Record<string, number>;

type Props = {
  params: FreqCompleteParams;
  value: FilledMap;
  onChange: (next: FilledMap) => void;
};

// Extrae una lista de claves (string) desde params.missing (string u objeto)
function getMissingCells(missing: FreqCompleteParams["missing"]): string[] {
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

export default function FreqTableCompleteView({
  params,
  value,
  onChange,
}: Props) {
  const { columns, rows, missing } = params;

  const normRows: TableRow[] = useMemo(() => {
    const [colA = "Actividad", colF = "Frecuencia"] = columns;
    return rows.map((r) => ({
      [colA]: String(r.actividad ?? ""),
      [colF]: typeof r.frecuencia === "number" ? r.frecuencia : "",
    }));
  }, [columns, rows]);

  const missingCells = useMemo(() => getMissingCells(missing), [missing]);

  // onChange robusto: elimina la clave si vacío o no numérico
  const handleChange = (cell: string, raw: string) => {
    const trimmed = raw.trim();
    const next = { ...value };
    if (trimmed === "") {
      delete next[cell];
    } else {
      const n = Number(trimmed.replace(",", "."));
      if (Number.isFinite(n)) next[cell] = n;
      else delete next[cell];
    }
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <ExerciseTable columns={columns} rows={normRows} align="center" compact />

      <div className="rounded-lg border p-3 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
          Completa los siguientes campos:
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {missingCells.map((cell) => (
            <label
              key={cell}
              className="text-sm text-gray-700 dark:text-gray-200"
            >
              <span className="mb-1 block">{labelForCell(cell)}</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className="w-40 rounded-md border px-2 py-1 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                value={value[cell] ?? ""}
                onChange={(e) => handleChange(cell, e.target.value)}
                aria-label={labelForCell(cell)}
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function labelForCell(cell: string) {
  if (cell === "total") return "Total de la columna";
  if (cell.startsWith("row_")) return `Fila ${cell.split("_")[1]} · Frecuencia`;
  return cell;
}
