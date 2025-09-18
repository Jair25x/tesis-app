import { useMemo } from "react";
import type { ExerciseResponse } from "../../types/exercise/ExerciseResponse";
import { Link } from "react-router-dom";
import { renderStatement } from "../../utils/renderStatement";

type Props = {
  exercise: ExerciseResponse;
  curriculumId: string;
  competencyId: string;
  standardId: string;
  learningObjectiveId: string;
  index?: number;
  /** Si true, oculta acciones que no aplican en examen (ej. “Resolver” fuera del player) */
  examMode?: boolean;
};

const difColor: Record<string, string> = {
  BASIC:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  INTERMEDIATE:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  ADVANCED: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200",
};

export default function ExerciseCard({
  exercise,
  curriculumId,
  competencyId,
  standardId,
  learningObjectiveId,
  index = 0,
  examMode = false,
}: Props) {
  const previewHtml = useMemo(() => {
    try {
      return renderStatement(exercise.statement, exercise.parameters ?? {});
    } catch {
      return { __html: exercise.statement ?? "" };
    }
  }, [exercise.statement, exercise.parameters]);

  return (
    <li className="rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs uppercase text-gray-500 dark:text-gray-400">
          #{index + 1}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
            difColor[exercise.difficulty] ||
            "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
          }`}
        >
          {exercise.difficulty}
        </span>
      </div>

      <div
        className="mb-4 text-sm text-gray-800 dark:text-gray-100"
        dangerouslySetInnerHTML={previewHtml}
      />

      {/* En examMode no tiene sentido llevar al player de práctica */}
      {!examMode && (
        <Link
          className="inline-block rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
          to={`/student/exercises/${curriculumId}/${competencyId}/${standardId}/${learningObjectiveId}/${exercise.id}`}
        >
          Resolver
        </Link>
      )}
    </li>
  );
}
