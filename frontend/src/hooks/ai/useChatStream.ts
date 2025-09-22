import { useCallback, useRef, useState } from "react";
import { chatStream } from "../../services/aiService";
import type { ChatRequest, ChatSSEEvent } from "../../types/ai/Chat";

export type StartEvent = Extract<ChatSSEEvent, { event: "start" }>;

export type StartPayload = {
  question: string;
  grade?: string;
  subject?: "math" | "lang";
  objectiveId?: string;
  studentId?: string;
  studentContext?: Record<string, unknown>;
  bypassLLM?: boolean;
  onStart?: (evt: StartEvent) => void;
  onDeltaText?: (delta: string) => void;
  /** nuevo: recibes el texto completo generado */
  onEndEvt?: (
    evt: Extract<ChatSSEEvent, { event: "end" }>,
    finalText: string
  ) => void;
};

type UseChatStream = {
  loading: boolean;
  error: string | null;
  start: (args: StartPayload) => void;
  stop: () => void;
};

export function useChatStream(): UseChatStream {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ctrlRef = useRef<AbortController | null>(null);
  const accRef = useRef<string>(""); // acumulador del texto final

  const stop = useCallback(() => {
    if (ctrlRef.current) {
      ctrlRef.current.abort();
      ctrlRef.current = null;
    }
    setLoading(false);
  }, []);

  const start = useCallback((args: StartPayload) => {
    const {
      question,
      grade,
      subject,
      objectiveId,
      studentId,
      studentContext,
      bypassLLM,
      onStart,
      onDeltaText,
      onEndEvt,
    } = args;

    const q = (question ?? "").trim();
    if (!q) return;

    if (ctrlRef.current) {
      ctrlRef.current.abort();
      ctrlRef.current = null;
    }

    setError(null);
    setLoading(true);

    const ac = new AbortController();
    ctrlRef.current = ac;
    accRef.current = ""; // reset acumulador

    const body: ChatRequest = {
      question: q,
      grade,
      subject,
      objectiveId,
      studentId,
      studentContext,
      stream: true,
    };

    chatStream(
      body,
      (evtStart) => {
        if (ac.signal.aborted) return;
        onStart?.(evtStart);
      },
      (delta) => {
        if (ac.signal.aborted) return;
        if (delta) {
          accRef.current += delta;
          onDeltaText?.(delta);
        }
      },
      (evtEnd) => {
        if (ac.signal.aborted) return;
        const finalText = accRef.current;
        onEndEvt?.(evtEnd, finalText);
        setLoading(false);
        ctrlRef.current = null;
      },
      { bypassLLM: !!bypassLLM, signal: ac.signal }
    ).catch((e: unknown) => {
      if (ac.signal.aborted) return;
      const msg =
        e instanceof Error ? e.message : "Error en el streaming de IA.";
      setError(msg);
      setLoading(false);
      ctrlRef.current = null;
    });
  }, []);

  return { loading, error, start, stop };
}
