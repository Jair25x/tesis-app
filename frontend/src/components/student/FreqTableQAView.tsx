// src/components/student/FreqTableQAView.tsx
import { useMemo } from "react";
import type { FreqQAParams } from "../../types/exercise/TemplateParams";
import { ExerciseTable, type TableRow } from "./ExerciseTable";
import { SingleChoiceGroup } from "./SingleChoiceGroup";

/**
 * Mapa de respuestas:
 *  - Preguntas de tipo "single_choice" -> string
 *  - Preguntas de tipo "numeric"       -> number
 */
type QAAnswers = Record<string, string | number>;

type Props = {
  params: FreqQAParams;
  value: QAAnswers;
  onChange: (next: QAAnswers) => void;
};

export default function FreqTableQAView({ params, value, onChange }: Props) {
  const { columns, rows, questions } = params;

  // -------------------------------
  // 1) Normalización de la tabla
  // -------------------------------
  // Asumimos patrón: columns[0] = actividad, columns[1] = frecuencia
  const normRows: TableRow[] = useMemo(() => {
    const [colA = "Actividad", colF = "Frecuencia"] = columns;
    return rows.map((r) => ({
      [colA]: String(r.actividad ?? ""),
      [colF]: typeof r.frecuencia === "number" ? r.frecuencia : "",
    }));
  }, [columns, rows]);

  // -------------------------------
  // 2) Helpers para setear respuestas
  // -------------------------------

  // Set genérico que permite eliminar la clave si viene "undefined"
  const setAnswer = (id: string, v: string | number | undefined) => {
    const next = { ...value };
    if (v === undefined) delete next[id];
    else next[id] = v;
    onChange(next);
  };

  // Single choice: guarda string o elimina si vacío
  const handleChoice = (id: string, val: string) => {
    const trimmed = val.trim();
    if (!trimmed) setAnswer(id, undefined);
    else setAnswer(id, trimmed);
  };

  // Numeric: parsea manualmente (soporta coma), elimina si vacío/no numérico
  const handleNumeric = (id: string, raw: string) => {
    const trimmed = raw.trim();
    if (trimmed === "") {
      setAnswer(id, undefined);
      return;
    }
    const n = Number(trimmed.replace(",", "."));
    if (Number.isFinite(n)) setAnswer(id, n);
    else setAnswer(id, undefined);
  };

  // -------------------------------
  // 3) Render
  // -------------------------------
  return (
    <div className="space-y-4">
      <ExerciseTable columns={columns} rows={normRows} align="center" compact />

      <div className="space-y-4">
        {questions.map((q) => {
          const current = value[q.id];

          return (
            <div
              key={q.id}
              className="rounded-lg border p-3 dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="mb-2 text-sm font-medium text-gray-800 dark:text-gray-100">
                {q.prompt}
              </div>

              {/* Opción: selección única */}
              {q.kind === "single_choice" && (
                <SingleChoiceGroup
                  name={q.id}
                  options={q.options ?? []}
                  value={typeof current === "string" ? current : ""}
                  onChange={(v) => handleChoice(q.id, v)}
                />
              )}

              {/* Opción: numérica
                  - Usamos input type="text" + inputMode="numeric" para permitir teclado numérico en móvil
                    y controlar nosotros el parseo (evita NaN y permite borrar limpiamente).
               */}
              {q.kind === "numeric" && (
                <input
                  type="text"
                  inputMode="numeric"
                  className="w-32 rounded-md border px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  value={
                    typeof current === "number" && Number.isFinite(current)
                      ? String(current)
                      : ""
                  }
                  onChange={(e) => handleNumeric(q.id, e.target.value)}
                  aria-label={`Respuesta numérica: ${q.prompt}`}
                  placeholder="Escribe un número"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
