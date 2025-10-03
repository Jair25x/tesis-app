// src/components/teacher/duels/DuelTopPlayers.tsx
type Item = {
  userId: string;
  name?: string;
  played: number;
  wins: number;
  winRate: number; // 0..1
  rating?: number;
};

export default function DuelTopPlayers({ items }: { items: Item[] }) {
  const fmtPct = (v: number) => `${Math.round((v ?? 0) * 100)}%`;

  return (
    <div className="rounded-xl shadow p-4 bg-white border border-gray-200 dark:bg-[#2d3b46] dark:border-white/10">
      <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
        Top jugadores
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 dark:text-gray-300/80">
              <th className="py-2 pr-3">Jugador</th>
              <th className="py-2 pr-3">Jugadas</th>
              <th className="py-2 pr-3">Ganadas</th>
              <th className="py-2 pr-3">Win rate</th>
              <th className="py-2 pr-3">Rating</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr
                key={p.userId}
                className="border-t border-gray-200 dark:border-white/10"
              >
                <td className="py-2 pr-3 text-gray-900 dark:text-white">
                  {p.name || p.userId.slice(0, 8)}
                </td>
                <td className="py-2 pr-3 text-gray-900 dark:text-white">
                  {p.played}
                </td>
                <td className="py-2 pr-3 text-gray-900 dark:text-white">
                  {p.wins}
                </td>
                <td className="py-2 pr-3 text-gray-900 dark:text-white">
                  {fmtPct(p.winRate)}
                </td>
                <td className="py-2 pr-3 text-gray-900 dark:text-white">
                  {p.rating ?? "-"}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td
                  className="py-4 text-gray-500 dark:text-gray-300/80"
                  colSpan={5}
                >
                  Sin datos en el rango seleccionado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
