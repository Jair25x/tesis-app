import { useMemo } from "react";

type Props = {
  matches: number;
  players: number;
  winRate: number; // 0..1
  avgRoundTimeSec: number;
  correctRate: number; // 0..1
};

function InfoIcon() {
  return (
    <svg
      className="w-4 h-4 inline-block ml-1 text-gray-400 dark:text-gray-300/70 group-hover:text-gray-600 dark:group-hover:text-white transition-colors"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2zm.75 5.5a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0zM11 10.25c0-.414.336-.75.75-.75h.5a.75.75 0 0 1 .75.75V17a.75.75 0 0 1-.75.75h-.5A.75.75 0 0 1 11 17v-6.75z" />
    </svg>
  );
}

function Tooltip({ label }: { label: string }) {
  return (
    <span
      role="tooltip"
      className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-1 whitespace-nowrap rounded-md bg-gray-900 text-white text-[11px] px-2 py-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 shadow transition-opacity z-10"
    >
      {label}
    </span>
  );
}

export default function DuelKpiCards(p: Props) {
  const matches = Number.isFinite(p.matches) ? p.matches : 0;
  const players = Number.isFinite(p.players) ? p.players : 0;
  const winRate = Number.isFinite(p.winRate) ? p.winRate : 0;
  const avgRoundTimeSec = Number.isFinite(p.avgRoundTimeSec)
    ? p.avgRoundTimeSec
    : 0;
  const correctRate = Number.isFinite(p.correctRate) ? p.correctRate : 0;

  const fmtPct = (v: number) => `${Math.round(v * 100)}%`;
  const fmtSec = (s: number) => `${Math.round(s)}s`;

  // Descripciones KPI (para tesis/reportes)
  const kpiDefs = useMemo(
    () => ({
      matches: "Cantidad de partidas creadas en el rango seleccionado.",
      players:
        "Número de jugadores únicos que participaron en al menos una partida del rango.",
      winRate:
        "Porcentaje de partidas ganadas por los alumnos del universo (wins / (wins + losses)).",
      avgRound:
        "Tiempo medio de respuesta por sub-pregunta (promedio de time_ms/1000).",
      correct:
        "Tasa de acierto (respuestas correctas / total de respuestas) en el rango.",
    }),
    []
  );

  const tileBase =
    "relative rounded-xl shadow p-4 bg-white border border-gray-200 dark:bg-[#2d3b46] dark:border-white/10";
  const labelBase =
    "text-xs uppercase tracking-wide text-gray-500 dark:text-gray-300/80";
  const valueBase =
    "text-2xl font-semibold text-gray-900 dark:text-white select-none";

  const Tile = ({
    label,
    value,
    tooltip,
    titleAttr,
  }: {
    label: string;
    value: string | number;
    tooltip: string;
    titleAttr: string;
  }) => (
    <div className={`${tileBase} group`} title={titleAttr}>
      <div className={labelBase}>
        {label}
        <InfoIcon />
        <Tooltip label={tooltip} />
      </div>
      <div className={valueBase}>{value}</div>
    </div>
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      <Tile
        label="Partidas"
        value={matches}
        tooltip={kpiDefs.matches}
        titleAttr={kpiDefs.matches}
      />
      <Tile
        label="Jugadores únicos"
        value={players}
        tooltip={kpiDefs.players}
        titleAttr={kpiDefs.players}
      />
      <Tile
        label="Win rate"
        value={fmtPct(winRate)}
        tooltip={kpiDefs.winRate}
        titleAttr={kpiDefs.winRate}
      />
      <Tile
        label="Tiempo medio ronda"
        value={fmtSec(avgRoundTimeSec)}
        tooltip={kpiDefs.avgRound}
        titleAttr={kpiDefs.avgRound}
      />
      <Tile
        label="Acierto"
        value={fmtPct(correctRate)}
        tooltip={kpiDefs.correct}
        titleAttr={kpiDefs.correct}
      />
    </div>
  );
}
