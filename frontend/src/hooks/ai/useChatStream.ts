import { useEffect, useRef, useState } from "react";
import { chatStream } from "../../services/aiService";
import type { Citation } from "../../types/ai/Chat";

export type StartEvent = {
  citations?: Citation[];
  // Puedes ampliar si quieres: meta, model, etc.
  // meta?: { ranking?: Array<unknown> }
  // model?: string
};

export type StartPayload = {
  question: string;
  grade?: string;
  subject?: string;
  objectiveId?: string;
  /** Nuevos: soportados por el backend */
  studentId?: string;
  studentContext?: Record<string, unknown>;
  bypassLLM?: boolean;
  // 🔽 Callbacks opcionales
  onStart?: (evt: StartEvent) => void;
  onDeltaText?: (delta: string) => void;
  onEndEvt?: () => void;
};

export function useChatStream() {
  // Estado interno (back-compat con pantallas que leen desde el hook)
  const [answer, setAnswer] = useState("");
  const [citations, setCitations] = useState<Citation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Control de abort
  const abortRef = useRef<AbortController | null>(null);

  // Buffer + RAF para no re-render por caracter si NO usan callback onDeltaText
  const bufferRef = useRef<string>("");
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const loop = () => {
      if (bufferRef.current.length > 0) {
        setAnswer((prev) => prev + bufferRef.current);
        bufferRef.current = "";
      }
      rafRef.current = window.requestAnimationFrame(loop);
    };
    rafRef.current = window.requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const start = (payload: StartPayload) => {
    const {
      question,
      grade,
      subject,
      objectiveId,
      studentId,
      studentContext,
      bypassLLM,
    } = payload;

    if (!question.trim()) return;

    // reset
    setAnswer("");
    setCitations([]);
    setError(null);
    setLoading(true);

    // cancela anterior
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    chatStream(
      {
        question,
        grade,
        subject,
        objectiveId,
        studentId, // 👈 propagado
        studentContext, // 👈 propagado
        stream: true,
      },
      // onStart
      (evt) => {
        // invoca callback del consumer (si existe)
        if (payload.onStart) payload.onStart(evt);
        // back-compat: alimenta estado interno
        if (evt?.citations) setCitations(evt.citations);
      },
      // onDelta
      (delta) => {
        if (payload.onDeltaText) {
          payload.onDeltaText(delta);
        } else {
          // back-compat: alimentar answer interno por buffer
          bufferRef.current += delta;
        }
      },
      // onEnd
      () => {
        // última descarga del buffer a estado interno
        if (bufferRef.current.length > 0) {
          setAnswer((prev) => prev + bufferRef.current);
          bufferRef.current = "";
        }
        if (payload.onEndEvt) payload.onEndEvt();
        setLoading(false);
      },
      // options
      { bypassLLM, signal: ac.signal }
    ).catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : "Error en el chat.";
      // eslint-disable-next-line no-console
      console.error(err);
      setError(msg);
      setLoading(false);
    });
  };

  const stop = () => {
    abortRef.current?.abort();
    setLoading(false);
  };

  return { answer, citations, loading, error, start, stop };
}
