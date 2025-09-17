import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSubmissionDetail,
  submitSubmission,
} from "../../../services/assessmentsService";
import { getExerciseForExam } from "../../../services/exerciseService";
import type {
  SubmissionDetailResponse,
  SubmitRequest,
} from "../../../types/assessments/submissions";
import type { TemplateType } from "../../../types/exercise/TemplateSchemaResponse";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import { showToast } from "../../../utils/showToast";
import { registry } from "../../../features/assessments/exam/registry";
import WhiteboardFloatingPanel from "../../../components/student/WhiteboardFloatingPanel";

/* =========================
   Helpers y tipos locales
   ========================= */

type AnswersState = Record<string, string>; // submissionItemId -> JSON string persistido
const draftKey = (submissionId: string) => `assess:draft:${submissionId}`;

// Umbral para aviso de “expira pronto”
const WARN_SECS = 30;

function safeStringify(v: unknown) {
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return "";
  }
}

/** Calcula el tiempo restante usando el límite efectivo del detalle. */
function computeRemainingSec(detail: SubmissionDetailResponse): number | null {
  const startedAt = detail.startedAt ?? null;
  const timeLimit =
    typeof detail.durationSec === "number" ? detail.durationSec : null;

  if (!startedAt || timeLimit === null) return null;

  const startMs = Date.parse(startedAt);
  if (Number.isNaN(startMs)) return null;

  const elapsed = Math.floor((Date.now() - startMs) / 1000);
  return Math.max(0, timeLimit - elapsed);
}

