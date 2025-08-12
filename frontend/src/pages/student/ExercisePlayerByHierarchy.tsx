// src/pages/student/ExercisePlayerByHierarchy.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { showToast } from "../../utils/showToast";
import { renderStatement } from "../../utils/renderStatement";

import {
  getExerciseById,
  checkAnswer,
  getExercisesByObjective as getExercises,
} from "../../services/exerciseService";

import type { ExerciseResponse } from "../../types/exercise/ExerciseResponse";
import type {
  EquationParams,
  FreqQAParams,
  FreqCompleteParams,
  StudentAnswerShape,
} from "../../types/exercise/TemplateParams";

import FreqTableQAView from "../../components/student/FreqTableQAView";
import FreqTableCompleteView from "../../components/student/FreqTableCompleteView";
import FreqTableCompleteInlineCells from "../../components/student/FreqTableCompleteInlineCells";
import LoadingScreen from "../../components/LoadingScreen";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { SingleChoiceGroup } from "../../components/student/SingleChoiceGroup";

/** ---------- Helpers: type guards sin 'any' ---------- **/

function toEquationParams(p: unknown): EquationParams | undefined {
  if (typeof p !== "object" || p === null) return undefined;
  const maybe = p as { choices?: unknown };
  return Array.isArray(maybe.choices) ? (p as EquationParams) : undefined;
}

function toFreqQAParams(p: unknown): FreqQAParams | undefined {
  if (typeof p !== "object" || p === null) return undefined;
  const o = p as {
    columns?: unknown;
    rows?: unknown;
    questions?: unknown;
  };
  if (
    Array.isArray(o.columns) &&
    Array.isArray(o.rows) &&
    Array.isArray(o.questions)
  ) {
    return p as FreqQAParams;
  }
  return undefined;
}

function toFreqCompleteParams(p: unknown): FreqCompleteParams | undefined {
  if (typeof p !== "object" || p === null) return undefined;
  const o = p as { columns?: unknown; rows?: unknown; missing?: unknown };
  if (
    Array.isArray(o.columns) &&
    Array.isArray(o.rows) &&
    Array.isArray(o.missing)
  ) {
    return p as FreqCompleteParams;
  }
  return undefined;
}

/** Flag para elegir vista de FREQUENCY_TABLE_COMPLETE */
const USE_INLINE_CELLS = true;

