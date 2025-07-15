import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getExercisesByObjective,
  checkAnswer,
} from "../../services/exerciseService";
import type {
  ExerciseResponse,
  CheckAnswerRequest,
} from "../../types/ExerciseResponse";
import LoadingScreen from "../../components/LoadingScreen";
import { showAchievementToast } from "../../utils/showAchievementToast";
import { renderStatement } from "../../utils/renderStatement";

export default function Practice() {
  /* IDs en la URL (los 4 niveles) */
  const { curriculumId, competencyId, standardId, learningObjectiveId } =
    useParams<{
      curriculumId: string;
      competencyId: string;
      standardId: string;
      learningObjectiveId: string;
    }>();

  const [exercises, setExercises] = useState<ExerciseResponse[]>([]);
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [checking, setChecking] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [remainingHints, setRemainingHints] = useState(3);
  const [shownHints, setShownHints] = useState<Set<string>>(new Set());

  /* carga inicial */
  useEffect(() => {
    (async () => {
      if (!curriculumId) return;
      const list = await getExercisesByObjective(
        curriculumId,
        competencyId!,
        standardId!,
        learningObjectiveId!
      );
      setExercises(list);
    })();
  }, [curriculumId]);

  if (!exercises.length) return <LoadingScreen />;

  const exercise = exercises[idx];

  /* ---------- envío de respuesta ---------- */
  const handleSubmit = async () => {
    setChecking(true);
    try {
      const payload: CheckAnswerRequest = { studentAnswer: answer };
      const res = await checkAnswer(
        curriculumId!,
        competencyId!,
        standardId!,
        learningObjectiveId!,
        exercise.id,
        payload
      );

      setFeedback(res.correct ? "correct" : "wrong");
      setRemainingHints(res.remainingHints);

      if (res.correct) {
        showAchievementToast({
          title: "¡Respuesta correcta!",
          description: `Ganaste ${res.xpAwarded} XP 🥳`,
          icon: "🎉",
        });
        /* carga siguiente o fin */
        if (idx + 1 < exercises.length) {
          setTimeout(() => {
            setIdx((i) => i + 1);
            setAnswer("");
            setFeedback(null);
          }, 1200);
        }
      }
    } finally {
      setChecking(false);
    }
  };

  /* ---------- pedir pista ---------- */

  const handleHint = () => {
    if (remainingHints <= 0) return;
    const nextHint = exercise.hints.find((h) => !shownHints.has(h.id));
    if (nextHint) {
      setShownHints(new Set(shownHints).add(nextHint.id));
      setRemainingHints((n) => n - 1);
    }
  };

  return (
    <div className="p-4 flex flex-col lg:flex-row gap-6">
      {/* ------------ Zona principal ------------- */}
      <section className="flex-1 space-y-4">
        {/* Enunciado */}
        <div className="rounded-xl bg-white dark:bg-slate-800 p-6 shadow">
          <h2 className="text-xl font-bold mb-4 text-indigo-600 dark:text-indigo-300">
            📝 Resuelve
          </h2>
          <p
            className="prose dark:prose-invert"
            dangerouslySetInnerHTML={{
              __html: renderStatement(exercise.statement, exercise.parameters),
            }}
          />
        </div>

        {/* Respuesta */}
        <div className="rounded-xl bg-white dark:bg-slate-800 p-6 shadow space-y-4">
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={checking}
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none"
            placeholder="Tu respuesta…"
          />

          <button
            onClick={handleSubmit}
            disabled={checking}
            className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            {checking ? "Comprobando…" : "Enviar"}
          </button>

          {feedback === "correct" && (
            <p className="text-green-600 dark:text-green-300 font-semibold transition-opacity animate-pulse">
              ✔️ ¡Correcto!
            </p>
          )}
          {feedback === "wrong" && (
            <p className="text-red-600 dark:text-red-300 font-semibold transition-opacity animate-pulse">
              ❌ Intenta de nuevo
            </p>
          )}
        </div>
      </section>

      {/* ------------ Panel lateral ------------- */}
      <aside className="lg:w-1/4 space-y-4">
        {/* Pistas */}
        <div className="bg-yellow-50 dark:bg-yellow-900 rounded-xl p-4 shadow">
          <h3 className="font-bold text-yellow-800 dark:text-yellow-200 mb-2">
            💡 Pistas ({shownHints.size}/{exercise.hints.length})
          </h3>

          {Array.from(shownHints).map((id) => {
            const h = exercise.hints.find((x) => x.id === id)!;
            return (
              <p key={id} className="text-sm mb-1">
                {h.hintText}
              </p>
            );
          })}

          <button
            onClick={handleHint}
            disabled={shownHints.size >= exercise.hints.length}
            className="mt-2 text-xs bg-yellow-600 hover:bg-yellow-700 text-white py-1 px-2 rounded disabled:opacity-40"
          >
            Mostrar otra pista
          </button>
        </div>

        {/* Progreso simple */}
        <div className="bg-sky-50 dark:bg-sky-900 rounded-xl p-4 shadow">
          <p className="text-sm">
            Ejercicio {idx + 1} de {exercises.length}
          </p>
          <div className="h-2 bg-sky-200 dark:bg-sky-600 rounded mt-2 overflow-hidden">
            <div
              className="h-full bg-sky-500 transition-all"
              style={{ width: `${((idx + 1) / exercises.length) * 100}%` }}
            />
          </div>
        </div>
      </aside>
    </div>
  );
}
