import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { showToast } from "../../utils/showToast";
import { renderStatement } from "../../utils/renderStatement";

import {
  getExerciseById,
  getExercisesByObjective as getExercises,
} from "../../services/exerciseService";

import type { ExerciseResponse } from "../../types/exercise/ExerciseResponse";
import type {
  EquationParams,
  FreqQAParams,
  FreqCompleteParams,
} from "../../types/exercise/TemplateParams";

import FreqTableQAView from "../../components/student/FreqTableQAView";
import FreqTableCompleteView from "../../components/student/FreqTableCompleteView";
import FreqTableCompleteInlineCells from "../../components/student/FreqTableCompleteInlineCells";
import LoadingScreen from "../../components/LoadingScreen";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { SingleChoiceGroup } from "../../components/student/SingleChoiceGroup";
import WhiteboardFloatingPanel from "../../components/student/WhiteboardFloatingPanel";
import { useAttemptMutation } from "../../hooks/progress/useAttemptMutation";
import { showAchievementToast } from "../../utils/showAchievementToast";

/* ============================================================
   Helpers de tipado/normalización (sin any)
   ============================================================ */

/** Asegura EquationParams si tiene choices en array */
function toEquationParams(p: unknown): EquationParams | undefined {
  if (typeof p !== "object" || p === null) return undefined;
  const maybe = p as { choices?: unknown };
  return Array.isArray(maybe.choices) ? (p as EquationParams) : undefined;
}

/** Asegura FreqQAParams si trae columns/rows/questions en array */
function toFreqQAParams(p: unknown): FreqQAParams | undefined {
  if (typeof p !== "object" || p === null) return undefined;
  const o = p as { columns?: unknown; rows?: unknown; questions?: unknown };
  if (
    Array.isArray(o.columns) &&
    Array.isArray(o.rows) &&
    Array.isArray(o.questions)
  ) {
    return p as FreqQAParams;
  }
  return undefined;
}

/** Asegura FreqCompleteParams si trae columns/rows/missing en array */
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

/**
 * Algunos bancos de ejercicios devuelven 'missing' como objetos.
 * Este helper extrae una clave legible (key/id/cell/label/name) o string/number directo.
 */
function missingKeyToString(m: unknown): string | null {
  if (typeof m === "string" || typeof m === "number") return String(m);
  if (m && typeof m === "object") {
    const o = m as Record<string, unknown>;
    for (const cand of ["key", "id", "cell", "label", "name"]) {
      const v = o[cand];
      if (typeof v === "string" && v.trim()) return v;
    }
  }
  return null;
}

/** Normaliza claves: lower, sin espacios/":-_"  */
const normalizeKey = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[:\s\-_]+/g, "");

/** Vista para FREQUENCY_TABLE_COMPLETE (inline o tabla tradicional) */
const USE_INLINE_CELLS = true;

/* ============================================================
   Componente principal
   ============================================================ */
