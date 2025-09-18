import { useEffect, useMemo, useRef, useState } from "react";
import { showToast } from "../../../utils/showToast";
import { chatOnce } from "../../../services/aiService";
import {
  useChatStream,
  type StartEvent,
} from "../../../hooks/ai/useChatStream";
import AdvisorCitations from "../../../components/student/AdvisorCitations";
import type { Citation } from "../../../types/ai/Chat";
import { MarkdownAnswer } from "../../../components/ui/MarkdownAnswer";
import { getCurrentCurriculumId } from "../../../services/curriculumService";
import { useCurriculumFullQuery } from "../../../hooks/useCurriculumFullQuery";
import { useAuth } from "../../../context/useAuth";

const STREAM_DEFAULT = String(import.meta.env.VITE_CHAT_STREAM) === "true";
// El backend limita a 4000, mantenemos consistente
const MAX_LEN = 4000;

function normalizeGrade(raw?: string | null): string | undefined {
  if (!raw) return undefined;
  const m = raw.match(/\d+/);
  return m ? m[0] : undefined;
}
function inferSubjectFromCurriculumName(
  name?: string
): "math" | "lang" | undefined {
  if (!name) return undefined;
  const n = name.toLowerCase();
  if (n.includes("mate")) return "math";
  if (n.includes("leng") || n.includes("comunica")) return "lang";
  return undefined;
}

/** Extrae un id plausible sin usar `any`, tolerando distintas formas de user. */
function extractUserIdSafe(source: unknown): string | undefined {
  if (!source || typeof source !== "object") return undefined;

  // Caso 1: { user: { id } }
  if ("user" in source) {
    const u = (source as { user?: unknown }).user;
    if (u && typeof u === "object" && "id" in (u as Record<string, unknown>)) {
      const idVal = (u as { id?: unknown }).id;
      if (typeof idVal === "string" && idVal.trim().length > 0) return idVal;
    }
    if (u && typeof u === "object" && "sub" in (u as Record<string, unknown>)) {
      const subVal = (u as { sub?: unknown }).sub;
      if (typeof subVal === "string" && subVal.trim().length > 0) return subVal;
    }
  }

  // Caso 2: { id } directamente
  if ("id" in (source as Record<string, unknown>)) {
    const idVal = (source as { id?: unknown }).id;
    if (typeof idVal === "string" && idVal.trim().length > 0) return idVal;
  }

  // Caso 3: { sub } (JWT claims)
  if ("sub" in (source as Record<string, unknown>)) {
    const subVal = (source as { sub?: unknown }).sub;
    if (typeof subVal === "string" && subVal.trim().length > 0) return subVal;
  }

  return undefined;
}

