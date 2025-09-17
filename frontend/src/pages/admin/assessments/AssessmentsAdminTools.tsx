// src/pages/admin/assessments/AssessmentsAdminTools.tsx
import {
  retryAdvisorOutbox,
  retryProgressOutbox,
} from "../../../services/assessmentsService";
import { useState } from "react";

export default function AssessmentsAdminTools() {
  const [loading, setLoading] = useState<"progress" | "advisor" | null>(null);
  const [result, setResult] = useState<string>("");

  const run = async (kind: "progress" | "advisor") => {
    setLoading(kind);
    setResult("");
    try {
      const msg =
        kind === "progress"
          ? await retryProgressOutbox(50)
          : await retryAdvisorOutbox(50);
      setResult(msg ?? "OK");
    } catch {
      setResult("Error al ejecutar reintentos");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">
        Assessments — Herramientas Admin
      </h1>
      <div className="flex gap-3">
        <button
          className="px-3 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
          onClick={() => run("progress")}
          disabled={loading !== null}
        >
          {loading === "progress"
            ? "Reintentando…"
            : "Reintentar Outbox Progress"}
        </button>
        <button
          className="px-3 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
          onClick={() => run("advisor")}
          disabled={loading !== null}
        >
          {loading === "advisor"
            ? "Reintentando…"
            : "Reintentar Outbox Advisor"}
        </button>
      </div>
      {result && <p className="mt-4 text-sm opacity-80">{result}</p>}
    </div>
  );
}