export default function ExercisePlayerByHierarchy() {
  const navigate = useNavigate();
  const [wbOpen, setWbOpen] = useState(false);

  // Rutas (jerarquía) + ejercicio
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

  /* --------------------------------------------
     Estados generales
     -------------------------------------------- */
  const [exercise, setExercise] = useState<ExerciseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loExercises, setLoExercises] = useState<ExerciseResponse[]>([]);

  /* --------------------------------------------
     Estados de respuesta del alumno
     -------------------------------------------- */
  const [choiceValue, setChoiceValue] = useState<string>("");
  const [qaAnswers, setQaAnswers] = useState<Record<string, string | number>>(
    {}
  );
  // IMPORTANTE: mantenemos el mapa numérico para COMPLETE
  const [filledCells, setFilledCells] = useState<Record<string, number>>({});

  /* --------------------------------------------
     Pistas / Pasos revelados
     -------------------------------------------- */
  const [revealedHints, setRevealedHints] = useState(0);
  const [revealedSteps, setRevealedSteps] = useState(0);

  /* --------------------------------------------
     Mutación de intento y medición básica
     -------------------------------------------- */
  const attemptMutation = useAttemptMutation();
  const [startedAt, setStartedAt] = useState<number>(() => Date.now());

  /* --------------------------------------------
     Resultado del intento (para banner)
     -------------------------------------------- */
  const [result, setResult] = useState<{
    mode: "correct" | "incorrect";
    feedback?: string;
    score?: number;
    sop?: {
      learningObjectiveId?: string;
      attemptsCount?: number | null;
      correctCount?: number | null;
      streakCorrect?: number | null;
      accuracy?: number | null; // 0..1
      status?: string | null;
      masteryLevel?: string | null;
    };
    updatedStreak?: { current: number; longest: number; lastUpdated?: string };
  } | null>(null);

  /* --------------------------------------------
     Confirmación al salir sin enviar
     -------------------------------------------- */
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  /* ============================================================
     Carga de ejercicio + lista del mismo OA
     ============================================================ */
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

        // Reset de estados al cambiar de ejercicio
        setChoiceValue("");
        setQaAnswers({});
        setFilledCells({});
        setRevealedHints(0);
        setRevealedSteps(0);
        setResult(null);

        // Reinicia cronómetro
        setStartedAt(Date.now());
      })
      .catch(() => showToast.error("No se pudo cargar el ejercicio."))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [curriculumId, competencyId, standardId, learningObjectiveId, exerciseId]);

  /* ============================================================
     Derivados de estado (índice y siguiente ejercicio)
     ============================================================ */
  const currentIndex = useMemo(() => {
    const idx = loExercises.findIndex((e) => e.id === exerciseId);
    return idx >= 0 ? idx : null;
  }, [loExercises, exerciseId]);

  const nextExerciseId = useMemo(() => {
    if (currentIndex == null) return null;
    const next = loExercises[currentIndex + 1];
    return next ? next.id : null;
  }, [currentIndex, loExercises]);

  /* ============================================================
     Enunciado renderizado (plantilla -> texto)
     ============================================================ */
  const renderedStatement = useMemo(() => {
    if (!exercise) return "";
    try {
      return renderStatement(exercise.statement, exercise.parameters ?? {});
    } catch {
      return exercise.statement;
    }
  }, [exercise]);

  /* ============================================================
     Estado del botón Enviar (v4/v5 React Query)
     ============================================================ */
  type MutationStateLike = { isPending?: boolean; isLoading?: boolean };
  const mu = attemptMutation as unknown as MutationStateLike;
  const isSubmitting = Boolean(mu.isPending ?? mu.isLoading ?? false);

  const retry = () => {
    setResult(null);
    setStartedAt(Date.now());
  };

  /* ============================================================
     Params tipados por plantilla (sin any)
     ============================================================ */
  const eqParams = toEquationParams(exercise?.parameters);
  const qaParams = toFreqQAParams(exercise?.parameters);
  const fcParams = toFreqCompleteParams(exercise?.parameters);

  /* ============================================================
     Derivados para validación: QA y COMPLETE
     ============================================================ */

  // IDs de las preguntas QA (si existen)
  const qaQuestionIds = useMemo(
    () => qaParams?.questions?.map((q) => q.id) ?? [],
    [qaParams?.questions]
  );

  // Extrae claves en claro desde 'missing' (puede venir con objetos)
  const rawMissingKeys = useMemo(() => {
    if (!fcParams?.missing) return [];
    const out: string[] = [];
    for (const m of fcParams.missing as unknown[]) {
      const k = missingKeyToString(m);
      if (k) out.push(k);
    }
    return out;
  }, [fcParams?.missing]);

  // Normaliza claves que el usuario completa
  const normalizedFilled = useMemo(() => {
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(filledCells)) {
      out[normalizeKey(k)] = v;
    }
    return out;
  }, [filledCells]);

  // Normaliza claves faltantes declaradas en params
  const normalizedMissing = useMemo(
    () => rawMissingKeys.map((k) => normalizeKey(k)),
    [rawMissingKeys]
  );

  /* ============================================================
     Validación: ¿se puede enviar?
     ============================================================ */
  const isAnswerValid = useMemo<boolean>(() => {
    const tpl = exercise?.templateType;
    if (!tpl) return false;

    // Opción única
    if (tpl === "EQUATION_SINGLE_CHOICE") {
      return typeof choiceValue === "string" && choiceValue.trim().length > 0;
    }

    // QA: todas las preguntas deben tener respuesta (si las conocemos)
    if (tpl === "FREQUENCY_TABLE_QA") {
      if (qaQuestionIds.length) {
        return qaQuestionIds.every((id) => {
          const v = qaAnswers[id];
          return v !== "" && v !== null && v !== undefined;
        });
      }
      return Object.keys(qaAnswers).length > 0;
    }

    // COMPLETE: si hay "missing" declarado, TODAS esas celdas deben ser numéricas
    if (tpl === "FREQUENCY_TABLE_COMPLETE") {
      if (normalizedMissing.length) {
        return normalizedMissing.every((k) =>
          Number.isFinite(normalizedFilled[k])
        );
      }
      // Si no hay "missing" declarado, alcanza con que al menos 1 celda sea numérica
      return Object.values(normalizedFilled).some((v) => Number.isFinite(v));
    }

    return false;
  }, [
    exercise?.templateType,
    qaQuestionIds,
    normalizedMissing,
    normalizedFilled,
    choiceValue,
    qaAnswers,
  ]);

  /* ============================================================
     Envío del intento
     ============================================================ */
  const handleSubmit = async () => {
    if (!exercise || isSubmitting) return; // evita doble click

    // 1) Construir el payload "answer" según plantilla
    let answer: Record<string, unknown> | null = null;

    if (exercise.templateType === "EQUATION_SINGLE_CHOICE") {
      answer = { template: "EQUATION_SINGLE_CHOICE", value: choiceValue };
    } else if (exercise.templateType === "FREQUENCY_TABLE_QA") {
      answer = { template: "FREQUENCY_TABLE_QA", answers: qaAnswers };
    } else if (exercise.templateType === "FREQUENCY_TABLE_COMPLETE") {
      // Robusto: convertimos cualquier string numerizable a número
      const normalized: Record<string, number> = {};
      for (const [k, v] of Object.entries(filledCells)) {
        const n =
          typeof v === "number"
            ? v
            : Number(String(v).replace(",", ".").trim());
        if (Number.isFinite(n)) normalized[k] = n;
      }
      answer = { template: "FREQUENCY_TABLE_COMPLETE", filled: normalized };
    }

    if (!answer) {
      showToast.error("Este ejercicio no tiene un template soportado.");
      return;
    }

    // 2) Metadatos: duración y sessionId (para agrupar analítica)
    const durationMs = Math.max(0, Date.now() - startedAt);
    const sessionId = `practice:${curriculumId}:${learningObjectiveId}`;

    try {
      // 3) Enviar intento al progress-service
      const res = await attemptMutation.mutateAsync({
        curriculumId,
        learningObjectiveId,
        exerciseId: exercise.id,
        templateType: exercise.templateType,
        difficulty: exercise.difficulty,
        answer,
        hintsUsed: revealedHints,
        durationMs,
        sessionId,
        source: "PRACTICE",
      });

      // 4) Feedback “amigable”
      const fb =
        typeof res.feedback === "string"
          ? res.feedback.trim() || undefined
          : extractFeedbackText(res.feedback);

      // Telemetría dev (solo en desarrollo)
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.debug("[attempt]", {
          attemptId: res.attemptId,
          score: res.score,
          durationMs,
          sop: res.sop,
        });
        if (exercise.templateType === "FREQUENCY_TABLE_COMPLETE") {
          // eslint-disable-next-line no-console
          console.debug("[FC debug]", {
            missing_raw: fcParams?.missing,
            rawMissingKeys,
            normalizedMissing,
            filledCells,
            normalizedFilled,
          });
        }
      }

      // 5) Render del banner + toasts
      if (res.correct) {
        setResult({
          mode: "correct",
          feedback: fb,
          score: typeof res.score === "number" ? res.score : undefined,
          sop: res.sop,
          updatedStreak: res.updatedStreak,
        });
        showToast.success(fb ?? "¡Correcto! 🎉");

        // Logros desbloqueados (si vienen)
        res.awardedAchievements?.forEach((a) => {
          showAchievementToast({
            title: a.name,
            description: a.description ?? "¡Nuevo logro desbloqueado!",
            icon: "🏅",
          });
        });
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
      // 503 ya lo notifica el interceptor; fallback
      showToast.error("No pudimos evaluar ahora. Intenta de nuevo.");
    }
  };

  /* ============================================================
     Acciones varias (pistas, pasos, salir)
     ============================================================ */
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

  /* ============================================================
     Loading
     ============================================================ */
  if (loading || !exercise) return <LoadingScreen />;

  /* ============================================================
     Utilidad: formatear precisión SOP
     ============================================================ */
  const formatAccuracy = (acc?: number | null) =>
    typeof acc === "number" && acc >= 0 ? `${Math.round(acc * 100)}%` : "—";

  /* ============================================================
     Render
     ============================================================ */
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

        {/* Vistas por plantilla */}
        <div className="mx-auto max-w-[720px] space-y-6" aria-live="polite">
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
              disabled={isSubmitting || !isAnswerValid}
              aria-busy={isSubmitting}
              className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-60"
            >
              {isSubmitting ? "Enviando..." : "Enviar respuesta"}
            </button>
          </div>

          {/* Banner de resultado + SOP */}
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

              {/* Feedback */}
              {result.feedback && (
                <div className="mb-3 text-sm opacity-90">{result.feedback}</div>
              )}

              {/* Mini resumen SOP (si viene) */}
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

      {/* Confirmación al salir */}
      <ConfirmModal
        isOpen={showExitConfirm}
        onClose={() => setShowExitConfirm(false)}
        onConfirm={confirmExit}
        title="¿Seguro que quieres salir?"
        description="Perderás tu progreso no enviado en este ejercicio."
        variant="warning"
      />

      {/* Pizarra flotante (persistente por ejercicio) */}
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

/* ============================================================
   Serializador de feedback genérico
   ============================================================ */
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
