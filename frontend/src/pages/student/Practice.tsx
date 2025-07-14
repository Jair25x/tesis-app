import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getExercisesByObjective } from "../../services/exerciseService";
import type { ExerciseResponse } from "../../types/ExerciseResponse";
import LoadingScreen from "../../components/LoadingScreen";
import { showAchievementToast } from "../../utils/showAchievementToast";
import Mustache from "mustache";

export default function Practice() {
  /* ------------------------------------------------------------
   * 1. Identificar el OA; por ahora obtén el parámetro de la URL.
   *    RUTA EJEMPLO:  /student/practice/:objectiveId
   * ---------------------------------------------------------- */
  const { objectiveId } = useParams<{ objectiveId: string }>();

  /* ----------------- state ----------------- */
  const [exercise, setExercise] = useState<ExerciseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  /* ----------------- fetch ejercicio ----------------- */
  useEffect(() => {
    const fetchExercise = async () => {
      try {
        // Demo: tomamos el primer ejercicio del OA
        const list = await getExercisesByObjective(objectiveId ?? "");
        setExercise(list[0]); // TODO: jugador elegir siguiente, paginación, etc.
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchExercise();
  }, [objectiveId]);

  /* ----------------- lógica envio ----------------- */
  const handleSubmit = () => {
    // TODO: llamar endpoint /check; por ahora mock
    const isCorrect = answer.trim() === "5"; // ⚠️ placeholder
    setFeedback(isCorrect ? "correct" : "wrong");

    if (isCorrect) {
      showAchievementToast({
        title: "¡Respuesta correcta!",
        description: "Has ganado 10 puntos de experiencia 🥳",
        icon: "🎉",
      });
      // TODO: cargar siguiente ejercicio
    }
  };

  /* ----------------- render ----------------- */
  if (loading || !exercise) return <LoadingScreen />;

  /* 3 posibles escenarios para el enunciado:
     a) Ya viene en `statement`
     b) statement vacío → renderizamos Mustache con pattern + parameters
     c) Casos futuros con componentes específicos por templateType         */
  const finalStatement = Mustache.render(
    exercise.statement ?? "",
    exercise.parameters ?? {}
  );

  return (
    <div className="p-4 flex flex-col lg:flex-row gap-6">
      {/* Área principal */}
      <section className="flex-1 space-y-4">
        {/* Enunciado */}
        <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow">
          <h2 className="text-xl font-bold mb-4 text-indigo-600 dark:text-indigo-300">
            📝 Resuelve
          </h2>
          <p
            className="text-lg text-gray-800 dark:text-gray-100"
            dangerouslySetInnerHTML={{
              __html: Mustache.render(finalStatement, exercise.parameters),
            }}
          />
        </div>

        {/* Input respuesta */}
        <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow space-y-4">
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none"
            placeholder="Tu respuesta…"
          />

          <button
            onClick={handleSubmit}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            Enviar
          </button>

          {feedback === "correct" && (
            <p className="text-green-600 dark:text-green-300 font-semibold">
              ✔️ ¡Correcto!
            </p>
          )}
          {feedback === "wrong" && (
            <p className="text-red-600 dark:text-red-300 font-semibold">
              ❌ Intenta de nuevo
            </p>
          )}
        </div>
      </section>

      {/* Panel lateral */}
      <aside className="lg:w-1/4 space-y-4">
        {/* Pistas */}
        <div className="bg-yellow-50 dark:bg-yellow-900 rounded-xl p-4 shadow">
          <h3 className="font-bold text-yellow-800 dark:text-yellow-200 mb-2">
            💡 Pistas
          </h3>
          {exercise.hints.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No hay pistas disponibles
            </p>
          ) : (
            <ul className="list-disc ml-4 space-y-1">
              {exercise.hints.slice(0, 1).map((h) => (
                <li key={h.id} className="text-sm">
                  {h.content}
                </li>
              ))}
            </ul>
          )}
          {/* Botón “Mostrar más pistas” quedará como TODO */}
        </div>

        {/* Progreso (simulado) */}
        <div className="bg-sky-50 dark:bg-sky-900 rounded-xl p-4 shadow">
          <p className="text-sm">
            Progreso del tema: <span className="font-bold">30 %</span>
          </p>
          <div className="h-2 bg-sky-200 dark:bg-sky-600 rounded mt-2 overflow-hidden">
            <div className="h-full bg-sky-500" style={{ width: "30%" }}></div>
          </div>
        </div>
      </aside>
    </div>
  );
}
