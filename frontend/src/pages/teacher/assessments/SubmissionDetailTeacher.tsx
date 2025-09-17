// src/pages/teacher/assessments/SubmissionDetailTeacher.tsx
import { useEffect, useMemo, useRef, useState, type JSX } from "react";
import { Link, useParams } from "react-router-dom";
import {
  useSubmissionDetailTeacher,
  useGradeItem,
  type GradeItemBody,
} from "../../../hooks/assessments/useAssignments";
import type { SubmissionDetailItem } from "../../../types/assessments/submissions";
import { registry } from "../../../features/assessments/exam/registry";
import type { TemplateType } from "../../../types/exercise/TemplateSchemaResponse";
import { getExerciseForExam } from "../../../services/exerciseService";

/* ─────────────────────────────────────────────── */
type ManualDraft = {
  score: number | "";
  correct: boolean;
  feedback: string;
};

type ExamExerciseLite = {
  id: string;
  templateType: TemplateType;
  parameters: unknown;
  statementRendered?: string | null;
};

function isManual(i: SubmissionDetailItem) {
  return i.gradingMode === "MANUAL";
}

function toJsonPretty(v: unknown): string {
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v ?? "");
  }
}

/** Lee feedback que puede venir como string o como objeto { message|msg|text|reason|detail } */
function readFeedback(src: unknown): string {
  if (typeof src === "string") return src;
  if (src && typeof src === "object") {
    const obj = src as Record<string, unknown>;
    for (const k of ["message", "msg", "text", "reason", "detail"]) {
      const v = obj[k];
      if (typeof v === "string" && v.trim()) return v.trim();
    }
    try {
      return JSON.stringify(obj);
    } catch {
      /* noop */
    }
  }
  return "";
}

