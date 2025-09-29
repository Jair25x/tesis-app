import { useEffect, useMemo, useRef, useState } from "react";
import { showToast } from "../../../utils/showToast";
import { chatOnce } from "../../../services/aiService";
import { useChatStream } from "../../../hooks/ai/useChatStream";
import { MarkdownAnswer } from "../../../components/ui/MarkdownAnswer";
import { getCurrentCurriculumId } from "../../../services/curriculumService";
import { useCurriculumFullQuery } from "../../../hooks/useCurriculumFullQuery";
import { useAuth } from "../../../context/useAuth";
import {
  createConversation,
  appendConversationEvents,
  getLatestConversation,
} from "../../../services/aiService";

import capiGif from "../../../assets/capibaramini.gif";

const STREAM_DEFAULT = String(import.meta.env.VITE_CHAT_STREAM) === "true";
const MAX_LEN = 4000;

type Msg = { role: "user" | "assistant"; text: string };

/* ===== Helpers de contexto ===== */
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
function draftKey(
  curriculumId?: string | null,
  conversationId?: string | null
): string {
  const c = curriculumId ?? "none";
  const conv = conversationId ?? "new";
  return `ai:chat:draft:${c}:${conv}`;
}

/** Activa bypass sólo si el equipo lo pide por URL o localStorage (no visible a estudiantes). */
function useDebugBypass(): boolean {
  const [bypass, setBypass] = useState<boolean>(false);
  useEffect(() => {
    try {
      const usp = new URLSearchParams(window.location.search);
      if (usp.has("bypass")) return setBypass(true);
      const ls = localStorage.getItem("ai:bypassLLM");
      setBypass(ls === "1" || ls === "true");
    } catch {
      /* noop */
    }
  }, []);
  return bypass;
}

/** Extrae un id plausible sin usar `any`. */
function extractUserIdSafe(source: unknown): string | undefined {
  if (!source || typeof source !== "object") return undefined;

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
  if ("id" in (source as Record<string, unknown>)) {
    const idVal = (source as { id?: unknown }).id;
    if (typeof idVal === "string" && idVal.trim().length > 0) return idVal;
  }
  if ("sub" in (source as Record<string, unknown>)) {
    const subVal = (source as { sub?: unknown }).sub;
    if (typeof subVal === "string" && subVal.trim().length > 0) return subVal;
  }
  return undefined;
}

