// src/components/student/ExerciseTable.tsx
import type { ReactNode } from "react";

export type TableRow = Record<string, ReactNode>;

type Props = {
  columns: string[];
  rows: TableRow[];
  align?: "left" | "center" | "right";
  compact?: boolean;
  footer?: ReactNode;
};

export function ExerciseTable({
  columns,
  rows,
  align = "left",
  compact = false,
  footer,
}: Props) {
  const tdClass =
    align === "center"
      ? "px-3 py-2 text-center"
      : align === "right"
      ? "px-3 py-2 text-right"
      : "px-3 py-2 text-left";

  return (
    <div className="w-full overflow-x-auto">
      <table
        role="table"
        className={`w-full border-collapse rounded-lg border bg-white text-sm dark:border-gray-700 dark:bg-gray-800 ${
          compact ? "" : "text-base"
        }`}
      >
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-700/50">
            {columns.map((c) => (
              <th
                key={c}
                scope="col"
                className={`px-3 py-2 font-semibold text-gray-700 dark:text-gray-100 ${
                  align === "center"
                    ? "text-center"
                    : align === "right"
                    ? "text-right"
                    : "text-left"
                }`}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t dark:border-gray-700">
              {columns.map((c) => (
                <td key={c} className={`${tdClass} dark:text-gray-100`}>
                  {r[c]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {footer ? (
          <tfoot>
            <tr className="border-t bg-gray-50 dark:border-gray-700 dark:bg-gray-700/50">
              <td className={tdClass} colSpan={columns.length}>
                {footer}
              </td>
            </tr>
          </tfoot>
        ) : null}
      </table>
    </div>
  );
}
