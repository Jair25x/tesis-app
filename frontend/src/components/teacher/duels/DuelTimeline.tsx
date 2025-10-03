// src/components/teacher/duels/DuelTimeline.tsx
import { useMemo } from "react";

type Point = { bucket: string; matches: number };

function isPoint(x: unknown): x is Point {
  if (typeof x !== "object" || x === null) return false;
  if (!("bucket" in x) || !("matches" in x)) return false;

  const bucket = (x as { bucket: unknown }).bucket;
  const matches = (x as { matches: unknown }).matches;
  return typeof bucket === "string" && typeof matches === "number";
}

export default function DuelTimeline({
  data,
}: {
  data: ReadonlyArray<unknown>;
}) {
  const safe = useMemo<Point[]>(() => (data ?? []).filter(isPoint), [data]);
  const max = useMemo(() => Math.max(1, ...safe.map((d) => d.matches)), [safe]);

  return (
    <div className="rounded-xl shadow p-4 bg-white border border-gray-200 dark:bg-[#2d3b46] dark:border-white/10">
      <div className="flex items-end gap-1 h-28">
        {safe.map((d) => {
          const pct = (d.matches / max) * 100;
          const h = Math.max(2, pct);
          return (
            <div key={d.bucket} className="flex-1 flex flex-col items-center">
              <div
                className="w-full rounded-t bg-gray-300 dark:bg-white/20"
                style={{ height: `${h}%` }}
                title={`${d.bucket}: ${d.matches}`}
              />
            </div>
          );
        })}
        {safe.length === 0 && (
          <div className="w-full text-center text-sm text-gray-500 dark:text-gray-300/80 py-6">
            Sin datos en el rango seleccionado.
          </div>
        )}
      </div>
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-300/80">
        Actividad por período
      </div>
    </div>
  );
}
