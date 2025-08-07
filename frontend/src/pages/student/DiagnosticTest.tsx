// src/pages/student/DiagnosticTest.tsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ExerciseResponse } from "../../types/exercise/ExerciseResponse";
import {
  getDiagnosticExercises,
  checkAnswer,
  submitExerciseAttempt,
} from "../../services/exerciseService";
import type { CheckAnswerRequest } from "../../types/exercise/CheckAnswer";
import type { ExerciseAttemptRequest } from "../../types/exercise/ExerciseAttempt";
import { showAchievementToast } from "../../utils/showAchievementToast";
import { renderStatement } from "../../utils/renderStatement";
import LoadingScreen from "../../components/LoadingScreen";
import { X } from "lucide-react";

export default function DiagnosticTest() {
  const navigate = useNavigate();
  
  const [exercises, setExercises] = useState<ExerciseResponse[]>([]);
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [checking, setChecking] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [remainingHints, setRemainingHints] = useState(3);
  const [shownHints, setShownHints] = useState<Set<string>>(new Set());
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    getDiagnosticExercises().then(setExercises);
  }, []);

  useEffect(() => {
    startTimeRef.current = Date.now();
  }, [idx]);

  if (!exercises.length) return <LoadingScreen />;

  const exercise = exercises[idx];

  const handleSubmit = async () => {
    setChecking(true);

    const {
      curriculumId,
      competencyId,
      standardId,
      learningObjectiveId,
      id: exerciseId,
    } = exercise;

    // Validar que no sean undefined
    if (
      !curriculumId ||
      !competencyId ||
      !standardId ||
      !learningObjectiveId ||
      !exerciseId
    ) {
      console.error("Faltan IDs jerárquicos en el ejercicio:", exercise);
      alert(
        "Error al procesar el ejercicio. Por favor, contacta al administrador."
      );
      setChecking(false);
      return;
    }

    try {
      const payload: CheckAnswerRequest = { studentAnswer: answer };

      const res = await checkAnswer(
        curriculumId,
        competencyId,
        standardId,
        learningObjectiveId,
        exerciseId,
        payload
      );

      setFeedback(res.correct ? "correct" : "wrong");
      setRemainingHints(res.remainingHints);

      const timeSpent = Date.now() - startTimeRef.current;
      const attemptPayload: ExerciseAttemptRequest = {
        exerciseId: exercise.id,
        correct: res.correct,
        hintsUsed: Math.max(0, exercise.hints.length - remainingHints),
        timeSpent,
        submittedAnswer: answer,
      };
      await submitExerciseAttempt(attemptPayload);

      if (res.correct) {
        showAchievementToast({
          title: "¡Correcto!",
          description: `Ganaste ${res.xpAwarded} XP 🎉`,
          icon: "⭐",
        });

        if (idx + 1 < exercises.length) {
          setTimeout(() => {
            setIdx((i) => i + 1);
            setAnswer("");
            setFeedback(null);
            setShownHints(new Set());
            setRemainingHints(3);
          }, 1000);
        }
      }
    } finally {
      setChecking(false);
    }
  };

  const handleHint = () => {
    if (remainingHints <= 0) return;
    const nextHint = exercise.hints.find((h) => !shownHints.has(h.id));
    if (nextHint) {
      setShownHints((prev) => new Set(prev).add(nextHint.id));
      setRemainingHints((n) => n - 1);
    }
  };

  return (
    <div className="relative px-4 py-6 max-w-6xl mx-auto">
      {/* ✖ Botón de salida */}
      <button
        onClick={() => navigate("/student/dashboard")}
        className="absolute top-4 left-4 text-gray-600 dark:text-gray-300 hover:text-red-500"
        title="Salir del test"
      >
        <X size={28} />
      </button>

      {/* 🔵 Barra de progreso superior */}
      <div className="flex justify-center mb-6 overflow-x-auto">
        <div className="flex gap-2 sm:gap-3">
          {exercises.map((_, i) => (
            <div
              key={i}
              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 ${
                i === idx
                  ? "bg-blue-500 border-blue-700"
                  : i < idx
                  ? "bg-green-500 border-green-700"
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
            />
          ))}
        </div>
      </div>

      {/* 🧠 Contenido central */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* 💬 Ejercicio */}
        <section className="flex-1 space-y-4">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow">
            <h2 className="text-lg font-bold text-indigo-600 dark:text-indigo-300 mb-2">
              📝 Pregunta {idx + 1}
            </h2>
            <p
              className="prose dark:prose-invert"
              dangerouslySetInnerHTML={{
                __html: renderStatement(
                  exercise.statement,
                  exercise.parameters
                ),
              }}
            />
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow space-y-4">
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
              className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg"
            >
              {checking ? "Comprobando…" : "Enviar"}
            </button>

            {feedback === "correct" && (
              <p className="text-green-600 dark:text-green-300 font-semibold animate-pulse">
                ✔️ ¡Correcto!
              </p>
            )}
            {feedback === "wrong" && (
              <p className="text-red-600 dark:text-red-300 font-semibold animate-pulse">
                ❌ Intenta de nuevo
              </p>
            )}

            {(feedback === "correct" || feedback === "wrong") &&
              idx + 1 < exercises.length && (
                <button
                  onClick={() => {
                    setIdx((i) => i + 1);
                    setAnswer("");
                    setFeedback(null);
                    setShownHints(new Set());
                    setRemainingHints(3);
                  }}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
                >
                  Siguiente →
                </button>
              )}
          </div>
        </section>

        {/* 👉 Pistas y progreso lateral */}
        <aside className="lg:w-1/4 space-y-4">
          {/* 💡 Pistas */}
          <div className="bg-yellow-50 dark:bg-yellow-900 rounded-xl p-4 shadow">
            <h3 className="font-bold text-yellow-800 dark:text-yellow-200 mb-2">
              💡 Pistas ({shownHints.size}/{exercise.hints.length})
            </h3>
            {Array.from(shownHints).map((id) => {
              const hint = exercise.hints.find((h) => h.id === id);
              return (
                <p key={id} className="text-sm mb-1">
                  {hint?.hintText}
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
        </aside>
        
      </div>
    </div>
  );
}