export default function AdvisorChat() {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);

  const useStream = STREAM_DEFAULT;
  const bypassLLM = useDebugBypass();

  // === Contexto ===
  const curriculumId = getCurrentCurriculumId() ?? undefined;
  const { data: curr } = useCurriculumFullQuery(curriculumId ?? "");
  const grade = useMemo(() => normalizeGrade(curr?.grade ?? null), [curr]);
  const subject = useMemo(
    () => inferSubjectFromCurriculumName(curr?.name) ?? "math",
    [curr]
  );

  const auth = useAuth();
  const studentId = extractUserIdSafe(auth);

  // === Streaming hook (SSE) ===
  const { loading, error, start, stop } = useChatStream();

  // Refs control conversación y deltas
  const conversationIdRef = useRef<string | null>(null);
  const liveIdxRef = useRef<number | null>(null);
  const assistantBufferRef = useRef<string>("");

  // Focus al terminar
  useEffect(() => {
    if (!loading && inputRef.current) inputRef.current.focus();
  }, [loading]);

  // Errores de stream
  useEffect(() => {
    if (!error) return;
    if (error.includes("No se encontraron fuentes")) {
      showToast.warning(
        "No se encontraron fuentes del currículo. Reformula la pregunta o prueba otra."
      );
    } else if (error.includes("Demasiadas solicitudes")) {
      showToast.warning("Demasiadas solicitudes. Intenta en un momento.");
    } else if (error.includes("tardando más de lo esperado")) {
      showToast.warning("El servicio de IA demora. Intenta otra vez.");
    } else {
      showToast.error(error);
    }
  }, [error]);

  // Auto-scroll mientras hay stream
  useEffect(() => {
    if (loading) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [loading]);

  // Fin del stream
  useEffect(() => {
    if (loading) return;
    if (liveIdxRef.current == null) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    liveIdxRef.current = null;
  }, [loading]);

  // Cleanup
  useEffect(() => () => stop(), [stop]);

  // 🚀 Auto-cargar última conversación + restaurar borrador
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const conv = await getLatestConversation(curriculumId);
        if (cancelled || !conv) return;
        conversationIdRef.current = conv.id;

        const items: Msg[] = (conv.messages ?? []).map((m) => ({
          role: m.role,
          text: m.text,
        }));
        setMessages(items);

        // Restaurar borrador del input (sessionStorage)
        try {
          const dk = draftKey(curriculumId, conversationIdRef.current);
          const draft = sessionStorage.getItem(dk);
          if (draft && draft.length <= MAX_LEN) setQuestion(draft);
        } catch {
          /* noop */
        }

        setTimeout(
          () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
          0
        );
      } catch {
        // No hay conversación previa → limpia borrador "new"
        try {
          const dk = draftKey(curriculumId, null);
          const draft = sessionStorage.getItem(dk);
          if (draft && draft.length <= MAX_LEN) setQuestion(draft);
        } catch {
          /* noop */
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [curriculumId]);

  // Guardar borrador en sessionStorage (por conversación)
  useEffect(() => {
    try {
      const dk = draftKey(curriculumId, conversationIdRef.current);
      sessionStorage.setItem(dk, question);
    } catch {
      /* noop */
    }
  }, [question, curriculumId]);

  const handleSend = async () => {
    const q = question.trim();
    if (!q) return;

    if (!navigator.onLine) {
      showToast.warning(
        "Parece que estás sin conexión. Intenta cuando vuelvas a estar en línea."
      );
      return;
    }

    // UI: agrega mensaje del estudiante
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setQuestion("");
    setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
      0
    );

    // Limpia borrador de la clave actual
    try {
      const dk = draftKey(curriculumId, conversationIdRef.current);
      sessionStorage.removeItem(dk);
    } catch {
      /* noop */
    }

    try {
      // Persistencia: crear/append del mensaje del usuario
      if (!conversationIdRef.current) {
        const conv = await createConversation({
          curriculumId,
          firstMessages: [{ role: "user", text: q }],
        });
        conversationIdRef.current = conv.id;
      } else {
        await appendConversationEvents({
          conversationId: conversationIdRef.current,
          messages: [{ role: "user", text: q }],
        });
      }
    } catch {
      showToast.warning("No se pudo guardar el mensaje en el historial.");
    }

    if (useStream) {
      // Inserta burbuja viva del asistente y comienza stream
      setMessages((prev) => {
        const draft: Msg = { role: "assistant", text: "" };
        const next = [...prev, draft];
        liveIdxRef.current = next.length - 1;
        return next;
      });

      assistantBufferRef.current = "";

      start({
        question: q,
        grade,
        subject,
        studentId,
        bypassLLM,
        onDeltaText: (delta) => {
          if (!delta) return;
          assistantBufferRef.current += delta;
          setMessages((prev) => {
            const idx = liveIdxRef.current;
            if (idx == null || idx < 0 || idx >= prev.length) return prev;
            const next = [...prev];
            const curr = next[idx];
            next[idx] = { ...curr, text: (curr.text || "") + delta };
            return next;
          });
        },
        onEndEvt: async () => {
          const finalText = assistantBufferRef.current.trim();
          assistantBufferRef.current = "";
          if (!finalText) return;
          const convId = conversationIdRef.current;
          if (!convId) return;

          try {
            await appendConversationEvents({
              conversationId: convId,
              messages: [{ role: "assistant", text: finalText }],
            });
          } catch {
            showToast.warning(
              "No se pudo guardar la respuesta en el historial."
            );
          }
        },
      });
    } else {
      // Fallback JSON
      try {
        const res = await chatOnce(
          { question: q, grade, subject, studentId, stream: false },
          { bypassLLM }
        );
        const txt = (res.answer ?? "").trim();

        setMessages((prev) => [...prev, { role: "assistant", text: txt }]);
        setTimeout(
          () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
          0
        );

        const convId = conversationIdRef.current;
        if (convId && txt) {
          await appendConversationEvents({
            conversationId: convId,
            messages: [{ role: "assistant", text: txt }],
          });
        }
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : "Error en la conversación.";
        if (msg.includes("No se encontraron fuentes")) {
          showToast.warning(
            "No se encontraron fuentes del currículo. Reformula la pregunta o prueba otra."
          );
        } else if (msg.includes("Demasiadas solicitudes")) {
          showToast.warning("Demasiadas solicitudes. Intenta en un momento.");
        } else if (msg.includes("tardando más de lo esperado")) {
          showToast.warning("El servicio de IA demora. Intenta otra vez.");
        } else {
          showToast.error(msg);
        }
      }
    }
  };

  const handleStop = () => {
    stop();
  };

  const handleClear = () => {
    // Inicia una nueva conversación (la anterior queda persistida)
    try {
      const dk = draftKey(curriculumId, conversationIdRef.current);
      sessionStorage.removeItem(dk);
    } catch {
      /* noop */
    }
    conversationIdRef.current = null;
    setMessages([]);
    setQuestion("");
    showToast.success("Conversación reiniciada.");
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const remaining = MAX_LEN - question.length;

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-4">CapiBOT</h1>

      <div className="rounded-xl border p-4 md:p-5 h-[58vh] overflow-y-auto bg-white/60 dark:bg-gray-900/40">
        {messages.length === 0 && (
          <div className="text-sm text-muted-foreground">
            Hola, soy <strong>CapiBOT</strong>. ¡Pregúntame algo de tu curso!
          </div>
        )}

        <div className="space-y-4">
          {messages.map((m, idx) => {
            const streaming = liveIdxRef.current === idx;
            return (
              <ChatBubble
                key={idx}
                role={m.role}
                text={m.text}
                streaming={streaming}
              />
            );
          })}
        </div>

        <div ref={bottomRef} />
      </div>

      <div className="mt-4 rounded-xl border p-3 md:p-4">
        <label htmlFor="question" className="sr-only">
          Escribe tu pregunta
        </label>
        <textarea
          id="question"
          ref={inputRef}
          value={question}
          onKeyDown={handleKeyDown}
          onChange={(e) => {
            const v = e.target.value;
            if (v.length <= MAX_LEN) setQuestion(v);
          }}
          placeholder="Escribe tu pregunta… (Enter para enviar, Shift+Enter para nueva línea)"
          className="w-full min-h-[76px] rounded-lg border p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-background"
          aria-label="Caja de texto para la pregunta"
        />
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {remaining} / {MAX_LEN}
          </span>
          <div className="flex gap-2">
            {useStream && (
              <button
                onClick={handleStop}
                disabled={!loading}
                className="rounded-lg px-3 py-1.5 border hover:bg-muted transition disabled:opacity-50"
                title="Detener respuesta"
              >
                Detener
              </button>
            )}
            <button
              onClick={handleClear}
              className="rounded-lg px-3 py-1.5 border hover:bg-muted transition"
              title="Empezar nueva conversación"
            >
              Limpiar
            </button>
            <button
              onClick={handleSend}
              disabled={(useStream && loading) || !question.trim()}
              className="rounded-lg px-3 py-1.5 border hover:bg-muted transition"
            >
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatBubble(props: {
  role: "user" | "assistant";
  text: string;
  streaming?: boolean;
}) {
  const { role, text, streaming = false } = props;
  const isUser = role === "user";

  return (
    <div
      className={`flex items-start gap-3 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <img
          src={capiGif}
          alt="CapiBOT"
          className="w-10 h-10 rounded-full border object-cover"
        />
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow
        ${
          isUser
            ? "bg-blue-600 text-white rounded-br-none"
            : "bg-gray-100 dark:bg-gray-800 dark:text-gray-100 rounded-bl-none"
        }`}
        aria-live={streaming ? "polite" : undefined}
      >
        {isUser ? (
          <div className="whitespace-pre-wrap">{text}</div>
        ) : streaming ? (
          <div className="whitespace-pre-wrap">{text || "…"} </div>
        ) : (
          <div className="prose prose-sm max-w-none">
            <MarkdownAnswer text={text} />
          </div>
        )}
      </div>
    </div>
  );
}