function fmtMMSS(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

/** Mínimo necesario del “exam exercise” para renderizar */
type ExamExerciseLite = {
  id: string;
  templateType: TemplateType;
  parameters: unknown;
  statementRendered?: string | null;
};

/* ------------------ Tipos para parsear errores del BE (sin any) ------------------ */
type BackendFieldErrors = Record<string, string>;

type BackendError = {
  status?: number;
  error?: string;
  message?: string;
  path?: string;
  details?: {
    fields?: BackendFieldErrors;
  };
};

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

function extractBackendError(err: unknown): BackendError | null {
  let payload: unknown = null;

  if (isRecord(err) && "response" in err) {
    const resp = (err as Record<string, unknown>).response;
    if (isRecord(resp) && "data" in resp) {
      payload = (resp as Record<string, unknown>).data;
    }
  }
  if (payload == null && isRecord(err) && "data" in err) {
    payload = (err as Record<string, unknown>).data;
  }
  if (payload == null) {
    payload = err;
  }

  if (!isRecord(payload)) return null;

  const detailsNode = isRecord(payload.details) ? payload.details : undefined;
  let fields: BackendFieldErrors | undefined;

  if (detailsNode && isRecord(detailsNode.fields)) {
    const f: BackendFieldErrors = {};
    for (const [k, v] of Object.entries(detailsNode.fields)) {
      if (typeof v === "string") f[k] = v;
    }
    fields = Object.keys(f).length > 0 ? f : undefined;
  }

  return {
    status: typeof payload.status === "number" ? payload.status : undefined,
    error: typeof payload.error === "string" ? payload.error : undefined,
    message: typeof payload.message === "string" ? payload.message : undefined,
    path: typeof payload.path === "string" ? payload.path : undefined,
    details: fields ? { fields } : undefined,
  };
}

function formatFieldErrors(
  fields: BackendFieldErrors | undefined
): string | null {
  if (!fields) return null;
  const parts = Object.entries(fields).map(([k, v]) => `${k}: ${v}`);
  return parts.length ? parts.join(" · ") : null;
}

/* =========================
   Página
   ========================= */

export default function TakeAssessment() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const { submissionId = "" } = useParams<{ submissionId: string }>();

  // Estado de pizarra
  const [wbOpen, setWbOpen] = useState(false);

  // Estado de respuestas (persistidas en localStorage por submission)
  const [answers, setAnswers] = useState<AnswersState>({});
  const [restoreAsk, setRestoreAsk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [leavingWarn, setLeavingWarn] = useState(false);

  // Índice de ítem actual
  const [idx, setIdx] = useState(0);

  // Cache de ejercicios “exam” por exerciseId (carga perezosa)
  const [examCache, setExamCache] = useState<Record<string, ExamExerciseLite>>(
    {}
  );
  const [loadingExerciseId, setLoadingExerciseId] = useState<string | null>(
    null
  );

  // Cargar detalle de submission/ítems
  const q = useQuery<SubmissionDetailResponse>({
    queryKey: ["submissions", submissionId],
    queryFn: () => getSubmissionDetail(submissionId, false),
    enabled: !!submissionId,
    staleTime: 10_000,
  });

  const detail = q.data;
  const items = useMemo(() => detail?.items ?? [], [detail?.items]);
  const total = items.length;
  const current = items[idx] ?? null;
  const nextItem = idx + 1 < total ? items[idx + 1] : null;

  // Hidratación inicial de respuestas (del backend + borrador local)
  const initialHydrated = useRef(false);
  useEffect(() => {
    if (!detail || initialHydrated.current) return;
    initialHydrated.current = true;

    const base: AnswersState = {};
    for (const it of detail.items ?? []) {
      base[it.submissionItemId] = it.answer ? safeStringify(it.answer) : "";
    }
    setAnswers(base);

    const cached = localStorage.getItem(draftKey(submissionId));
    if (cached) setRestoreAsk(true);
  }, [detail, submissionId]);

  // Autosave (500ms debounce)
  const debounceRef = useRef<number | null>(null);
  useEffect(() => {
    if (!submissionId) return;
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    const hasContent = Object.values(answers).some(
      (s) => (s ?? "").trim().length > 0
    );
    debounceRef.current = window.setTimeout(() => {
      if (hasContent) {
        localStorage.setItem(draftKey(submissionId), JSON.stringify(answers));
      } else {
        localStorage.removeItem(draftKey(submissionId));
      }
    }, 500);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [answers, submissionId]);

  // Warn al salir si hay borrador
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      const hasDraft = !!localStorage.getItem(draftKey(submissionId));
      if (hasDraft && !leavingWarn) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
      return undefined;
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [submissionId, leavingWarn]);

  // Mutación submit (con manejo de errores tipado)
  const submitM = useMutation({
    mutationFn: (body: SubmitRequest) => submitSubmission(submissionId, body),
    onSuccess: () => {
      localStorage.removeItem(draftKey(submissionId));
      localStorage.setItem("assess:lastSubmissionId", submissionId);
      qc.invalidateQueries({ queryKey: ["submissions", submissionId] });
      showToast.success("¡Envío realizado!");
      setLeavingWarn(true);
      nav("/student/assessments/available");
    },
    onError: (err: unknown) => {
      const be = extractBackendError(err);
      const msg = be?.message ?? "No se pudo enviar. Intenta nuevamente.";
      const fields = formatFieldErrors(be?.details?.fields);
      showToast.error(fields ? `${msg}. ${fields}` : msg);
    },
  });

  // Validación de JSON por ítem (fallback textarea)
  const validMap = useMemo(() => {
    const m = new Map<string, boolean>();
    for (const it of items) {
      const raw = answers[it.submissionItemId] ?? "";
      if (!raw.trim()) {
        m.set(it.submissionItemId, true);
      } else {
        try {
          JSON.parse(raw);
          m.set(it.submissionItemId, true);
        } catch {
          m.set(it.submissionItemId, false);
        }
      }
    }
    return m;
  }, [answers, items]);

  const hasInvalid = useMemo(
    () => Array.from(validMap.values()).some((ok) => !ok),
    [validMap]
  );

  // Countdown + auto-submit
  const [remaining, setRemaining] = useState<number | null>(null);
  const autoSubmitRef = useRef(false);
  const warnEmittedRef = useRef(false);

  // Estado para banner de reintento
  type AutoRetryState = { active: boolean; attempt: number; max: number };
  const [autoRetry, setAutoRetry] = useState<AutoRetryState>({
    active: false,
    attempt: 0,
    max: 0,
  });

  // Reintento con backoff (sólo para envíos por timeout)
  async function submitWithRetry(body: SubmitRequest, maxAttempts = 3) {
    setAutoRetry({ active: true, attempt: 1, max: maxAttempts });

    const sleep = (ms: number) =>
      new Promise<void>((resolve) => setTimeout(resolve, ms));

    let attempt = 1;
    // Si está offline, esperamos a 'online' antes del primer intento
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      await new Promise<void>((resolve) => {
        const onOnline = () => {
          window.removeEventListener("online", onOnline);
          resolve();
        };
        window.addEventListener("online", onOnline);
      });
    }

    // Intentos con backoff exponencial (2s, 4s, 8s)
    while (attempt <= maxAttempts) {
      try {
        await submitM.mutateAsync(body);
        setAutoRetry({ active: false, attempt: 0, max: 0 });
        return;
      } catch {
        if (attempt >= maxAttempts) break;
        const waitMs = Math.pow(2, attempt) * 1000;
        await sleep(waitMs);
        attempt += 1;
        setAutoRetry({ active: true, attempt, max: maxAttempts });
      }
    }

    // Si llegamos aquí, fallaron todos los intentos
    setAutoRetry({ active: false, attempt: 0, max: 0 });
    showToast.error(
      "No pudimos enviar automáticamente tu evaluación. Verifica tu conexión e inténtalo manualmente."
    );
  }

  useEffect(() => {
    if (!detail) return;
    const initial = computeRemainingSec(detail);
    setRemaining(initial);
    // Reset del aviso de 30s
    warnEmittedRef.current = false;
    // Sin límite → no timer
    if (initial === null) return;

    const id = window.setInterval(() => {
      setRemaining((prev) => {
        const next = typeof prev === "number" ? Math.max(0, prev - 1) : null;

        // Aviso a 30s (una vez)
        if (next !== null && next <= WARN_SECS && !warnEmittedRef.current) {
          warnEmittedRef.current = true;
          // Vibración discreta si está disponible
          try {
            if (typeof navigator !== "undefined" && "vibrate" in navigator) {
              navigator.vibrate?.(200);
            }
          } catch {
            /* noop */
          }
          showToast.info("Quedan ~30 segundos. Asegura tus respuestas.");
        }

        // Auto-submit en 0s + ocultar pizarra
        if (next === 0 && !autoSubmitRef.current) {
          autoSubmitRef.current = true;
          setWbOpen(false);
          void doSubmit(true);
        }
        return next;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [detail]);

  // Re-sincronización periódica (evita drift de reloj del cliente)
  useEffect(() => {
    const id = window.setInterval(() => {
      void q.refetch();
    }, 60_000);
    return () => window.clearInterval(id);
  }, [q]);

  // Re-sincroniza al volver a foco/visibilidad
  useEffect(() => {
    const onFocus = () => void q.refetch();
    const onVis = () => {
      if (document.visibilityState === "visible") void q.refetch();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [q]);

  // Carga perezosa del ejercicio actual y prefetch del siguiente
  useEffect(() => {
    const load = async (exerciseId?: string | null) => {
      if (!exerciseId || examCache[exerciseId]) return;
      setLoadingExerciseId(exerciseId);
      try {
        const ex = await getExerciseForExam(exerciseId);
        const lite: ExamExerciseLite = {
          id: ex.id,
          templateType: ex.templateType as TemplateType,
          parameters: ex.parameters ?? {},
          statementRendered: ex.statementRendered ?? null,
        };
        setExamCache((m) => ({ ...m, [exerciseId]: lite }));
      } catch {
        // fallback: el textarea JSON quedará disponible
      } finally {
        setLoadingExerciseId((cur) => (cur === exerciseId ? null : cur));
      }
    };

    void load(current?.exerciseId);
    void load(nextItem?.exerciseId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.exerciseId, nextItem?.exerciseId]);

  // Helpers: setear JSON serializado en el estado
  const setJsonAnswer = (submissionItemId: string, obj: unknown) => {
    try {
      const s = JSON.stringify(obj);
      setAnswers((prev) => ({ ...prev, [submissionItemId]: s }));
    } catch {
      // si no serializa, no actualizamos
    }
  };

  // Submit (dueToTime=true: usa retry/backoff)
  const doSubmit = async (dueToTime = false) => {
    if (!items.length) return;
    try {
      setBusy(true);

      const answersArray: SubmitRequest["answers"] = items.map((it) => {
        const raw = answers[it.submissionItemId] ?? "";

        let valueObj: unknown = null;
        if (raw.trim().length > 0) {
          try {
            const parsed = JSON.parse(raw) as unknown;
            valueObj = parsed;
          } catch {
            if (!dueToTime) {
              throw new Error(
                `El ítem en posición ${
                  it.position ?? 0
                } no contiene JSON válido.`
              );
            }
            // por tiempo → se envía null
          }
        }

        return {
          submissionItemId: it.submissionItemId,
          exerciseId: it.exerciseId,
          answer: valueObj === null ? null : { value: valueObj },
        };
      });

      const body: SubmitRequest = { answers: answersArray };

      if (dueToTime) {
        showToast.info(
          "Tiempo agotado. Estamos enviando tu evaluación automáticamente…"
        );
        await submitWithRetry(body, 3);
      } else {
        await submitM.mutateAsync(body);
      }
    } catch (e: unknown) {
      const be = extractBackendError(e);
      const msg =
        be?.message ?? (e instanceof Error ? e.message : "Validación fallida.");
      const fields = formatFieldErrors(be?.details?.fields);
      showToast.error(fields ? `${msg}. ${fields}` : msg);
    } finally {
      setBusy(false);
    }
  };

  if (q.isLoading) return <p className="p-6">Cargando evaluación…</p>;
  if (q.error) return <p className="p-6 text-red-600">No se pudo cargar.</p>;
  if (!detail) return null;

  const showTimer = remaining !== null;
  const timerVeryLow =
    showTimer && remaining !== null && remaining <= WARN_SECS; // <=30
  const timerLow =
    showTimer &&
    remaining !== null &&
    remaining > WARN_SECS &&
    remaining <= 60; // (30,60]
  const attemptNo = detail.attemptNo ?? 1;

  // ============== RENDER DE ÍTEM (genérico con registry) ==============
  const exerciseLite = current ? examCache[current.exerciseId ?? ""] : null;
  const isLoadingExercise = loadingExerciseId === current?.exerciseId;

  const fallbackTextarea = (html?: string | null, placeholder?: string) => (
    <>
      {html && (
        <div
          className="prose prose-sm max-w-none dark:prose-invert mb-3"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
      <div className="rounded-md border p-3 dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-1 text-xs font-medium">
          Respuesta (JSON) —{" "}
          {isLoadingExercise
            ? "cargando configuración del ejercicio…"
            : "usa el JSON temporalmente."}
        </div>
        <textarea
          className="w-full rounded border px-3 py-2 font-mono text-xs dark:border-gray-700 dark:bg-gray-900"
          rows={6}
          value={answers[current!.submissionItemId] ?? ""}
          onChange={(e) =>
            setAnswers((prev) => ({
              ...prev,
              [current!.submissionItemId]: e.target.value,
            }))
          }
          placeholder={placeholder ?? 'Ej.: {"selected":"A"}'}
        />
      </div>
    </>
  );

  const renderCurrent = () => {
    if (!current) return null;

    if (!exerciseLite || isLoadingExercise) {
      return fallbackTextarea(current?.statementRendered);
    }

    const tpl: TemplateType = exerciseLite.templateType;
    const mod = registry[tpl];
    if (!mod) {
      return fallbackTextarea(
        current?.statementRendered,
        "Tipo no soportado aún."
      );
    }

    const params = mod.guard(exerciseLite.parameters);
    if (!params) {
      return fallbackTextarea(current?.statementRendered);
    }

    const value = mod.read(answers[current.submissionItemId]);
    const statementHtml =
      current.statementRendered ?? exerciseLite.statementRendered ?? null;

    return (
      <mod.Render
        params={params}
        value={value}
        onChange={(next) =>
          setJsonAnswer(current.submissionItemId, mod.write(next))
        }
        statementHtml={statementHtml}
        submissionItemId={current.submissionItemId}
      />
    );
  };

  return (
    <div className="min-h-[calc(100vh-64px)] px-4 py-6 sm:px-6 lg:px-8 flex justify-center">
      <div className="w-full max-w-4xl">
        {/* Barra examen */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{`Evaluación (${total} ítems)`}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Intento #{attemptNo}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Botón pizarra */}
            <button
              type="button"
              onClick={() => setWbOpen((v) => !v)}
              className="rounded-lg border px-3 py-1.5 text-sm transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
              aria-pressed={wbOpen}
              aria-label="Abrir pizarra"
              title="Pizarra"
            >
              ✏️ Pizarra
            </button>

            {showTimer && (
              <div
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium ${
                  timerVeryLow
                    ? "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-200"
                    : timerLow
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200"
                    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                }`}
                aria-live="polite"
              >
                ⏳ Tiempo restante: {fmtMMSS(remaining ?? 0)}
              </div>
            )}
          </div>
        </div>

        {/* Banner de reintento automático */}
        {autoRetry.active && (
          <div className="mb-3 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-200">
            Enviando automáticamente tu evaluación… intento {autoRetry.attempt}{" "}
            de {autoRetry.max}.
          </div>
        )}

        {/* Stepper / burbujas */}
        <div className="mb-4 flex flex-wrap gap-2">
          {items.map((it, i) => {
            const raw = answers[it.submissionItemId]?.trim() ?? "";
            const valid = validMap.get(it.submissionItemId) ?? true;
            const isCurrent = i === idx;

            const base =
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border transition";
            const cls =
              raw.length === 0
                ? "bg-white text-slate-700 border-slate-300 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700"
                : valid
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-200 dark:border-rose-800";
            const ring = isCurrent ? "ring-2 ring-indigo-500" : "";

            return (
              <button
                key={it.submissionItemId}
                className={`${base} ${cls} ${ring}`}
                onClick={() => setIdx(i)}
                aria-label={`Ir al ítem ${i + 1}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        {/* Ítem actual */}
        {current ? (
          <section
            key={current.submissionItemId}
            className="rounded-xl border p-4 shadow-sm dark:border-gray-700"
            aria-labelledby={`item-${idx + 1}`}
          >
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div className="font-medium" id={`item-${idx + 1}`}>
                Ítem {idx + 1} · {current.points} pts · {current.gradingMode}
              </div>
              <div className="text-xs opacity-70">
                OA: {current.objectiveId?.slice(0, 8)}… · EX:{" "}
                {current.exerciseId?.slice(0, 8)}…
              </div>
            </div>

            {renderCurrent()}
          </section>
        ) : (
          <p className="p-6 text-sm opacity-70">Sin ítems</p>
        )}

        {/* Navegación / acciones */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              className="rounded border px-4 py-2 text-sm hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 disabled:opacity-50"
              onClick={() => setIdx((v) => Math.max(0, v - 1))}
              disabled={busy || submitM.isPending || idx <= 0}
            >
              ← Anterior
            </button>
            <button
              className="rounded border px-4 py-2 text-sm hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 disabled:opacity-50"
              onClick={() => setIdx((v) => Math.min(total - 1, v + 1))}
              disabled={busy || submitM.isPending || idx >= total - 1}
            >
              Siguiente →
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="rounded border px-4 py-2 text-sm hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
              onClick={() => {
                setLeavingWarn(true);
                nav("/student/assessments/available");
              }}
              disabled={busy || submitM.isPending}
            >
              Volver a “Disponibles”
            </button>

            <button
              className="rounded bg-emerald-600 px-4 py-2 text-white text-sm hover:bg-emerald-700 disabled:opacity-50"
              onClick={() => void doSubmit(false)}
              disabled={busy || submitM.isPending || hasInvalid}
              title={
                hasInvalid ? "Corrige las respuestas inválidas" : undefined
              }
            >
              {submitM.isPending ? "Enviando…" : "Enviar evaluación"}
            </button>
          </div>
        </div>

        {/* Restaurar borrador */}
        <ConfirmModal
          isOpen={restoreAsk}
          onClose={() => setRestoreAsk(false)}
          onConfirm={() => {
            try {
              const raw = localStorage.getItem(draftKey(submissionId));
              if (!raw) return;
              const data = JSON.parse(raw) as AnswersState;
              const filtered: AnswersState = {};

              // Normaliza posibles shapes viejos a { value: ... }
              const normalize = (s: string): string => {
                try {
                  const n = JSON.parse(s) as unknown;
                  if (
                    n &&
                    typeof n === "object" &&
                    "value" in (n as Record<string, unknown>)
                  ) {
                    return JSON.stringify({
                      value: (n as Record<string, unknown>).value,
                    });
                  }
                  return JSON.stringify({ value: n });
                } catch {
                  return "";
                }
              };

              for (const it of items) {
                const saved = data[it.submissionItemId];
                if (saved) {
                  const norm = normalize(saved);
                  if (norm) filtered[it.submissionItemId] = norm;
                }
              }
              setAnswers((prev) => ({ ...prev, ...filtered }));
              showToast.success("Borrador restaurado");
            } catch {
              showToast.error("No se pudo restaurar el borrador");
            } finally {
              setRestoreAsk(false);
            }
          }}
          title="Restaurar borrador"
          description="Encontramos respuestas guardadas localmente. ¿Deseas restaurarlas?"
          variant="warning"
          isLoading={false}
        />
      </div>

      {/* Pizarra flotante (persistencia por ítem) */}
      <WhiteboardFloatingPanel
        isOpen={wbOpen}
        onClose={() => setWbOpen(false)}
        storageKey={`whiteboard:${submissionId}:${
          current?.submissionItemId ?? "none"
        }`}
      />
    </div>
  );
}