export default function AdminAdvisorChat() {
  const [question, setQuestion] = useState("");
  const [useStream, setUseStream] = useState<boolean>(STREAM_DEFAULT);
  const [bypassLLM, setBypassLLM] = useState<boolean>(false);

  // Estado para stream (usamos los callbacks)
  const [streamAnswer, setStreamAnswer] = useState<string>("");
  const [streamCitations, setStreamCitations] = useState<Citation[]>([]);

  // Estado para no-stream
  const [answerOnce, setAnswerOnce] = useState<string>("");
  const [onceCitations, setOnceCitations] = useState<Citation[]>([]);

  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Contexto
  const currId = getCurrentCurriculumId();
  const { data: curr } = useCurriculumFullQuery(currId ?? "");
  const grade = useMemo(() => normalizeGrade(curr?.grade ?? null), [curr]);
  const subject = useMemo(
    () => inferSubjectFromCurriculumName(curr?.name) ?? "math",
    [curr]
  );

  // StudentId (opcional) — si el admin es también estudiante o para pruebas
  const auth = useAuth();
  const studentId = extractUserIdSafe(auth);

  // Hook stream (leemos solo loading/error/controles)
  const { loading, error, start, stop } = useChatStream();

  // Foco al terminar
  useEffect(() => {
    if (!loading && inputRef.current) inputRef.current.focus();
  }, [loading]);

  // Limpia cuando se desmonta
  useEffect(() => {
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Si apagas streaming mientras estaba respondiendo → corta
  useEffect(() => {
    if (!useStream) stop();
  }, [useStream, stop]);

  // UX de errores
  useEffect(() => {
    if (!error) return;
    if (error.includes("No se encontraron fuentes")) {
      showToast.warning("No se encontraron fuentes del currículo.");
    } else if (error.includes("Demasiadas solicitudes")) {
      showToast.warning("Rate limit. Intenta luego.");
    } else if (error.includes("tardando más de lo esperado")) {
      showToast.warning("Servidor lento. Reintenta.");
    } else {
      showToast.error(error);
    }
  }, [error]);

  const handleSend = async () => {
    const q = question.trim();
    if (!q) return;
    if (!navigator.onLine) {
      showToast.warning("Sin conexión.");
      return;
    }
    if (q.length > MAX_LEN) {
      showToast.warning(`La pregunta excede ${MAX_LEN} caracteres.`);
      return;
    }

    if (useStream) {
      // Reset del panel stream
      setStreamAnswer("");
      setStreamCitations([]);

      start({
        question: q,
        grade,
        subject,
        studentId, // 👈 si existe
        bypassLLM,
        onStart: (evt: StartEvent) => {
          if (evt?.citations && evt.citations.length > 0) {
            setStreamCitations(evt.citations);
          }
        },
        onDeltaText: (delta: string) => {
          setStreamAnswer((prev) => prev + delta);
        },
        onEndEvt: () => {
          // opcional: métricas/logs
        },
      });
    } else {
      try {
        setAnswerOnce("");
        setOnceCitations([]);
        const res = await chatOnce(
          { question: q, grade, subject, studentId, stream: false },
          { bypassLLM }
        );
        setAnswerOnce(res.answer ?? "");
        setOnceCitations(res.citations || []);
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : "Error en la conversación.";
        showToast.error(msg);
      }
    }
  };

  const handleStop = () => stop();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">CapiBOT (Debug)</h1>
      <p className="text-sm text-muted-foreground mb-4">
        Streaming y Bypass LLM visibles. Contexto: grado {grade ?? "—"} ·{" "}
        {subject === "math"
          ? "Matemática"
          : subject === "lang"
          ? "Comunicación"
          : "—"}
      </p>

      <div className="rounded-xl border p-4 space-y-3">
        <textarea
          ref={inputRef}
          value={question}
          onChange={(e) =>
            e.target.value.length <= MAX_LEN && setQuestion(e.target.value)
          }
          placeholder="Pregunta…"
          className="w-full min-h-[96px] rounded-lg border p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-background"
        />

        <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                className="accent-blue-600"
                checked={useStream}
                onChange={(e) => setUseStream(e.target.checked)}
              />
              Streaming
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                className="accent-blue-600"
                checked={bypassLLM}
                onChange={(e) => setBypassLLM(e.target.checked)}
              />
              Bypass LLM (debug)
            </label>
          </div>
          <span>
            {question.length} / {MAX_LEN}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSend}
            disabled={(useStream && loading) || !question.trim()}
            className="rounded-lg px-4 py-2 border hover:bg-muted transition"
          >
            Enviar
          </button>
          {useStream && (
            <button
              onClick={handleStop}
              disabled={!loading}
              className="rounded-lg px-4 py-2 border hover:bg-muted transition"
            >
              Detener
            </button>
          )}
        </div>
      </div>

      {/* Panel de respuesta */}
      <div className="mt-6 rounded-xl border p-4">
        <div className="text-sm text-muted-foreground mb-2">
          {useStream
            ? loading
              ? "Respondiendo..."
              : streamAnswer
              ? "Respuesta (stream)"
              : "Esperando…"
            : answerOnce
            ? "Respuesta"
            : "Esperando…"}
        </div>

        {useStream ? (
          <>
            <MarkdownAnswer text={streamAnswer || (loading ? "…" : "")} />
            {streamCitations.length > 0 && (
              <div className="mt-3">
                <AdvisorCitations citations={streamCitations} />
              </div>
            )}
          </>
        ) : (
          <>
            <MarkdownAnswer text={answerOnce} />
            {onceCitations.length > 0 && (
              <div className="mt-3">
                <AdvisorCitations citations={onceCitations} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
