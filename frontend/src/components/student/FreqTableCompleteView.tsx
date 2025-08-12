// src/components/student/FreqTableCompleteView.tsx
import { useMemo } from "react";
import type {
  FreqCompleteParams,
  FreqCompleteMissingCell,
} from "../../types/exercise/TemplateParams";
import { ExerciseTable, type TableRow } from "./ExerciseTable";

type FilledMap = Record<string, number>;

type Props = {
  params: FreqCompleteParams;
  value: FilledMap;
  onChange: (next: FilledMap) => void;
};

export default function FreqTableCompleteView({
  params,
  value,
  onChange,
}: Props) {
  const { columns, rows, missing } = params;

  const normRows: TableRow[] = useMemo(() => {
    const [colA = "Actividad", colF = "Frecuencia"] = columns;
    return rows.map((r) => ({
      [colA]: r.actividad,
      [colF]: r.frecuencia ?? "",
    }));
  }, [columns, rows]);

  const handleChange = (cell: FreqCompleteMissingCell["cell"], v: number) => {
    onChange({ ...value, [cell]: v });
  };

  return (
    <div className="space-y-4">
      <ExerciseTable columns={columns} rows={normRows} align="center" compact />

      <div className="rounded-lg border p-3 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
          Completa los siguientes campos:
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {missing.map((m) => (
            <label
              key={m.cell}
              className="text-sm text-gray-700 dark:text-gray-200"
            >
              <span className="mb-1 block">{labelForCell(m.cell)}</span>
              <input
                type="number"
                className="w-40 rounded-md border px-2 py-1 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                value={value[m.cell] ?? ""}
                onChange={(e) => handleChange(m.cell, Number(e.target.value))}
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
