import { useEffect, useMemo, useRef, useState } from "react";
import { showToast } from "../../../utils/showToast";
import { chatOnce } from "../../../services/aiService";
import { useChatStream } from "../../../hooks/ai/useChatStream";
import { MarkdownAnswer } from "../../../components/ui/MarkdownAnswer";
import { getCurrentCurriculumId } from "../../../services/curriculumService";
import { useCurriculumFullQuery } from "../../../hooks/useCurriculumFullQuery";
import { useAuth } from "../../../context/useAuth";

// 👇 avatar de CapiBOT
import capiGif from "../../../assets/capibaramini.gif";

const STREAM_DEFAULT = String(import.meta.env.VITE_CHAT_STREAM) === "true";
const MAX_LEN = 4000;

// 👇 Mensaje sin citaciones (para estudiantes no las mostramos)
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

export default function AdvisorChat() {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);

  const useStream = STREAM_DEFAULT;
  const bypassLLM = useDebugBypass(); // oculto: URL ?bypass=1 o localStorage ai:bypassLLM=1

  // === Contexto del estudiante desde el currículo activo (no se muestra) ===
  const currId = getCurrentCurriculumId();
  const { data: curr } = useCurriculumFullQuery(currId ?? "");
  const grade = useMemo(() => normalizeGrade(curr?.grade ?? null), [curr]);
  const subject = useMemo(
    () => inferSubjectFromCurriculumName(curr?.name) ?? "math",
    [curr]
  );

  // === StudentId (opcional) desde auth — si no lo tenemos, el BE infiere por token ===
  const auth = useAuth();
  const studentId = extractUserIdSafe(auth);

  // === Streaming hook (SSE) — usamos callbacks directos ===
  const { loading, error, start, stop } = useChatStream();

  // Índice de la “burbuja viva” del asistente que estamos rellenando con deltas
  const liveIdxRef = useRef<number | null>(null);

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

  // ✅ FIN DEL STREAM: “congela” la burbuja viva cuando loading cambia a false
  useEffect(() => {
    if (loading) return;
    if (liveIdxRef.current == null) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    liveIdxRef.current = null; // pasa a render con Markdown
  }, [loading]);

  // Cleanup en desmontaje (evitar streams colgados al cambiar de ruta)
  useEffect(() => {
    return () => stop();
  }, [stop]);

  const handleSend = async () => {
    const q = question.trim();
    if (!q) return;

    if (!navigator.onLine) {
      showToast.warning(
        "Parece que estás sin conexión. Intenta cuando vuelvas a estar en línea."
      );
      return;
    }

    // 1) agrega mensaje del estudiante
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setQuestion("");
    setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
      0
    );

    if (useStream) {
      // 2) inserta burbuja viva del asistente
      setMessages((prev) => {
        const draft: Msg = { role: "assistant", text: "" };
        const next = [...prev, draft];
        liveIdxRef.current = next.length - 1;
        return next;
      });

      // 3) inicia streaming y ACTUALIZA directamente la burbuja viva
      start({
        question: q,
        grade,
        subject,
        studentId, // 👈 si existe
        bypassLLM,
        // Ignoramos citaciones en UI del estudiante (no aportan aquí)
        onDeltaText: (delta) => {
          if (!delta) return;
          setMessages((prev) => {
            const idx = liveIdxRef.current;
            if (idx == null || idx < 0 || idx >= prev.length) return prev;
            const next = [...prev];
            const curr = next[idx];
            next[idx] = { ...curr, text: (curr.text || "") + delta };
            return next;
          });
        },
        onEndEvt: () => {
          // noop — dejamos que loading=false (hook) dispare el “congelado”
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

  const handleStop = () => stop();

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
