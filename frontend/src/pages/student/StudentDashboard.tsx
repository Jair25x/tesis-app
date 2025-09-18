// src/pages/student/StudentDashboard.tsx
import { useMemo, useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useOverview } from "../../hooks/progress/useOverview";
import { useStreak } from "../../hooks/progress/useStreak";
import { useAchievements as useAchievementsQ } from "../../hooks/progress/useAchievements";
import {
  showAchievementToast,
  dismissAllAchievementToasts,
} from "../../utils/showAchievementToast";

import { useMySeries } from "../../hooks/progress/useMySeries";
import MyDailySeriesChart from "../../components/student/MyDailySeriesChart";
import RecommendationsPanel from "../../components/student/RecommendationsPanel";

import {
  getActiveCurricula,
  getCurrentCurriculumId,
  getCurriculumById,
} from "../../services/curriculumService";
import type { CurriculumResponse } from "../../types/curriculum/Curriculum";

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

function inferSubjectFromCurriculumName(
  name?: string
): "math" | "lang" | undefined {
  if (!name) return undefined;
  const n = name.toLowerCase();
  if (n.includes("mate")) return "math";
  if (n.includes("leng") || n.includes("comunica")) return "lang";
  return undefined;
}

export default function StudentDashboard() {
  const { user } = useAuth();

  // Cerrar toasts de logros al salir del Dashboard
  useEffect(() => {
    return () => {
      dismissAllAchievementToasts();
    };
  }, []);

  // Asegura currículo activo
  useEffect(() => {
    (async () => {
      try {
        const currId = getCurrentCurriculumId();
        if (currId) return;
        const list = await getActiveCurricula();
        if (list && list.length > 0) {
          localStorage.setItem("app:curriculumId", list[0].id);
        }
      } catch {
        /* noop */
      }
    })();
  }, []);

  // Currículo para inferir subject
  const [curriculum, setCurriculum] = useState<CurriculumResponse | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const id = getCurrentCurriculumId();
        if (!id) return;
        const c = await getCurriculumById(id, false);
        setCurriculum(c);
      } catch {
        /* noop */
      }
    })();
  }, []);
  const subject: "math" | "lang" = useMemo(
    () => inferSubjectFromCurriculumName(curriculum?.name) ?? "math",
    [curriculum?.name]
  );

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

  // Serie diaria
  const [range, setRange] = useState<"today" | "7d" | "14d">("7d");
  const { data: series, isLoading: seriesLoading } = useMySeries(range);

  // Evitar duplicar toasts del mismo logro (mismo montaje)
  const lastAchRef = useRef<string | null>(null);

  // Clave por usuario (sin any)
  const userKeyForSession = useMemo<string>(() => {
    // Tu tipo User tiene id:number; si no hubiera user, usamos "me"
    return String(user?.id ?? "me");
  }, [user?.id]);

  // Toast por logro NUEVO (no repetir al volver al Dashboard en la MISMA sesión)
  useEffect(() => {
    if (!achievements || achievements.length === 0) return;

    const newest = achievements
      .slice()
      .sort(
        (a, b) =>
          new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime()
      )[0];
    if (!newest) return;

    const volatileKey = `${newest.code}:${newest.earnedAt}`;
    if (lastAchRef.current === volatileKey) return;

    const storageKey = `ach:lastShown:${userKeyForSession}`;
    const lastShownIso = sessionStorage.getItem(storageKey) || "";
    const lastShown = lastShownIso ? new Date(lastShownIso).getTime() : 0;
    const newestTime = new Date(newest.earnedAt).getTime();

    if (newestTime > lastShown) {
      lastAchRef.current = volatileKey;
      sessionStorage.setItem(storageKey, newest.earnedAt);
      showAchievementToast({
        title: "¡Nuevo logro!",
        description: `${newest.name} — ${newest.description ?? ""}`.trim(),
        icon: "🏅",
      });
    }
  }, [achievements, userKeyForSession]);

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
          {/* Stats del día */}
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

          {/* Serie diaria */}
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

          {/* Recomendaciones IA reales (subject dinámico) */}
          <div>
            <h2 className="text-lg font-bold text-blue-700 dark:text-blue-200 mb-4">
              🤖 Sugerencias de CapiBOT
            </h2>
            <RecommendationsPanel limit={6} subject={subject} />
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
