// src/components/student/CompetencyPills.tsx
import { memo } from "react";

type Item = {
  id: string;
  name: string;
  counts?: { total: number; pending: number };
};

type Props = {
  items: Item[];
  selectedId: string;       // "" => Todas
  onSelect: (id: string) => void;
};

export default memo(function CompetencyPills({
  items,
  selectedId,
  onSelect,
}: Props) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Competencias">
      <button
        onClick={() => onSelect("")}
        role="tab"
        aria-selected={selectedId === ""}
        className={`rounded-full px-3 py-1.5 text-sm border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
          ${
            selectedId === ""
              ? "bg-indigo-50 border-indigo-300 dark:bg-indigo-950/30 dark:border-indigo-800"
              : "bg-white dark:bg-gray-900"
          }`}
      >
        Todas
      </button>
      {items.map((c) => (
        <button
          key={c.id}
          onClick={() => onSelect(c.id)}
          role="tab"
          aria-selected={selectedId === c.id}
          title={`${c.name}${c.counts ? ` · ${c.counts.total} obj.` : ""}`}
          className={`rounded-full px-3 py-1.5 text-sm border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
            ${
              selectedId === c.id
                ? "bg-indigo-50 border-indigo-300 dark:bg-indigo-950/30 dark:border-indigo-800"
                : "bg-white dark:bg-gray-900"
            }`}
        >
          <span className="font-medium">{c.name}</span>
          {c.counts && (
            <span className="ml-2 text-xs rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5">
              {c.counts.pending}/{c.counts.total}
            </span>
          )}
        </button>
      ))}
    </div>
  );
});
