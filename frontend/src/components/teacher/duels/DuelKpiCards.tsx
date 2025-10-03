// src/components/teacher/duels/DuelKpiCards.tsx
type Props = {
  matches: number;
  players: number;
  winRate: number; // 0..1
  avgRoundTimeSec: number;
  correctRate: number; // 0..1
};

export default function DuelKpiCards(p: Props) {
  const matches = Number.isFinite(p.matches) ? p.matches : 0;
  const players = Number.isFinite(p.players) ? p.players : 0;
  const winRate = Number.isFinite(p.winRate) ? p.winRate : 0;
  const avgRoundTimeSec = Number.isFinite(p.avgRoundTimeSec)
    ? p.avgRoundTimeSec
    : 0;
  const correctRate = Number.isFinite(p.correctRate) ? p.correctRate : 0;

  const fmtPct = (v: number) => `${Math.round((v ?? 0) * 100)}%`;
  const fmtSec = (s: number) => `${Math.round(s ?? 0)}s`;

  const tile =
    "rounded-xl shadow p-4 bg-white border border-gray-200 " +
    "dark:bg-[#2d3b46] dark:border-white/10";
  const label =
    "text-xs uppercase tracking-wide text-gray-500 " + "dark:text-gray-300/80";
  const val = "text-2xl font-semibold text-gray-900 " + "dark:text-white";

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      <div className={tile}>
        <div className={label}>Partidas</div>
        <div className={val}>{matches}</div>
      </div>
      <div className={tile}>
        <div className={label}>Jugadores únicos</div>
        <div className={val}>{players}</div>
      </div>
      <div className={tile}>
        <div className={label}>Win rate</div>
        <div className={val}>{fmtPct(winRate)}</div>
      </div>
      <div className={tile}>
        <div className={label}>Tiempo medio ronda</div>
        <div className={val}>{fmtSec(avgRoundTimeSec)}</div>
      </div>
      <div className={tile}>
        <div className={label}>Acierto</div>
        <div className={val}>{fmtPct(correctRate)}</div>
      </div>
    </div>
  );
}