export default function ExercisePlayerByHierarchy() {
  const navigate = useNavigate();
  const {
    curriculumId = "",
    competencyId = "",
    standardId = "",
    learningObjectiveId = "",
    exerciseId = "",
  } = useParams<{
    curriculumId: string;
    competencyId: string;
    standardId: string;
    learningObjectiveId: string;
    exerciseId: string;
  }>();

  // Datos del ejercicio actual
  const [exercise, setExercise] = useState<ExerciseResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Lista de ejercicios del mismo objetivo (para botón "Siguiente")
  const [loExercises, setLoExercises] = useState<ExerciseResponse[]>([]);

  // Estado de respuesta del alumno
  const [choiceValue, setChoiceValue] = useState<string>("");
  const [qaAnswers, setQaAnswers] = useState<Record<string, string | number>>(
    {}
  );
  const [filledCells, setFilledCells] = useState<Record<string, number>>({});

  // Pistas / Pasos revelados
  const [revealedHints, setRevealedHints] = useState(0);
  const [revealedSteps, setRevealedSteps] = useState(0);

  // Resultado del envío
  const [result, setResult] = useState<
    | { mode: "correct"; feedback?: string; score?: number }
    | { mode: "incorrect"; feedback?: string; score?: number }
    | null
  >(null);

  // Confirmación al salir
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Cargar ejercicio + lista del objetivo
  useEffect(() => {
    let active = true;
    setLoading(true);

    Promise.all([
      getExerciseById(
        curriculumId,
        competencyId,
        standardId,
        learningObjectiveId,
        exerciseId
      ),
      getExercises(
        curriculumId,
        competencyId,
        standardId,
        learningObjectiveId,
        "active"
      ),
    ])
      .then(([ex, list]) => {
        if (!active) return;
        setExercise(ex);
        setLoExercises(list);
        // Reset de estados por si navegas entre ejercicios
        setChoiceValue("");
        setQaAnswers({});
        setFilledCells({});
        setRevealedHints(0);
        setRevealedSteps(0);
        setResult(null);
      })
      .catch(() => showToast.error("No se pudo cargar el ejercicio."))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [curriculumId, competencyId, standardId, learningObjectiveId, exerciseId]);

  const currentIndex = useMemo(() => {
    const idx = loExercises.findIndex((e) => e.id === exerciseId);
    return idx >= 0 ? idx : null;
  }, [loExercises, exerciseId]);

  const nextExerciseId = useMemo(() => {
    if (currentIndex == null) return null;
    const next = loExercises[currentIndex + 1];
    return next ? next.id : null;
  }, [currentIndex, loExercises]);

  const renderedStatement = useMemo(() => {
    if (!exercise) return "";
    try {
      return renderStatement(exercise.statement, exercise.parameters ?? {});
    } catch {
      return exercise.statement;
    }
  }, [exercise]);

  const handleSubmit = async () => {
    if (!exercise) return;

    let payload: StudentAnswerShape | null = null;

    if (exercise.templateType === "EQUATION_SINGLE_CHOICE") {
      payload = { template: "EQUATION_SINGLE_CHOICE", value: choiceValue };
    } else if (exercise.templateType === "FREQUENCY_TABLE_QA") {
      payload = { template: "FREQUENCY_TABLE_QA", answers: qaAnswers };
    } else if (exercise.templateType === "FREQUENCY_TABLE_COMPLETE") {
      payload = { template: "FREQUENCY_TABLE_COMPLETE", filled: filledCells };
    }

    if (!payload) {
      showToast.error("Este ejercicio no tiene un template soportado.");
      return;
    }

    try {
      const res = await checkAnswer(
        curriculumId,
        competencyId,
        standardId,
        learningObjectiveId,
        exercise.id,
        { answer: payload }
      );

      // ⚠️ Backend puede devolver feedback = string | null
      const fb: string | undefined =
        typeof res.feedback === "string" ? res.feedback : undefined;

      if (res.correct) {
        setResult({
          mode: "correct",
          feedback: fb,
          score: res.score ?? undefined,
        });
        showToast.success("¡Correcto! 🎉");
      } else {
        setResult({
          mode: "incorrect",
          feedback: fb,
          score: res.score ?? undefined,
        });
        showToast.info("Sigue intentando 😉");
      }
    } catch {
      showToast.error("No se pudo evaluar tu respuesta.");
    }
  };

  const handleShowHint = () => {
    if (!exercise?.hints?.length) return;
    setRevealedHints((n) => Math.min(n + 1, exercise.hints.length));
  };

  const handleShowStep = () => {
    if (!exercise?.solutionSteps?.length) return;
    setRevealedSteps((n) => Math.min(n + 1, exercise.solutionSteps.length));
  };

  const handleExit = () => setShowExitConfirm(true);
  const confirmExit = () => {
    setShowExitConfirm(false);
    navigate(`/student/roadmap/${curriculumId}`);
  };

  if (loading || !exercise) return <LoadingScreen />;

  // Params tipados (sin 'any' ni doble cast forzado)
  const eqParams = toEquationParams(exercise.parameters);
  const qaParams = toFreqQAParams(exercise.parameters);
  const fcParams = toFreqCompleteParams(exercise.parameters);

  return (
    <div className="min-h-screen bg-transparent pb-16">
      {/* Header fijo */}
      <div className="sticky top-0 z-10 ">
        <div className="mx-auto flex max-w-screen-lg items-center justify-between px-4 py-3">
          <button
            onClick={handleExit}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-100 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
          >
            ← Volver
          </button>

          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={handleShowHint}
              disabled={
                !exercise.hints?.length ||
                revealedHints >= (exercise.hints?.length ?? 0)
              }
              className="rounded-md bg-amber-500 px-3 py-1.5 text-white hover:bg-amber-600 disabled:opacity-50"
            >
              Mostrar pista ({revealedHints}/{exercise.hints?.length ?? 0})
            </button>
            <button
              onClick={handleShowStep}
              disabled={
                !exercise.solutionSteps?.length ||
                revealedSteps >= (exercise.solutionSteps?.length ?? 0)
              }
              className="rounded-md bg-indigo-600 px-3 py-1.5 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              Mostrar paso ({revealedSteps}/
              {exercise.solutionSteps?.length ?? 0})
            </button>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="mx-auto max-w-screen-lg px-4 pt-6">
        {/* Enunciado */}
        <div className="mx-auto max-w-[720px]">
          <div className="mb-3 text-xs uppercase text-gray-500 dark:text-gray-400">
            Dificultad: {exercise.difficulty}
          </div>
          <div className="mb-6 rounded-lg border bg-white p-4 text-base leading-relaxed dark:border-gray-800 dark:bg-gray-800 dark:text-gray-100">
            {renderedStatement}
          </div>
        </div>

        {/* Pistas reveladas */}
        {revealedHints > 0 && exercise.hints?.length ? (
          <div className="mx-auto mb-6 max-w-[720px] space-y-2">
            {exercise.hints.slice(0, revealedHints).map((h) => (
              <div
                key={h.id}
                className="rounded-md border-l-4 border-amber-500 bg-amber-50 p-3 text-sm dark:border-amber-400 dark:bg-amber-900/20 dark:text-amber-100"
              >
                💡 {h.hintText}
              </div>
            ))}
          </div>
        ) : null}

        {/* Pasos revelados */}
        {revealedSteps > 0 && exercise.solutionSteps?.length ? (
          <div className="mx-auto mb-6 max-w-[720px] space-y-2">
            {exercise.solutionSteps
              .slice(0, revealedSteps)
              .sort((a, b) => a.stepNumber - b.stepNumber)
              .map((s) => (
                <div
                  key={s.id}
                  className="rounded-md border-l-4 border-indigo-600 bg-indigo-50 p-3 text-sm dark:border-indigo-500 dark:bg-indigo-900/20 dark:text-indigo-100"
                >
                  <div className="mb-1 font-semibold">Paso {s.stepNumber}</div>
                  <div>{s.explanation}</div>
                </div>
              ))}
          </div>
        ) : null}

        {/* Vista según plantilla */}
        <div className="mx-auto max-w-[720px] space-y-6">
          {exercise.templateType === "EQUATION_SINGLE_CHOICE" && eqParams && (
            <div className="rounded-lg border bg-white p-4 dark:border-gray-800 dark:bg-gray-800">
              <SingleChoiceGroup
                name="eq-choice"
                options={eqParams.choices ?? []}
                value={choiceValue}
                onChange={setChoiceValue}
              />
            </div>
          )}

          {exercise.templateType === "FREQUENCY_TABLE_QA" && qaParams && (
            <FreqTableQAView
              params={qaParams}
              value={qaAnswers}
              onChange={setQaAnswers}
            />
          )}

          {exercise.templateType === "FREQUENCY_TABLE_COMPLETE" &&
            fcParams &&
            (USE_INLINE_CELLS ? (
              <FreqTableCompleteInlineCells
                params={fcParams}
                value={filledCells}
                onChange={setFilledCells}
              />
            ) : (
              <FreqTableCompleteView
                params={fcParams}
                value={filledCells}
                onChange={setFilledCells}
              />
            ))}

          {/* Acciones */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {currentIndex != null && loExercises.length > 0
                ? `Ejercicio ${currentIndex + 1} de ${loExercises.length}`
                : null}
            </div>
            <button
              onClick={handleSubmit}
              className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              Enviar respuesta
            </button>
          </div>

          {/* Banner de resultado */}
          {result && (
            <div
              className={`mt-4 rounded-lg border p-4 ${
                result.mode === "correct"
                  ? "border-emerald-600 bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-900/20"
                  : "border-red-600 bg-red-50 dark:border-red-500 dark:bg-red-900/20"
              }`}
            >
              <div className="mb-2 font-semibold">
                {result.mode === "correct"
                  ? "¡Respuesta correcta!"
                  : "Respuesta incorrecta"}
              </div>
              {result.feedback && (
                <div className="mb-3 text-sm opacity-90">{result.feedback}</div>
              )}
              <div className="flex flex-wrap gap-2">
                {result.mode === "correct" ? (
                  <>
                    {nextExerciseId ? (
                      <button
                        onClick={() =>
                          navigate(
                            `/student/exercises/${curriculumId}/${competencyId}/${standardId}/${learningObjectiveId}/${nextExerciseId}`
                          )
                        }
                        className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
                      >
                        Siguiente ejercicio →
                      </button>
                    ) : null}
                    <button
                      onClick={() =>
                        navigate(`/student/roadmap/${curriculumId}`)
                      }
                      className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-100 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
                    >
                      Salir
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setResult(null)}
                      className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
                    >
                      Intentar de nuevo
                    </button>
                    <button
                      onClick={handleShowHint}
                      className="rounded-md bg-amber-500 px-3 py-1.5 text-sm text-white hover:bg-amber-600 disabled:opacity-50"
                      disabled={
                        !exercise.hints?.length ||
                        revealedHints >= (exercise.hints?.length ?? 0)
                      }
                    >
                      Usar pista
                    </button>
                    <button
                      onClick={handleShowStep}
                      className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
                      disabled={
                        !exercise.solutionSteps?.length ||
                        revealedSteps >= (exercise.solutionSteps?.length ?? 0)
                      }
                    >
                      Ver un paso
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmación al salir (tu ConfirmModal usa isOpen/onClose) */}
      <ConfirmModal
        isOpen={showExitConfirm}
        onClose={() => setShowExitConfirm(false)}
        onConfirm={confirmExit}
        title="¿Seguro que quieres salir?"
        description="Perderás tu progreso no enviado en este ejercicio."
        variant="warning"
      />
    </div>
  );
}
