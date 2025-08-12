// src/components/student/FreqTableQAView.tsx
import { useMemo } from "react";
import type { FreqQAParams } from "../../types/exercise/TemplateParams";
import { ExerciseTable, type TableRow } from "./ExerciseTable";
import { SingleChoiceGroup } from "./SingleChoiceGroup";

type QAAnswers = Record<string, string | number>;

type Props = {
  params: FreqQAParams;
  value: QAAnswers;
  onChange: (next: QAAnswers) => void;
};

export default function FreqTableQAView({ params, value, onChange }: Props) {
  const { columns, rows, questions } = params;

  const normRows: TableRow[] = useMemo(() => {
    // Asumimos el patrón (columns[0] = actividad, columns[1] = frecuencia).
    const [colA = "Actividad", colF = "Frecuencia"] = columns;
    return rows.map((r) => ({
      [colA]: r.actividad,
      [colF]: r.frecuencia,
    }));
  }, [columns, rows]);

  return (
    <div className="space-y-4">
      <ExerciseTable columns={columns} rows={normRows} align="center" compact />

      <div className="space-y-4">
        {questions.map((q) => (
          <div
            key={q.id}
            className="rounded-lg border p-3 dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="mb-2 text-sm font-medium text-gray-800 dark:text-gray-100">
              {q.prompt}
            </div>

            {q.kind === "single_choice" && (
              <SingleChoiceGroup
                name={q.id}
                options={q.options ?? []}
                value={(value[q.id] as string) ?? ""}
                onChange={(v) => onChange({ ...value, [q.id]: v })}
              />
            )}

            {q.kind === "numeric" && (
              <input
                type="number"
                className="w-32 rounded-md border px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                value={(value[q.id] as number) ?? ""}
                onChange={(e) =>
                  onChange({ ...value, [q.id]: Number(e.target.value) })
                }
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
