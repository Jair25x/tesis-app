// src/pages/student/StudentDashboard.tsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/useAuth";
import { showAchievementToast } from "../../utils/showAchievementToast";

interface CurriculumProgress {
  totalObjectives: number;
  completedObjectives: number;
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  date: string; // formato: "hace 2 días", "Hoy", etc.
  icon: string;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState<CurriculumProgress | null>(
    null
  );
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  useEffect(() => {
    // Simular delay SE MUESTRA 2 veces el TOAST por comportamiento de REACT en prod esto no sucede VERIFICAR
    setTimeout(() => {
  const simulatedAchievements = [
    {
      id: 1,
      title: "Números decimales",
      description: "Completaste el objetivo de aprendizaje",
      date: "Hace 2 días",
      icon: "📘",
    },
    {
      id: 2,
      title: "Nivel 2 alcanzado",
      description: "Alcanzaste el nivel 2 de práctica",
      date: "Hoy",
      icon: "🥇",
    },
    {
      id: 3,
      title: "Fracciones equivalentes",
      description: "Obtuviste 80% en la evaluación",
      date: "Ayer",
      icon: "🎯",
    },
  ];

  setAchievements(simulatedAchievements);

  // Mostrar un toast solo para el logro más reciente
  const latest = simulatedAchievements[0]; // puedes cambiar lógica más adelante
  showAchievementToast({
    title: "¡Nuevo logro!",
    description: latest.description,
    icon: latest.icon,
  });
}, 500);
  }, []);

  const AchievementCard = ({ icon, title, description, date }: Achievement) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex items-start gap-4">
      <div className="text-3xl">{icon}</div>
      <div>
        <h4 className="text-md font-bold text-gray-800 dark:text-white">
          {title}
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {description}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{date}</p>
      </div>
    </div>
  );

  /* --- Simulación de progreso global --- */
  useEffect(() => {
    const fetchProgress = async () => {
      await new Promise((res) => setTimeout(res, 500)); // delay simulado
      setProgressData({ totalObjectives: 40, completedObjectives: 17 });
    };
    fetchProgress();
  }, []);

  const progressPercentage =
    progressData && progressData.totalObjectives > 0
      ? Math.round(
          (progressData.completedObjectives / progressData.totalObjectives) *
            100
        )
      : null;

  return (
    <div className="p-6">
      {/* Saludo */}
      <h1 className="text-3xl font-bold mb-2">
        👋 ¡Bienvenido, {user?.nombres || "Estudiante"}!
      </h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Aquí verás tu progreso, sugerencias y tu racha diaria.
      </p>

      {/* === GRID 70 / 30 === */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* --------------------------- */}
        {/* Columna izquierda (70 %)   */}
        {/* --------------------------- */}
        <section className="flex-1 lg:w-3/4 space-y-8">
          {/* Progreso del currículo */}
          <div>
            <h2 className="text-xl font-semibold mb-2">
              📈 Progreso del currículo de Matemática
            </h2>
            {progressData === null ? (
              <p>Cargando progreso...</p>
            ) : (
              <>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-5 overflow-hidden">
                  <div
                    className="bg-green-500 h-full text-white text-xs text-center transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  >
                    {progressPercentage}%
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  Has completado {progressData.completedObjectives} de{" "}
                  {progressData.totalObjectives} objetivos de aprendizaje.
                </p>
              </>
            )}
          </div>

          {/* Sugerencias IA */}
          <div>
            <h2 className="text-lg font-bold text-blue-700 dark:text-blue-200 mb-4">
              🤖 Sugerencias personalizadas por CapiBOT
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Tarjeta 1 */}
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

              {/* Tarjeta 2 */}
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

              {/* Tarjeta 3 */}
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

        {/* --------------------------- */}
        {/* Columna derecha (30 %)     */}
        {/* --------------------------- */}
        <aside className="lg:w-1/4 space-y-8">
          {/* Racha de aprendizaje */}
          <div>
            <h2 className="text-lg font-bold text-orange-600 dark:text-orange-300 mb-3">
              🔥 Tu racha
            </h2>
            <div className="bg-orange-100 dark:bg-orange-900 rounded-xl p-6 flex items-center justify-between shadow hover:shadow-md transition">
              <div>
                <p className="text-3xl font-bold text-orange-700 dark:text-orange-200">
                  4&nbsp;días
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  ¡Sigue así!
                </p>
              </div>
              <span className="text-5xl">🏆</span>
            </div>
          </div>

          {/* ⬜ Espacio futuro: logros, ranking, etc. */}
          {/* Logros recientes */}
          <div className="mt-10">
            <h2 className="text-lg font-bold text-indigo-600 dark:text-indigo-300 mb-4">
              🏅 Logros recientes
            </h2>

            {achievements.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Cargando logros...
              </p>
            ) : (
              <div className="space-y-4">
                {achievements.map((achievement) => (
                  <AchievementCard key={achievement.id} {...achievement} />
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
