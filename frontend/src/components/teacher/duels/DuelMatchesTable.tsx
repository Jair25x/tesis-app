import type {
  TeacherMatchesResp,
  TeacherMatchRow,
} from "../../../types/duels/reports";
import { formatDate } from "../../../utils/formatDate";
import { exportToCSV } from "../../../utils/exportToCsv";

type Props = {
  data: TeacherMatchesResp | null;
  onPrev: () => void;
  onNext: () => void;
  nameById?: Map<string, { fullName?: string }>;
};

function displayNameFromMap(
  userId: string,
  nameById?: Map<string, { fullName?: string }>
): string {
  const nm = nameById?.get(userId)?.fullName;
  if (nm && nm.trim().length > 0) return nm;
  return userId.slice(0, 8);
}

function safePlayers(
  m: TeacherMatchRow,
  nameById?: Map<string, { fullName?: string }>
): string {
  const arr = Array.isArray(m.players) ? m.players : [];
  return arr
    .map((p) => {
      if (p.name && p.name.trim().length > 0) return p.name;
      return displayNameFromMap(p.userId, nameById);
    })
    .join("; ");
}

function valOrDash(v: string | number | null | undefined): string {
  if (v === undefined || v === null || v === "") return "-";
  return String(v);
}

export default function DuelMatchesTable({
  data,
  onPrev,
  onNext,
  nameById,
}: Props) {
  const items: TeacherMatchRow[] = Array.isArray(data?.items)
    ? data!.items
    : [];
  const canPrev = (data?.offset ?? 0) > 0;
  const canNext = data ? data.offset + data.limit < data.total : false;

  const onExport = () => {
    const rows = items.map((m) => ({
      matchId: m.matchId,
      createdAt: m.createdAt ?? "",
      finishedAt: m.finishedAt ?? "",
      bestOf: m.bestOf,
      status: m.status,
      winnerId: m.winnerId ?? "",
      winnerName: m.winnerId ? displayNameFromMap(m.winnerId, nameById) : "",
      players: safePlayers(m, nameById),
      rounds: typeof m.rounds === "number" ? m.rounds : "",
      answers: typeof m.answers === "number" ? m.answers : "",
      objectiveId: m.objectiveId ?? "",
      difficulty: m.difficulty ?? "",
      shortCode: m.shortCode ?? "",
      mode: m.mode ?? "",
      maxPlayers: typeof m.maxPlayers === "number" ? m.maxPlayers : "",
    }));
    exportToCSV(rows, "duels_matches");
  };

  return (
    <div className="rounded-xl shadow p-4 bg-white border border-gray-200 dark:bg-[#2d3b46] dark:border-white/10">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-semibold text-gray-900 dark:text-white">
          Partidas
        </div>
        <div className="flex gap-2">
          <button
            className="text-xs px-2 py-1 rounded border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5"
            onClick={onExport}
            aria-label="Exportar partidas a CSV"
          >
            Exportar CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 dark:text-gray-300/80">
              <th className="py-2 pr-3">Creación</th>
              <th className="py-2 pr-3">Finalización</th>
              <th className="py-2 pr-3">Match</th>
              <th className="py-2 pr-3">Jugadores</th>
              <th className="py-2 pr-3">Ganador</th>
              <th className="py-2 pr-3">Rondas</th>
              <th className="py-2 pr-3">Resp.</th>
              <th className="py-2 pr-3">Dif.</th>
              <th className="py-2 pr-3">Modo</th>
              <th className="py-2 pr-3">Max.</th>
              <th className="py-2 pr-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {items.map((m) => {
              const createdTxt = m.createdAt ? formatDate(m.createdAt) : "-";
              const finishedTxt = m.finishedAt ? formatDate(m.finishedAt) : "-";
              const roundsTxt =
                typeof m.rounds === "number" ? String(m.rounds) : "-";
              const answersTxt =
                typeof m.answers === "number" ? String(m.answers) : "-";
              const playersTxt = safePlayers(m, nameById) || "-";
              const winnerTxt = m.winnerId
                ? displayNameFromMap(m.winnerId, nameById)
                : "-";

              return (
                <tr
                  key={m.matchId}
                  className="border-t border-gray-200 dark:border-white/10"
                >
                  <td className="py-2 pr-3 text-gray-900 dark:text-white">
                    {createdTxt}
                  </td>
                  <td className="py-2 pr-3 text-gray-900 dark:text-white">
                    {finishedTxt}
                  </td>
                  <td className="py-2 pr-3 text-gray-900 dark:text-white">
                    {m.matchId.slice(0, 8)}
                    {m.shortCode ? ` / ${m.shortCode}` : ""}
                  </td>
                  <td className="py-2 pr-3 text-gray-900 dark:text-white">
                    {playersTxt}
                  </td>
                  <td className="py-2 pr-3 text-gray-900 dark:text-white">
                    {winnerTxt}
                  </td>
                  <td className="py-2 pr-3 text-gray-900 dark:text-white">
                    {roundsTxt}
                  </td>
                  <td className="py-2 pr-3 text-gray-900 dark:text-white">
                    {answersTxt}
                  </td>
                  <td className="py-2 pr-3 text-gray-900 dark:text-white">
                    {m.difficulty ?? "-"}
                  </td>
                  <td className="py-2 pr-3 text-gray-900 dark:text-white">
                    {valOrDash(m.mode)}
                  </td>
                  <td className="py-2 pr-3 text-gray-900 dark:text-white">
                    {valOrDash(m.maxPlayers)}
                  </td>
                  <td className="py-2 pr-3 text-gray-900 dark:text-white">
                    {m.status}
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td
                  className="py-4 text-gray-500 dark:text-gray-300/80"
                  colSpan={11}
                >
                  Sin partidas en el rango.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-3 text-sm">
        <div className="text-gray-700 dark:text-gray-200">
          {data && (
            <span>
              {data.total === 0
                ? "0–0 de 0"
                : `${data.offset + 1}–${Math.min(
                    data.offset + data.limit,
                    data.total
                  )} de ${data.total}`}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            className="px-2 py-1 rounded border border-gray-200 dark:border-white/10 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-white/5"
            onClick={onPrev}
            disabled={!canPrev}
          >
            Anterior
          </button>
          <button
            className="px-2 py-1 rounded border border-gray-200 dark:border-white/10 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-white/5"
            onClick={onNext}
            disabled={!canNext}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
