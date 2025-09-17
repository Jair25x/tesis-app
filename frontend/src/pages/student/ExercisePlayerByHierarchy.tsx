import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { showToast } from "../../utils/showToast";
import { renderStatement } from "../../utils/renderStatement";
import { takeRecoAttribution } from "../../utils/recoAttribution";

import {
  getExerciseById,
  getExercisesByObjective as getExercises,
} from "../../services/exerciseService";

import type { ExerciseResponse } from "../../types/exercise/ExerciseResponse";

import LoadingScreen from "../../components/LoadingScreen";
import ConfirmModal from "../../components/ui/ConfirmModal";
import WhiteboardFloatingPanel from "../../components/student/WhiteboardFloatingPanel";
import { useAttemptMutation } from "../../hooks/progress/useAttemptMutation";
import {
  showAchievementToast,
  dismissAllAchievementToasts,
} from "../../utils/showAchievementToast";

/** Adapters de runtime (player de práctica) */
import { runtimeRegistry } from "../../features/exercises/runtime/registry";

export default function ExercisePlayerByHierarchy() {
  const navigate = useNavigate();
  const [wbOpen, setWbOpen] = useState(false);

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

  // Al desmontar (salir del player), cerramos toasts pendientes de logros
  useEffect(() => {
    return () => {
      dismissAllAchievementToasts();
    };
  }, []);

  const [recoAttr] = useState(() => takeRecoAttribution(exerciseId));
  const [exercise, setExercise] = useState<ExerciseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loExercises, setLoExercises] = useState<ExerciseResponse[]>([]);

  // Valor genérico controlado por el adapter
  const [value, setValue] = useState<unknown>(null);

  const [revealedHints, setRevealedHints] = useState(0);
  const [revealedSteps, setRevealedSteps] = useState(0);

  const attemptMutation = useAttemptMutation();
  // Mutations en React Query v4 -> usar isPending (no existe isLoading)
  const isSubmitting = attemptMutation.isPending === true;

  const [startedAt, setStartedAt] = useState<number>(() => Date.now());

  const [result, setResult] = useState<{
    mode: "correct" | "incorrect";
    feedback?: string;
    score?: number;
    sop?: {
      learningObjectiveId?: string;
      attemptsCount?: number | null;
      correctCount?: number | null;
      streakCorrect?: number | null;
      accuracy?: number | null;
      status?: string | null;
      masteryLevel?: string | null;
    };
    updatedStreak?: { current: number; longest: number; lastUpdated?: string };
  } | null>(null);

  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Clave sintética para runtime (cumple con la firma común del Core)
  const practiceKey = useMemo(
    () =>
      `practice:${curriculumId}:${learningObjectiveId}:${
        exercise?.id ?? "pending"
      }`,
    [curriculumId, learningObjectiveId, exercise?.id]
  );

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

        // Reset UI state por ejercicio
        setRevealedHints(0);
        setRevealedSteps(0);
        setResult(null);
        setStartedAt(Date.now());

        // Inicializa el valor del adapter (si existe)
        const mod =
          runtimeRegistry[ex.templateType as keyof typeof runtimeRegistry];
        if (mod) {
          const params = mod.guard(ex.parameters);
          if (params) {
            setValue(mod.read(undefined)); // valor inicial limpio
          } else {
            setValue(null); // parámetros mal formados
          }
        } else {
          setValue(null); // plantilla no soportada
        }
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

  const retry = () => {
    setResult(null);
    setStartedAt(Date.now());
  };

  const moduleForTpl = useMemo(() => {
    if (!exercise) return null;
    const mod =
      runtimeRegistry[exercise.templateType as keyof typeof runtimeRegistry];
    return mod ?? null;
  }, [exercise]);

  const paramsForTpl = useMemo(() => {
    if (!exercise || !moduleForTpl) return null;
    return moduleForTpl.guard(exercise.parameters);
  }, [exercise, moduleForTpl]);

  const isAnswerValid = useMemo(() => {
    if (!moduleForTpl || !paramsForTpl) return false;
    if (typeof moduleForTpl.isValid === "function") {
      return moduleForTpl.isValid(value as never, paramsForTpl as never);
    }
    return value != null;
  }, [moduleForTpl, paramsForTpl, value]);

  const handleSubmit = async () => {
    if (!exercise || isSubmitting || !moduleForTpl || !paramsForTpl) return;

    const answer = moduleForTpl.write(value as never);
    if (!answer || typeof answer !== "object") {
      showToast.error("Este ejercicio no tiene un template soportado.");
      return;
    }

    const durationMs = Math.max(0, Date.now() - startedAt);
    const sessionId = `practice:${curriculumId}:${learningObjectiveId}`;

    try {
      const res = await attemptMutation.mutateAsync({
        curriculumId,
        learningObjectiveId,
        exerciseId: exercise.id,
        templateType: exercise.templateType,
        difficulty: exercise.difficulty,
        answer,
        hintsUsed: exercise.examMode ? 0 : revealedHints,
        durationMs,
        sessionId,
        source: "PRACTICE",
        sourceRefId: recoAttr?.sourceRefId,
      });

      const fb =
        typeof res.feedback === "string"
          ? res.feedback.trim() || undefined
          : extractFeedbackText(res.feedback);

      if (res.correct) {
        setResult({
          mode: "correct",
          feedback: fb,
          score: typeof res.score === "number" ? res.score : undefined,
          sop: res.sop,
          updatedStreak: res.updatedStreak,
        });
        showToast.success(fb ?? "¡Correcto! 🎉");

        // 👇 Logros sólo en práctica (no en examen)
        if (!exercise.examMode) {
          res.awardedAchievements?.forEach((a) => {
            showAchievementToast({
              title: a.name,
              description: a.description ?? "¡Nuevo logro desbloqueado!",
              icon: "🏅",
            });
          });
        }
      } else {
        setResult({
          mode: "incorrect",
          feedback: fb,
          score: typeof res.score === "number" ? res.score : undefined,
          sop: res.sop,
          updatedStreak: res.updatedStreak,
        });
        showToast.info(fb ?? "Sigue intentando 😉");
      }
    } catch {
      showToast.error("No pudimos evaluar ahora. Intenta de nuevo.");
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

  const formatAccuracy = (acc?: number | null) =>
    typeof acc === "number" && acc >= 0 ? `${Math.round(acc * 100)}%` : "—";

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

          <button
            onClick={() => setWbOpen(true)}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-100 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
          >
            ✏️ Pizarra
          </button>

          {/* Pistas/pasos solo si NO es examMode */}
          {!exercise.examMode && (
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
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="mx-auto max-w-screen-lg px-4 pt-6">
        <div className="mx-auto max-w-[720px]">
          <div className="mb-3 text-xs uppercase text-gray-500 dark:text-gray-400">
            Dificultad: {exercise.difficulty}
          </div>
          <div className="mb-6 rounded-lg border bg-white p-4 text-base leading-relaxed dark:border-gray-800 dark:bg-gray-800 dark:text-gray-100">
            {renderedStatement}
          </div>
        </div>

        {/* Pistas reveladas (solo práctica) */}
        {!exercise.examMode && revealedHints > 0 && exercise.hints?.length ? (
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

        {/* Pasos revelados (solo práctica) */}
        {!exercise.examMode &&
        revealedSteps > 0 &&
        exercise.solutionSteps?.length ? (
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

        {/* Render del adapter por plantilla */}
        <div className="mx-auto max-w-[720px] space-y-6" aria-live="polite">
          {!moduleForTpl || !paramsForTpl ? (
            <div className="rounded-md border p-4 text-sm dark:border-gray-700">
              Plantilla no soportada todavía ({exercise.templateType}).
            </div>
          ) : (
            moduleForTpl.Render({
              params: paramsForTpl as never,
              value: value as never,
              onChange: (next: unknown) => setValue(next),
              submissionItemId: practiceKey, // 👈 requerido por CoreModule
              // statementHtml: undefined, // opcional en práctica
            })
          )}

          {/* Acciones */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {currentIndex != null && loExercises.length > 0
                ? `Ejercicio ${currentIndex + 1} de ${loExercises.length}`
                : null}
            </div>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !isAnswerValid}
              aria-busy={isSubmitting}
              className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-60"
            >
              {isSubmitting ? "Enviando..." : "Enviar respuesta"}
            </button>
          </div>

          {/* Banner resultado */}
          {result && (
            <div
              className={`mt-4 rounded-lg border p-4 ${
                result.mode === "correct"
                  ? "border-emerald-600 bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-900/20"
                  : "border-red-600 bg-red-50 dark:border-red-500 dark:bg-red-900/20"
              }`}
              role="status"
              aria-live="polite"
            >
              <div className="mb-2 font-semibold">
                {result.mode === "correct"
                  ? "¡Respuesta correcta!"
                  : "Respuesta incorrecta"}
              </div>

              {result.feedback && (
                <div className="mb-3 text-sm opacity-90">{result.feedback}</div>
              )}

              {result.sop ? (
                <div className="mb-3 text-xs text-gray-700 dark:text-gray-200">
                  <span className="mr-3">
                    Precisión:{" "}
                    <strong>{formatAccuracy(result.sop.accuracy)}</strong>
                  </span>
                  {result.sop.status ? (
                    <span className="mr-3">
                      Estado: <strong>{result.sop.status}</strong>
                    </span>
                  ) : null}
                  {typeof result.sop.streakCorrect === "number" ? (
                    <span>
                      Racha OA: <strong>{result.sop.streakCorrect}</strong>
                    </span>
                  ) : null}
                </div>
              ) : null}

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
                      onClick={retry}
                      className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
                    >
                      Intentar de nuevo
                    </button>
                    {!exercise.examMode && (
                      <>
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
                            revealedSteps >=
                              (exercise.solutionSteps?.length ?? 0)
                          }
                        >
                          Ver un paso
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmación al salir */}
      <ConfirmModal
        isOpen={showExitConfirm}
        onClose={() => setShowExitConfirm(false)}
        onConfirm={confirmExit}
        title="¿Seguro que quieres salir?"
        description="Perderás tu progreso no enviado en este ejercicio."
        variant="warning"
      />

      <WhiteboardFloatingPanel
        isOpen={wbOpen}
        onClose={() => setWbOpen(false)}
        storageKey={`wb:${curriculumId}:${learningObjectiveId}:${
          exercise?.id ?? "unk"
        }`}
      />
    </div>
  );
}

/* ===== Serializador de feedback genérico ===== */
function extractFeedbackText(fb: unknown): string | undefined {
  if (!fb || typeof fb !== "object") return undefined;
  const obj = fb as Record<string, unknown>;
  const candidateKeys = ["message", "msg", "text", "reason", "detail"];
  for (const k of candidateKeys) {
    const v = obj[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  try {
    return JSON.stringify(obj);
  } catch {
    return undefined;
  }
}