/* ─────────────────────────────────────────────── */
export default function SubmissionDetailTeacher() {
  const { assignmentId = "", submissionId = "" } = useParams<{
    assignmentId: string;
    submissionId: string;
  }>();

  const { data, isLoading, error, refetch, isFetching } =
    useSubmissionDetailTeacher(submissionId);
  const gradeM = useGradeItem();

  const [drafts, setDrafts] = useState<Record<string, ManualDraft>>({});
  const [showUi, setShowUi] = useState<Record<string, boolean>>({});

  const [examCache, setExamCache] = useState<Record<string, ExamExerciseLite>>(
    {}
  );
  const loadingSet = useRef<Set<string>>(new Set());

  const items = useMemo(() => data?.items ?? [], [data?.items]);
  const manualItems = useMemo(() => items.filter(isManual), [items]);

  // Hidrata borradores con score/correct/feedback actuales del BE
  useEffect(() => {
    if (!data) return;
    const nextDrafts: Record<string, ManualDraft> = {};
    const nextShowUi: Record<string, boolean> = {};
    for (const it of data.items) {
      const score = typeof it.score === "number" ? it.score : "";
      const correct =
        typeof it.correct === "boolean"
          ? it.correct
          : typeof it.score === "number"
          ? it.score > 0
          : false;

      nextDrafts[it.submissionItemId] = {
        score,
        correct,
        feedback: readFeedback(it.feedback), // 👈 hidrata con feedback existente
      };
      nextShowUi[it.submissionItemId] = true;
    }
    setDrafts(nextDrafts);
    setShowUi(nextShowUi);
  }, [data]);

  const setDraft = (itemId: string, patch: Partial<ManualDraft>) =>
    setDrafts((d) => ({
      ...d,
      [itemId]: { ...(d[itemId] ?? defaultDraft()), ...patch },
    }));

  const defaultDraft = (): ManualDraft => ({
    score: "",
    correct: false,
    feedback: "",
  });

  // Carga perezosa de ejercicio
  const ensureExerciseLoaded = async (exerciseId?: string | null) => {
    if (
      !exerciseId ||
      examCache[exerciseId] ||
      loadingSet.current.has(exerciseId)
    )
      return;
    loadingSet.current.add(exerciseId);
    try {
      const ex = await getExerciseForExam(exerciseId);
      const lite: ExamExerciseLite = {
        id: ex.id,
        templateType: ex.templateType as TemplateType,
        parameters: ex.parameters ?? {},
        statementRendered: ex.statementRendered ?? null,
      };
      setExamCache((m) => ({ ...m, [exerciseId]: lite }));
    } finally {
      loadingSet.current.delete(exerciseId);
    }
  };

  useEffect(() => {
    if (!items.length) return;
    for (const it of items) {
      if (showUi[it.submissionItemId]) void ensureExerciseLoaded(it.exerciseId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, showUi]);

  // Guardar calificación manual
  const handleSave = async (it: SubmissionDetailItem) => {
    const d = drafts[it.submissionItemId] ?? defaultDraft();
    const max = it.points ?? 0;
    const score =
      typeof d.score === "number" && Number.isFinite(d.score)
        ? Math.max(0, Math.min(max, d.score))
        : 0;

    const feedbackText = d.feedback.trim();
    // 👇 Enviamos string plano (compat BE). Si algún día tu BE pidiera el objeto, se podría añadir un toggle/env var.
    const body: GradeItemBody = {
      score,
      correct: Boolean(d.correct),
      feedback: feedbackText || undefined,
    };

    await gradeM.mutateAsync({
      submissionId: submissionId!,
      itemId: it.submissionItemId,
      body,
    });

    // Sincronizamos borrador con lo guardado (y evitamos perder lo escrito)
    setDraft(it.submissionItemId, {
      score,
      correct: body.correct,
      feedback: feedbackText,
    });
  };

  if (isLoading) return <p className="p-6">Cargando…</p>;
  if (error) return <p className="p-6 text-red-500">Error al cargar.</p>;
  if (!data) return null;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Detalle de envío</h1>
        <div className="flex gap-2">
          <Link
            to={`/teacher/assessments/${assignmentId}/submissions`}
            className="rounded border px-3 py-1.5 text-sm hover:bg-gray-100 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
          >
            ← Volver a envíos
          </Link>
          <button
            onClick={() => void refetch()}
            disabled={isFetching}
            className="rounded bg-slate-600 px-3 py-1.5 text-sm text-white hover:bg-slate-700 disabled:opacity-60"
          >
            {isFetching ? "Actualizando…" : "Refrescar"}
          </button>
        </div>
      </div>

      {/* Resumen */}
      <div className="mb-4 text-sm opacity-80">
        <div>
          ID: <strong>{data.submissionId}</strong>
        </div>
        <div>
          Estado: <strong>{data.status}</strong>
        </div>
        <div>
          Puntaje:{" "}
          <strong>
            {typeof data.score === "number" ? data.score : "—"}
            {typeof data.maxScore === "number" ? ` / ${data.maxScore}` : ""}
          </strong>
        </div>
      </div>

      {/* Ítems */}
      <div className="space-y-6">
        {items
          .slice()
          .sort((a, b) => a.position - b.position)
          .map((it) => {
            const d = drafts[it.submissionItemId] ?? defaultDraft();
            const max = it.points ?? 0;

            const exerciseLite = it.exerciseId
              ? examCache[it.exerciseId]
              : null;
            const tplKey: TemplateType | null =
              (exerciseLite?.templateType as TemplateType | undefined) ??
              (it.exerciseType as TemplateType | undefined) ??
              null;

            const mod = tplKey ? registry[tplKey] : undefined;
            const loading = it.exerciseId
              ? loadingSet.current.has(it.exerciseId)
              : false;

            const decodedValue =
              showUi[it.submissionItemId] && mod
                ? mod.read(it.answer ? JSON.stringify(it.answer) : undefined)
                : undefined;

            const guardedParams =
              exerciseLite && mod ? mod.guard(exerciseLite.parameters) : null;

            const quicks = quicksFor(max);
            const onQuick = (q: number) => {
              setDraft(it.submissionItemId, {
                score: q,
                ...(q === 0 ? { correct: false } : {}),
                ...(q === max ? { correct: true } : {}),
              });
            };

            const beFeedback = readFeedback(it.feedback);

            return (
              <section
                key={it.submissionItemId}
                className="rounded-xl border p-4 shadow-sm dark:border-gray-700"
                aria-labelledby={`item-${it.submissionItemId}`}
              >
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div
                    className="font-medium"
                    id={`item-${it.submissionItemId}`}
                  >
                    Ítem {it.position} · {it.points} pts · {it.gradingMode}
                  </div>
                  <div className="text-xs opacity-70">
                    OA: {it.objectiveId?.slice(0, 8)}… · EX:{" "}
                    {it.exerciseId?.slice(0, 8)}…
                  </div>
                </div>

                {it.statementRendered ? (
                  <div
                    className="prose prose-sm max-w-none dark:prose-invert mb-3"
                    dangerouslySetInnerHTML={{ __html: it.statementRendered }}
                  />
                ) : null}

                <div className="mb-3 flex items-center justify-between gap-2">
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={Boolean(showUi[it.submissionItemId])}
                      onChange={(e) =>
                        setShowUi((s) => ({
                          ...s,
                          [it.submissionItemId]: e.target.checked,
                        }))
                      }
                    />
                    <span>Ver UI del ítem (solo vista)</span>
                  </label>

                  <div className="text-xs opacity-70">
                    <span className="mr-3">
                      Correcto:{" "}
                      <strong>
                        {typeof it.correct === "boolean"
                          ? it.correct
                            ? "Sí"
                            : "No"
                          : "—"}
                      </strong>
                    </span>
                    <span>
                      Puntaje actual:{" "}
                      <strong>
                        {typeof it.score === "number" ? it.score : "—"}
                      </strong>
                    </span>
                  </div>
                </div>

                {showUi[it.submissionItemId] ? (
                  <div className="relative mb-3 rounded-lg border bg-white p-3 dark:border-gray-800 dark:bg-gray-800">
                    {!tplKey || !mod ? (
                      <div className="text-sm opacity-70">
                        Tipo no soportado por el visor docente.
                        {tplKey ? ` (${tplKey})` : " (sin tipo)"}
                      </div>
                    ) : loading && !exerciseLite ? (
                      <div
                        className="text-sm opacity-70"
                        aria-live="polite"
                        aria-busy="true"
                      >
                        Cargando parámetros del ejercicio…
                      </div>
                    ) : !exerciseLite ? (
                      <div className="text-sm opacity-70">
                        No se pudieron cargar los parámetros del ejercicio.
                      </div>
                    ) : !guardedParams ? (
                      <div className="text-sm opacity-70">
                        Parámetros inválidos o incompletos para esta plantilla.
                      </div>
                    ) : (
                      <>
                        <div className="opacity-100 pointer-events-none select-none">
                          {
                            mod.Render({
                              params: guardedParams,
                              value: decodedValue as never,
                              onChange: () => {},
                              statementHtml:
                                it.statementRendered ??
                                exerciseLite.statementRendered ??
                                null,
                              submissionItemId: it.submissionItemId,
                            }) as JSX.Element
                          }
                        </div>
                        <span className="absolute right-2 top-2 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-white opacity-80">
                          Solo vista
                        </span>
                      </>
                    )}
                  </div>
                ) : null}

                {it.answer ? (
                  <details className="mb-3 rounded border p-2 text-sm dark:border-gray-700 dark:bg-gray-900">
                    <summary className="cursor-pointer select-none text-xs font-medium">
                      Ver respuesta JSON
                    </summary>
                    <pre className="mt-2 max-h-40 overflow-auto rounded bg-gray-50 p-2 text-xs dark:bg-gray-950">
                      {toJsonPretty(it.answer)}
                    </pre>
                  </details>
                ) : (
                  <div className="mb-3 text-sm opacity-70">Sin respuesta.</div>
                )}

                {/* Feedback actual del BE (si existiera) */}
                {beFeedback ? (
                  <div className="mb-3 rounded border p-2 text-xs dark:border-gray-700 dark:bg-gray-900">
                    <span className="font-semibold">Feedback actual:</span>{" "}
                    <span className="opacity-90">{beFeedback}</span>
                  </div>
                ) : null}

                {/* Calificación manual */}
                {isManual(it) ? (
                  <div className="rounded-md border p-3 dark:border-gray-600">
                    <div className="mb-2 text-sm font-semibold">
                      Calificar manualmente
                    </div>

                    <div className="mb-3 flex items-center gap-2">
                      <span className="text-sm opacity-80">Marca:</span>
                      <div className="inline-flex overflow-hidden rounded-lg border dark:border-gray-700">
                        <button
                          type="button"
                          onClick={() =>
                            setDraft(it.submissionItemId, { correct: true })
                          }
                          className={`px-3 py-1.5 text-sm ${
                            d.correct
                              ? "bg-emerald-600 text-white"
                              : "bg-white text-gray-800 dark:bg-gray-900 dark:text-gray-100"
                          }`}
                        >
                          Correcto
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setDraft(it.submissionItemId, { correct: false })
                          }
                          className={`px-3 py-1.5 text-sm ${
                            !d.correct
                              ? "bg-rose-600 text-white"
                              : "bg-white text-gray-800 dark:bg-gray-900 dark:text-gray-100"
                          }`}
                        >
                          Incorrecto
                        </button>
                      </div>
                    </div>

                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="text-sm opacity-80">Puntaje:</span>
                      <div className="inline-flex gap-1">
                        {quicks.map((q) => (
                          <button
                            key={`q-${it.submissionItemId}-${q}`}
                            type="button"
                            onClick={() => onQuick(q)}
                            className="rounded border px-2 py-1 text-xs hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                      <input
                        type="number"
                        min={0}
                        max={max}
                        value={typeof d.score === "number" ? d.score : ""}
                        onChange={(e) => {
                          const n = Number(e.target.value);
                          setDraft(it.submissionItemId, {
                            score: Number.isFinite(n)
                              ? Math.max(0, Math.min(max, n))
                              : "",
                          });
                        }}
                        className="w-24 rounded border px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-900"
                        aria-label="Puntaje"
                      />
                      <span className="text-xs opacity-70">0 … {max}</span>
                    </div>

                    <div className="mb-3">
                      <textarea
                        className="w-full rounded border px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-900"
                        rows={3}
                        placeholder="Feedback opcional para el alumno"
                        value={d.feedback}
                        onChange={(e) =>
                          setDraft(it.submissionItemId, {
                            feedback: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <button
                        onClick={() => void handleSave(it)}
                        disabled={gradeM.isPending}
                        className="rounded bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700 disabled:opacity-60"
                      >
                        {gradeM.isPending
                          ? "Guardando…"
                          : "Guardar calificación"}
                      </button>
                    </div>
                  </div>
                ) : null}
              </section>
            );
          })}

        {manualItems.length === 0 ? (
          <div className="rounded border p-4 text-sm opacity-70 dark:border-gray-700">
            No hay ítems manuales en este envío.
          </div>
        ) : null}
      </div>
    </div>
  );
}

function quicksFor(max: number): number[] {
  const arr = [0, Math.round(max / 2), max];
  return Array.from(new Set(arr));
}
