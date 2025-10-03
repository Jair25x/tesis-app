// src/pages/admin/duels/DuelReportsAdmin.tsx
import { useMemo, useState, useEffect } from "react";
import { useAdminDuelOverview } from "../../../hooks/duels/useDuelReports";
import { useToastError } from "../../../hooks/useToastError";
import DuelKpiCards from "../../../components/teacher/duels/DuelKpiCards";
import DuelTimeline from "../../../components/teacher/duels/DuelTimeline";

function isoDaysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export default function DuelReportsAdmin() {
  const [days, setDays] = useState(30);
  const range = useMemo(
    () => ({ from: isoDaysAgo(days), to: new Date().toISOString() }),
    [days]
  );
  const over = useAdminDuelOverview(range, "day");
  const toastError = useToastError();

  useEffect(() => {
    if (over.error) toastError(over.error);
  }, [over.error, toastError]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          ⚔️ Reportes Globales de Duelos
        </h1>
        <select
          className="border border-gray-300 dark:border-white/10 rounded px-2 py-1 text-sm bg-white dark:bg-white/5 text-gray-900 dark:text-white"
          value={days}
          onChange={(e) => setDays(parseInt(e.target.value))}
        >
          <option value={7}>7 días</option>
          <option value={30}>30 días</option>
          <option value={90}>90 días</option>
        </select>
      </div>

      <section className="space-y-4">
        <DuelKpiCards
          matches={over.data?.totals.matches ?? 0}
          players={over.data?.totals.players ?? 0}
          winRate={over.data?.performance.winRate ?? 0}
          avgRoundTimeSec={over.data?.performance.avgRoundTimeSec ?? 0}
          correctRate={over.data?.performance.correctRate ?? 0}
        />
        <DuelTimeline data={over.data?.timeline ?? []} />
      </section>
    </div>
  );
}
