// src/pages/student/assessments/SubmissionResult.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  getSubmissionDetail,
  listMySubmissions,
} from "../../../services/assessmentsService";
import type { SubmissionDetailResponse } from "../../../types/assessments/submissions";
import type { SubmissionStatus } from "../../../types/assessments/common";
import { assessmentsKeys } from "../../../hooks/assessments/queryKeys";

/** mm:ss */
function fmtMMSS(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

/** Fallback: calcula segundos entre startedAt y submittedAt si ambos existen. */
function computeElapsedFallback(
  d: SubmissionDetailResponse | null
): number | null {
  if (!d?.startedAt || !d?.submittedAt) return null;
  const a = Date.parse(d.startedAt);
  const b = Date.parse(d.submittedAt);
  if (Number.isNaN(a) || Number.isNaN(b)) return null;
  const diff = Math.max(0, Math.floor((b - a) / 1000));
  return diff;
}

export default function SubmissionResult() {
  const { submissionId = "" } = useParams<{ submissionId: string }>();
  const qc = useQueryClient();

  const [data, setData] = useState<SubmissionDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // guardamos el último status para detectar transición a GRADED
  const lastStatusRef = useRef<SubmissionStatus | null>(null);

  // 🔔 al abrir este detalle, marca como “vistos” los pendientes actuales
  useEffect(() => {
    let ignore = false;
    async function markSeen() {
      try {
        let cnt = qc.getQueryData<number>(
          assessmentsKeys.mySubmissionsCount("SUBMITTED")
        );
        if (typeof cnt !== "number") {
          const p = await listMySubmissions({
            status: "SUBMITTED",
            page: 0,
            size: 1,
          });
          cnt = p.totalElements ?? 0;
        }
        if (!ignore) {
          localStorage.setItem(
            "assess:lastSeenSubmittedCount",
            String(cnt ?? 0)
          );
          await qc.refetchQueries({
            queryKey: assessmentsKeys.mySubmissionsCount("SUBMITTED"),
          });
        }
      } catch {
        // silent
      }
    }
    void markSeen();
    return () => {
      ignore = true;
    };
  }, [qc]);

  // polling hasta GRADED
  useEffect(() => {
    let cancel = false;
    let timer: number | null = null;

    async function load() {
      try {
        setLoadError(null);
        const res = await getSubmissionDetail(submissionId, false);
        if (cancel) return;

        setData(res);
        setLoading(false);

        const current = res?.status ?? null;
        const prev = lastStatusRef.current;

        // Si transiciona a GRADED → invalidamos el contador del menú
        if (current === "GRADED" && prev !== "GRADED") {
          lastStatusRef.current = "GRADED";
          void qc.invalidateQueries({
            queryKey: assessmentsKeys.mySubmissionsCount("SUBMITTED"),
          });
        } else {
          lastStatusRef.current = current;
        }

        if (res && res.status !== "GRADED") {
          timer = window.setTimeout(load, 5000);
        }
      } catch {
        if (!cancel) {
          setLoading(false);
          setLoadError("No se pudo cargar los resultados. Intenta nuevamente.");
        }
      }
    }

    void load();
    return () => {
      cancel = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [submissionId, qc]);

  const header = useMemo(() => {
    if (!data) return "Resultados del envío";
    const score = data.score ?? null;
    const max = data.maxScore ?? null;
    const s =
      score !== null && max !== null ? `${score} / ${max}` : score ?? "—";
    return `Resultados del envío — ${s}`;
  }, [data]);

  // Calcula duración real (prioriza elapsedSec del BE; si no, fallback)
  const elapsedSec: number | null = useMemo(() => {
    if (!data) return null;
    if (typeof data.elapsedSec === "number") return data.elapsedSec;
    return computeElapsedFallback(data);
  }, [data]);

  const status: SubmissionStatus | "—" = data?.status ?? "—";

  const statusInfo = useMemo(() => {
    switch (status) {
      case "GRADED":
        return {
          label: "Calificado",
          className:
            "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100",
          description: "Tu evaluación fue revisada y ya tienes tu puntaje.",
        };
      case "SUBMITTED":
        return {
          label: "Enviado",
          className:
            "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-100",
          description:
            "Tu evaluación fue enviada. Estamos corrigiendo algunos ítems.",
        };
      case "IN_PROGRESS":
        return {
          label: "En progreso",
          className:
            "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-100",
          description: "Tu intento está en proceso de registro.",
        };
      default:
        return {
          label: String(status),
          className:
            "bg-gray-100 text-gray-800 dark:bg-gray-800/60 dark:text-gray-100",
          description: null,
        };
    }
  }, [status]);

  const items = data?.items ?? [];

  const totals = useMemo(() => {
    const total = items.length;
    const correct = items.filter((it) => it.correct === true).length;
    const incorrect = items.filter((it) => it.correct === false).length;
    const pending = items.filter((it) => it.correct === null).length;
    return { total, correct, incorrect, pending };
  }, [items]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 px-4 py-6 dark:bg-[#1e2a34]">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Cargando resultados…
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex justify-center bg-gray-50 px-4 py-6 sm:px-6 lg:px-8 dark:bg-[#1e2a34]">
      <div className="w-full max-w-4xl">
        {/* Card principal */}
        <div className="rounded-2xl border bg-white p-5 shadow-xl dark:border-gray-800 dark:bg-gray-900 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-2xl">
                📊 {header}
              </h1>
              {elapsedSec !== null && (
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-300 sm:text-sm">
                  Tiempo empleado:{" "}
                  <span className="font-semibold">{fmtMMSS(elapsedSec)}</span>
                </p>
              )}
            </div>
            <div className="flex flex-col items-start gap-1 text-xs sm:items-end">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold sm:text-xs ${statusInfo.className}`}
              >
                Estado: {statusInfo.label}
              </span>
              {statusInfo.description && (
                <span className="max-w-xs text-[11px] text-gray-600 dark:text-gray-300 sm:text-xs">
                  {statusInfo.description}
                </span>
              )}
            </div>
          </div>

          {/* Mensaje de error de carga (si lo hubiera) */}
          {loadError && (
            <div className="mb-4 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-800 dark:border-rose-600 dark:bg-rose-900/30 dark:text-rose-100">
              {loadError}
            </div>
          )}

          {/* Resumen rápido */}
          <div className="mb-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4 sm:text-sm">
            <SummaryChip
              label="Total de ítems"
              value={totals.total}
              className="bg-gray-50 text-gray-800 dark:bg-gray-800/60 dark:text-gray-100"
            />
            <SummaryChip
              label="Correctos"
              value={totals.correct}
              className="bg-emerald-50 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100"
            />
            <SummaryChip
              label="Incorrectos"
              value={totals.incorrect}
              className="bg-rose-50 text-rose-800 dark:bg-rose-900/40 dark:text-rose-100"
            />
            <SummaryChip
              label="Pendientes"
              value={totals.pending}
              className="bg-amber-50 text-amber-800 dark:bg-amber-900/40 dark:text-amber-100"
            />
          </div>

          {/* Lista responsiva de ítems */}
          <div className="mt-2">
            {/* Vista móvil: tarjetas verticales */}
            <div className="space-y-3 sm:hidden">
              {items.map((it, index) => {
                const state =
                  it.correct === null
                    ? "Pendiente"
                    : it.correct
                    ? "Correcto"
                    : "Incorrecto";

                const badgeClass =
                  it.correct === null
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-100"
                    : it.correct
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100"
                    : "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-100";

                const sc =
                  it.score != null
                    ? `${it.score}${it.points != null ? ` / ${it.points}` : ""}`
                    : "—";

                const fb =
                  typeof it.feedback === "string"
                    ? it.feedback.trim() || null
                    : it.feedback && typeof it.feedback === "object"
                    ? extractFeedbackText(
                        it.feedback as Record<string, unknown>
                      )
                    : null;

                return (
                  <div
                    key={it.submissionItemId}
                    className="rounded-xl border border-gray-100 bg-white px-3 py-2 text-xs shadow-sm dark:border-gray-800 dark:bg-gray-950/40"
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span className="font-mono text-[11px] text-gray-600 dark:text-gray-300">
                        Ítem #{index + 1}
                      </span>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${badgeClass}`}
                      >
                        {state}
                      </span>
                    </div>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-[11px] text-gray-500 dark:text-gray-400">
                        Puntaje
                      </span>
                      <span className="text-[11px] font-semibold text-gray-800 dark:text-gray-100">
                        {sc}
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] text-gray-600 dark:text-gray-300">
                      <span className="font-medium">Feedback: </span>
                      {fb ? (
                        <span>{fb}</span>
                      ) : (
                        <span className="opacity-60">Sin comentarios</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Vista tablet/desktop: tabla completa */}
            <div className="hidden overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950/40 sm:block">
              <table className="w-full min-w-[480px] text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-600 dark:bg-gray-900 dark:text-gray-300">
                  <tr>
                    <th className="px-4 py-2 text-left">Ítem</th>
                    <th className="px-4 py-2 text-left">Estado</th>
                    <th className="px-4 py-2 text-left">Puntaje</th>
                    <th className="px-4 py-2 text-left">Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, i) => {
                    const state =
                      it.correct === null
                        ? "Pendiente"
                        : it.correct
                        ? "Correcto"
                        : "Incorrecto";

                    const badgeClass =
                      it.correct === null
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-100"
                        : it.correct
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100"
                        : "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-100";

                    const sc =
                      it.score != null
                        ? `${it.score}${
                            it.points != null ? ` / ${it.points}` : ""
                          }`
                        : "—";

                    const fb =
                      typeof it.feedback === "string"
                        ? it.feedback.trim() || null
                        : it.feedback && typeof it.feedback === "object"
                        ? extractFeedbackText(
                            it.feedback as Record<string, unknown>
                          )
                        : null;

                    return (
                      <tr
                        key={it.submissionItemId}
                        className="border-t text-xs text-gray-800 dark:border-gray-800 dark:text-gray-100 sm:text-sm"
                      >
                        <td className="px-4 py-2 font-mono text-[11px] sm:text-xs">
                          #{i + 1}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold sm:text-xs ${badgeClass}`}
                          >
                            {state}
                          </span>
                        </td>
                        <td className="px-4 py-2">{sc}</td>
                        <td className="px-4 py-2">
                          {fb ? (
                            <span className="line-clamp-3 text-[11px] opacity-90 sm:text-xs">
                              {fb}
                            </span>
                          ) : (
                            <span className="text-[11px] opacity-50 sm:text-xs">
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="px-4 py-3 text-[11px] text-gray-600 dark:text-gray-300 sm:text-xs">
                {data?.status !== "GRADED"
                  ? "Estamos corrigiendo algunos ítems… esta página se actualizará automáticamente cada pocos segundos."
                  : "Envío calificado. ¡Bien hecho!"}
              </div>
            </div>
          </div>
        </div>

        {/* Acciones inferiores */}
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link
            to="/student/assessments/available"
            className="inline-flex items-center rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-800 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800 sm:text-sm"
          >
            ← Volver a evaluaciones disponibles
          </Link>

          <Link
            to="/student/assessments/history"
            className="inline-flex items-center rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-800 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800 sm:text-sm"
          >
            Ver historial de envíos
          </Link>
        </div>
      </div>
    </div>
  );
}

interface SummaryChipProps {
  label: string;
  value: number;
  className?: string;
}

function SummaryChip({ label, value, className = "" }: SummaryChipProps) {
  return (
    <div
      className={`flex flex-col rounded-xl px-3 py-2 text-xs sm:px-4 sm:py-3 sm:text-sm ${className}`}
    >
      <span className="text-[11px] font-medium uppercase tracking-wide opacity-70 sm:text-xs">
        {label}
      </span>
      <span className="text-base font-bold sm:text-lg">{value}</span>
    </div>
  );
}

function extractFeedbackText(obj: Record<string, unknown>): string | null {
  for (const k of ["message", "msg", "text", "reason", "detail"]) {
    const v = obj[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  try {
    return JSON.stringify(obj);
  } catch {
    return null;
  }
}
