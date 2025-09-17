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
        /* no-op */
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
        if (!cancel) setLoading(false);
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

  if (loading) return <p className="p-6">Cargando resultados…</p>;

  const status: SubmissionStatus | "—" = data?.status ?? "—";

  return (
    <div className="min-h-[calc(100vh-64px)] px-4 py-6 sm:px-6 lg:px-8 flex justify-center">
      <div className="w-full max-w-4xl">
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">{header}</h1>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Estado: <strong>{status}</strong>
          </div>
        </div>

        {/* Meta: duración real (si la tenemos) */}
        {elapsedSec !== null && (
          <div className="mb-4 text-sm text-gray-700 dark:text-gray-300">
            Tiempo empleado: <strong>{fmtMMSS(elapsedSec)}</strong>
          </div>
        )}

        <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/60">
              <tr className="text-left text-xs uppercase tracking-wide text-gray-600 dark:text-gray-300">
                <th className="px-4 py-2">Ítem</th>
                <th className="px-4 py-2">Estado</th>
                <th className="px-4 py-2">Puntaje</th>
                <th className="px-4 py-2">Feedback</th>
              </tr>
            </thead>
            <tbody>
              {(data?.items ?? []).map((it, i) => {
                const state =
                  it.correct === null
                    ? "Pendiente"
                    : it.correct
                    ? "Correcto"
                    : "Incorrecto";

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
                  <tr
                    key={it.submissionItemId}
                    className="border-t dark:border-gray-800"
                  >
                    <td className="px-4 py-2">#{i + 1}</td>
                    <td className="px-4 py-2">{state}</td>
                    <td className="px-4 py-2">{sc}</td>
                    <td className="px-4 py-2">
                      {fb ? (
                        <span className="opacity-90">{fb}</span>
                      ) : (
                        <span className="opacity-50">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300">
            {data?.status !== "GRADED"
              ? "Estamos corrigiendo algunos ítems… esta página se actualizará automáticamente."
              : "Envío calificado."}
          </div>
        </div>

        <div className="mt-4">
          <Link
            to="/student/assessments/available"
            className="rounded-lg border px-3 py-1.5 text-sm transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
          >
            ← Volver a evaluaciones disponibles
          </Link>
        </div>
      </div>
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
