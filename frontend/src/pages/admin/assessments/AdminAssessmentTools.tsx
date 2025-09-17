// src/pages/admin/assessments/AdminAssessmentTools.tsx
import { useState } from "react";
import {
  retryAdvisorOutbox,
  retryProgressOutbox,
} from "../../../services/assessmentsService";
import { showToast } from "../../../utils/showToast";

export default function AdminAssessmentTools() {
  const [loading, setLoading] = useState<"progress" | "advisor" | null>(null);

  const run = async (kind: "progress" | "advisor") => {
    try {
      setLoading(kind);
      if (kind === "progress") await retryProgressOutbox(50);
      else await retryAdvisorOutbox(50);
      showToast.success("Tarea ejecutada.");
    } catch {
      showToast.error("No se pudo ejecutar la tarea.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="p-6">
      <h1 className="mb-4 text-xl font-bold">
        Herramientas de Evaluaciones (Admin)
      </h1>
      <p className="mb-6 text-sm opacity-80">
        Reenvía mensajes pendientes a <b>progress-service</b> o{" "}
        <b>ai-advisor-service</b>.
      </p>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => run("progress")}
          disabled={loading !== null}
          className="rounded bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {loading === "progress"
            ? "Reintentando Progress…"
            : "Reintentar outbox (Progress)"}
        </button>
        <button
          onClick={() => run("advisor")}
          disabled={loading !== null}
          className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading === "advisor"
            ? "Reintentando Advisor…"
            : "Reintentar outbox (Advisor)"}
        </button>
      </div>
    </div>
  );
}
