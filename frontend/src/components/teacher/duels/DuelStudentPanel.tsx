import { useEffect, useState, type FormEvent } from "react";
import { formatDate } from "../../../utils/formatDate";
import {
  useUserDuelSummary,
  useUserDuelHistory,
} from "../../../hooks/duels/useDuelReports";
import type { UserHistoryItem } from "../../../types/duels/reports";

type Props = {
  /** Si llega desde el picker, se sincroniza aquí */
  selectedUserId?: string;
};

export default function DuelStudentPanel({ selectedUserId }: Props) {
  const [studentId, setStudentId] = useState<string>(selectedUserId ?? "");
  const [days, setDays] = useState<number>(90);

  // sincroniza prop → estado (sin loops)
  useEffect(() => {
    if ((selectedUserId ?? "") !== studentId) {
      setStudentId(selectedUserId ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUserId]);

  const {
    status: sStatus,
    data: summary,
    error: sErr,
  } = useUserDuelSummary(studentId || undefined, days);

  const {
    status: hStatus,
    data: history,
    error: hErr,
  } = useUserDuelHistory(studentId || undefined, days, 50);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // hooks reaccionan a cambios en studentId/days
  };

  const list: UserHistoryItem[] = (history ?? []) as UserHistoryItem[];

  const inputCls =
    "border border-gray-300 dark:border-white/10 rounded px-2 py-1 text-sm bg-white dark:bg-[#2d3b46] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400";
  const selectCls =
    "border border-gray-300 dark:border-white/10 rounded px-2 py-1 text-sm bg-white dark:bg-[#2d3b46] text-gray-900 dark:text-gray-100";

  return (
    <div className="rounded-xl shadow p-4 bg-white border border-gray-200 dark:bg-[#2d3b46] dark:border-white/10">
      <form
        onSubmit={onSubmit}
        className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between"
      >
        <div className="font-semibold text-gray-900 dark:text-white">
          Alumno
        </div>
        <div className="flex gap-2">
          <input
            className={inputCls}
            placeholder="uuid-del-alumno…"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value.trim())}
          />
          <select
            className={selectCls}
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
          >
            <option value={30}>30 días</option>
            <option value={60}>60 días</option>
            <option value={90}>90 días</option>
          </select>
          <button
            className="text-sm px-3 py-1 rounded border border-gray-300 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5"
            type="submit"
          >
            Ver
          </button>
        </div>
      </form>

      {/* Summary */}
      <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-3">
        <Kpi
          label="Jugadas"
          value={summary?.played ?? 0}
          loading={sStatus === "loading"}
        />
        <Kpi
          label="Ganadas"
          value={summary?.wins ?? 0}
          loading={sStatus === "loading"}
        />
        <Kpi
          label="Perdidas"
          value={summary?.losses ?? 0}
          loading={sStatus === "loading"}
        />
        <Kpi
          label="Rating"
          value={summary?.rating ?? 0}
          loading={sStatus === "loading"}
        />
        <Kpi
          label="Última"
          value={summary?.lastPlayedAt ? formatDate(summary.lastPlayedAt) : "-"}
          loading={sStatus === "loading"}
        />
      </div>
      {sErr && <div className="mt-2 text-sm text-rose-600">{sErr}</div>}

      {/* History */}
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 dark:text-gray-300/80">
              <th className="py-2 pr-3">Fecha</th>
              <th className="py-2 pr-3">Match</th>
              <th className="py-2 pr-3">Estado</th>
              <th className="py-2 pr-3">Best Of</th>
              <th className="py-2 pr-3">Ganador</th>
              <th className="py-2 pr-3">Dif.</th>
              <th className="py-2 pr-3">Código</th>
            </tr>
          </thead>
          <tbody>
            {list.map((m: UserHistoryItem) => (
              <tr
                key={m.matchId}
                className="border-t border-gray-200 dark:border-white/10"
              >
                <td className="py-2 pr-3 text-gray-900 dark:text-white">
                  {m.finishedAt
                    ? formatDate(m.finishedAt)
                    : m.createdAt
                    ? formatDate(m.createdAt)
                    : "-"}
                </td>
                <td className="py-2 pr-3 text-gray-900 dark:text-white">
                  {m.matchId.slice(0, 8)}
                </td>
                <td className="py-2 pr-3 text-gray-900 dark:text-white">
                  {m.status}
                </td>
                <td className="py-2 pr-3 text-gray-900 dark:text-white">
                  {m.bestOf}
                </td>
                <td className="py-2 pr-3 text-gray-900 dark:text-white">
                  {m.winnerId ? m.winnerId.slice(0, 8) : "-"}
                </td>
                <td className="py-2 pr-3 text-gray-900 dark:text-white">
                  {m.difficulty ?? "-"}
                </td>
                <td className="py-2 pr-3 text-gray-900 dark:text-white">
                  {m.shortCode ?? "-"}
                </td>
              </tr>
            ))}
            {hStatus !== "loading" && list.length === 0 && studentId && (
              <tr>
                <td
                  className="py-4 text-gray-500 dark:text-gray-300/80"
                  colSpan={7}
                >
                  Sin partidas en el rango para este alumno.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {hErr && <div className="mt-2 text-sm text-rose-600">{hErr}</div>}
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  loading,
}: {
  label: string;
  value: number | string;
  loading?: boolean;
}) {
  return (
    <div className="rounded-lg p-3 bg-white border border-gray-200 dark:bg-white/5 dark:border-white/10">
      <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-300/80">
        {label}
      </div>
      <div className="text-lg font-semibold text-gray-900 dark:text-white">
        {loading ? "…" : value}
      </div>
    </div>
  );
}
