// src/pages/student/StudentDashboard.tsx
import React, { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useOverview } from "../../hooks/progress/useOverview";
import { useStreak } from "../../hooks/progress/useStreak";
import { useAchievements as useAchievementsQ } from "../../hooks/progress/useAchievements";
import { showAchievementToast } from "../../utils/showAchievementToast";

// 👇 nuevos imports
import { useMySeries } from "../../hooks/progress/useMySeries";
import MyDailySeriesChart from "../../components/student/MyDailySeriesChart";

type StatCardProps = {
  label: string;
  value: number | string;
  hint?: string;
  color?: string;
};

function StatCard({ label, value, hint, color }: StatCardProps) {
  return (
    <div className="w-full bg-white dark:bg-[#2d3b46] shadow-lg rounded-xl p-5 transition transform hover:scale-[1.02] duration-300 ease-in-out">
      <div className="flex items-center space-x-4">
        <div
          className={`rounded-full bg-opacity-10 p-3 ${
            color ?? "text-gray-700 dark:text-white"
          }`}
        >
          <span className={`font-bold ${color ?? ""}`}>★</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
            {label}
          </span>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </span>
          {hint && (
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {hint}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const { user } = useAuth();

  const {
    data: overview,
    isLoading: loadingOverview,
    isError: errorOverview,
  } = useOverview();
  const {
    data: streak,
    isLoading: loadingStreak,
    isError: errorStreak,
  } = useStreak();
  const {
    data: achievements,
    isLoading: loadingAch,
    isError: errorAch,
  } = useAchievementsQ();

  // Serie diaria (nuevo)
  const [range, setRange] = useState<"today" | "7d" | "14d">("7d");
  const { data: series, isLoading: seriesLoading } = useMySeries(range);

  // Toast por logro nuevo (una sola vez)
  const lastAchRef = useRef<string | null>(null);
  React.useEffect(() => {
    if (!achievements || achievements.length === 0) return;
    const newest = achievements
      .slice()
      .sort(
        (a, b) =>
          new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime()
      )[0];
    if (!newest) return;
    const key = `${newest.code}:${newest.earnedAt}`;
    if (lastAchRef.current === key) return;
    lastAchRef.current = key;
    showAchievementToast({
      title: "¡Nuevo logro!",
      description: `${newest.name} — ${newest.description ?? ""}`.trim(),
      icon: "🏅",
    });
  }, [achievements]);

  const dateLabel = useMemo(() => {
    if (!overview?.date) return "";
    return new Date(overview.date).toLocaleDateString();
  }, [overview?.date]);

  return (
    <div className="p-6">
      {/* Saludo */}
      <h1 className="text-3xl font-bold mb-2">
        👋 ¡Bienvenido, {user?.nombres || "Estudiante"}!
      </h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Aquí verás tu progreso, tu racha y tus logros recientes.
      </p>

      {/* GRID 70 / 30 */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Columna izquierda (70%) */}
        <section className="flex-1 lg:w-3/4 space-y-8">
          {/* Stats del día (overview) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold">
                📈 Resumen de hoy {dateLabel ? `(${dateLabel})` : ""}
              </h2>
            </div>

            {loadingOverview ? (
              <p>Cargando resumen…</p>
            ) : errorOverview ? (
              <p className="text-sm text-red-500">
                No se pudo cargar el resumen.
              </p>
            ) : overview ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <StatCard
                  label="Intentos"
                  value={overview.attempts}
                  color="text-blue-600"
                />
                <StatCard
                  label="Aciertos"
                  value={overview.correct}
                  color="text-green-600"
                />
                <StatCard
                  label="Obj. completados"
                  value={overview.objectivesCompleted}
                  color="text-purple-600"
                />
              </div>
            ) : (
              <p className="text-sm">Sin datos por ahora.</p>
            )}
          </div>

          {/* 👇 Nuevo: Serie diaria con selector de rango */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
              Tu actividad reciente
            </h2>
            <div className="flex gap-2 text-sm">
              {(["today", "7d", "14d"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-2 py-1 rounded border dark:border-gray-700 ${
                    range === r ? "bg-gray-100 dark:bg-gray-700" : ""
                  }`}
                >
                  {r === "today" ? "Hoy" : r}
                </button>
              ))}
            </div>
          </div>
          <MyDailySeriesChart data={series} loading={seriesLoading} />

          {/* Sugerencias IA (placeholder tuyo) */}
          <div>
            <h2 className="text-lg font-bold text-blue-700 dark:text-blue-200 mb-4">
              🤖 Sugerencias de CapiBOT
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="rounded-xl border border-blue-300 bg-blue-50 dark:bg-blue-900 dark:border-blue-700 p-4 shadow hover:shadow-md transition cursor-pointer">
                <h3 className="text-md font-semibold text-blue-800 dark:text-blue-100 mb-1">
                  📘 Fracciones equivalentes
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  “Resuelve problemas con fracciones equivalentes”
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  Cantidad → Est. 6.3 → OA 6.3.2
                </p>
              </div>
              <div className="rounded-xl border border-green-300 bg-green-50 dark:bg-green-900 dark:border-green-700 p-4 shadow hover:shadow-md transition cursor-pointer">
                <h3 className="text-md font-semibold text-green-800 dark:text-green-100 mb-1">
                  🧮 Números decimales
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  “Compara y ordena números decimales hasta los milésimos”
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  Cantidad → Est. 6.2 → OA 6.2.1
                </p>
              </div>
              <div className="rounded-xl border border-purple-300 bg-purple-50 dark:bg-purple-900 dark:border-purple-700 p-4 shadow hover:shadow-md transition cursor-pointer">
                <h3 className="text-md font-semibold text-purple-800 dark:text-purple-100 mb-1">
                  🔢 Múltiplos y divisores
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  “Identifica múltiplos y divisores de números hasta el 1000”
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  Cambio y relaciones → Est. 6.4 → OA 6.4.1
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Columna derecha (30%) */}
        <aside className="lg:w-1/4 space-y-8">
          {/* Racha */}
          <div>
            <h2 className="text-lg font-bold text-orange-600 dark:text-orange-300 mb-3">
              🔥 Tu racha
            </h2>
            {loadingStreak ? (
              <p>Cargando racha…</p>
            ) : errorStreak ? (
              <p className="text-sm text-red-500">
                No se pudo cargar la racha.
              </p>
            ) : streak ? (
              <div className="bg-orange-100 dark:bg-orange-900 rounded-xl p-6 flex items-center justify-between shadow hover:shadow-md transition">
                <div>
                  <p className="text-3xl font-bold text-orange-700 dark:text-orange-200">
                    {streak.current}&nbsp;días
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Máxima: {streak.longest}
                  </p>
                </div>
                <span className="text-5xl" aria-hidden>
                  🏆
                </span>
              </div>
            ) : (
              <p className="text-sm">Sin datos.</p>
            )}
          </div>

          {/* Logros */}
          <div className="mt-10">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-indigo-600 dark:text-indigo-300">
                🏅 Logros recientes
              </h2>
              <Link
                to="/student/achievements"
                className="text-xs text-indigo-600 dark:text-indigo-300 underline"
              >
                Ver todos
              </Link>
            </div>

            {loadingAch ? (
              <p>Cargando logros…</p>
            ) : errorAch ? (
              <p className="text-sm text-red-500">
                No se pudieron cargar los logros.
              </p>
            ) : achievements && achievements.length > 0 ? (
              <div className="space-y-4">
                {achievements
                  .slice()
                  .sort(
                    (a, b) =>
                      new Date(b.earnedAt).getTime() -
                      new Date(a.earnedAt).getTime()
                  )
                  .slice(0, 4)
                  .map((a) => (
                    <div
                      key={`${a.code}:${a.earnedAt}`}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex items-start gap-4"
                    >
                      <div className="text-3xl" aria-hidden>
                        🏅
                      </div>
                      <div>
                        <h4 className="text-md font-bold text-gray-800 dark:text-white">
                          {a.name}
                        </h4>
                        {a.description ? (
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {a.description}
                          </p>
                        ) : null}
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(a.earnedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Aún no hay logros. ¡Prueba un ejercicio para empezar!
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
