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

// 👇 avatar de CapiBOT
import capiGif from "../../../assets/capibaramini.gif";

const STREAM_DEFAULT = String(import.meta.env.VITE_CHAT_STREAM) === "true";
const MAX_LEN = 4000;

type Msg = { role: "user" | "assistant"; text: string };

/* ===== Helpers de contexto ===== */
function normalizeGrade(raw?: string | null): string | undefined {
  if (!raw) return undefined;
  const m = raw.match(/\d+/);
  return m ? m[0] : undefined; // "6°" -> "6"
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

/** Extrae un id plausible sin usar `any`, tolerando distintas formas de user. */
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

  // === Contexto del estudiante desde el currículo activo ===
  const curriculumId = getCurrentCurriculumId() ?? undefined;
  const { data: curr } = useCurriculumFullQuery(curriculumId ?? "");
  const grade = useMemo(() => normalizeGrade(curr?.grade ?? null), [curr]);
  const subject = useMemo(
    () => inferSubjectFromCurriculumName(curr?.name) ?? "math",
    [curr]
  );

  // === StudentId (opcional) desde auth — si no lo tenemos, el BE infiere por token ===
  const auth = useAuth();
  const studentId = extractUserIdSafe(auth);

  // === Streaming hook (SSE) ===
  const { loading, error, start, stop } = useChatStream();

  // Refs para control de conversación y deltas
  const conversationIdRef = useRef<string | null>(null);
  const liveIdxRef = useRef<number | null>(null);
  const assistantBufferRef = useRef<string>(""); // << acumulamos la respuesta completa del assistant

  // Enfocar input cuando termina una respuesta
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

  // ✅ FIN DEL STREAM: “congela” la burbuja viva y resetea refs
  useEffect(() => {
    if (loading) return;
    if (liveIdxRef.current == null) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    liveIdxRef.current = null;
  }, [loading]);

  // Cleanup al desmontar (evitar streams colgados)
  useEffect(() => {
    return () => stop();
  }, [stop]);

  // 🚀 Auto-cargar última conversación al entrar (si existe)
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
        setTimeout(
          () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
          0
        );
      } catch {
        // No hay conversación previa; está bien.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [curriculumId]);

  const handleSend = async () => {
    const q = question.trim();
    if (!q) return;

    if (!navigator.onLine) {
      showToast.warning(
        "Parece que estás sin conexión. Intenta cuando vuelvas a estar en línea."
      );
      return;
    }

    // 1) agrega mensaje del estudiante (UI)
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setQuestion("");
    setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
      0
    );

    try {
      // 2) persiste mensaje del estudiante
      if (!conversationIdRef.current) {
        // Nueva conversación → crea con SOLO el mensaje del usuario
        const conv = await createConversation({
          curriculumId,
          firstMessages: [{ role: "user", text: q }],
        });
        conversationIdRef.current = conv.id;
      } else {
        // Conversación existente → append del mensaje del usuario
        await appendConversationEvents({
          conversationId: conversationIdRef.current,
          messages: [{ role: "user", text: q }],
        });
      }
    } catch {
      // No bloqueamos la UX de chat si falla el guardado, pero avisamos.
      showToast.warning("No se pudo guardar el mensaje en el historial.");
    }

    if (useStream) {
      // 3) inserta burbuja viva del asistente y comienza stream
      setMessages((prev) => {
        const draft: Msg = { role: "assistant", text: "" };
        const next = [...prev, draft];
        liveIdxRef.current = next.length - 1;
        return next;
      });

      assistantBufferRef.current = ""; // reset buffer

      start({
        question: q,
        grade,
        subject,
        studentId,
        bypassLLM,
        onDeltaText: (delta) => {
          if (!delta) return;
          assistantBufferRef.current += delta; // acumulamos para persistir al final
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

          if (!finalText) return; // nada que guardar
          const convId = conversationIdRef.current;
          if (!convId) return; // debería existir

          try {
            await appendConversationEvents({
              conversationId: convId,
              messages: [{ role: "assistant", text: finalText }],
            });
          } catch {
            // No rompemos UX, solo avisamos suave.
            showToast.warning(
              "No se pudo guardar la respuesta en el historial."
            );
          }
        },
      });
    } else {
      // Fallback JSON: pedimos la respuesta completa y la fijamos al historial
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

        // Persistimos assistant
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

      {/* Historial de chat */}
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

      {/* Caja de entrada */}
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

/* ===== Burbuja de chat con avatar + Markdown ===== */
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
