// src/components/student/ObjectiveCard.tsx
import { Link } from "react-router-dom";

type ObjectiveCardStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

type ObjectiveCardProps = {
  label: string;
  to: string;
  status: ObjectiveCardStatus;
  description?: string;
  coverageSolved?: number; // ejercicios distintos correctos
  coverageTotal?: number; // total ejercicios del OA
};

export default function ObjectiveCard({
  label,
  to,
  status,
  description,
  coverageSolved,
  coverageTotal,
}: ObjectiveCardProps) {
  const style =
    status === "COMPLETED"
      ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800"
      : status === "IN_PROGRESS"
      ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800"
      : "bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800";

  const badge =
    status === "COMPLETED"
      ? "✅ Completado"
      : status === "IN_PROGRESS"
      ? "🧭 En curso"
      : "🎯 Pendiente";

  const hasCoverage =
    typeof coverageSolved === "number" &&
    typeof coverageTotal === "number" &&
    coverageTotal > 0 &&
    coverageSolved >= 0;

  const pct = hasCoverage
    ? Math.min(100, Math.round((coverageSolved! / coverageTotal!) * 100))
    : 0;

  return (
    <Link
      to={to}
      className={`block rounded-xl border p-4 shadow-sm hover:shadow-md transition ${style}`}
      aria-label={`Objetivo: ${label}`}
    >
      <div className="flex items-start justify-between gap-3">
        <h4 className="font-medium leading-snug text-gray-900 dark:text-gray-100">
          {label}
        </h4>
        <span className="text-xs rounded-full bg-white/70 dark:bg-black/20 px-2 py-0.5">
          {badge}
        </span>
      </div>

      {description ? (
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
          {description}
        </p>
      ) : null}

      {hasCoverage && (
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
            <span>Cobertura</span>
            <span>
              {coverageSolved}/{coverageTotal} ({pct}%)
            </span>
          </div>
          <div className="h-2 w-full rounded bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded bg-slate-500 dark:bg-slate-300"
              style={{ width: `${pct}%` }}
              aria-label={`Cobertura ${pct}%`}
            />
          </div>
        </div>
      )}
    </Link>
  );
}
