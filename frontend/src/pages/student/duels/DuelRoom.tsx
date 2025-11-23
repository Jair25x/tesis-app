// src/pages/student/duels/DuelRoom.tsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../../../context/useAuth";
import type {
  ServerMsg,
  DuelExercise,
  PlayerInfo,
} from "../../../types/duels/duels";
import { getExerciseForExam } from "../../../services/exerciseService";
import { getMatch } from "../../../services/duelsService";
import type { TemplateType } from "../../../types/exercise/TemplateSchemaResponse";
import { useDuelWs } from "../../../hooks/duels/useDuelWs";
import DuelExerciseRenderer from "../../../components/student/duels/DuelExerciseRenderer";

/* ---------------- Helpers ---------------- */

function getAccessToken(): string | null {
  try {
    return (
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken")
    );
  } catch {
    return null;
  }
}

/** Opciones para abrir WS: por matchId o por code */
type WsOpts =
  | { token: string; matchId: string; code?: undefined }
  | { token: string; matchId?: undefined; code: string };

/** Ejercicio completo (ya con templateType/params) */
function isCompleteExercise(ex: DuelExercise): ex is DuelExercise & {
  templateType: TemplateType;
  params: Record<string, unknown>;
} {
  return (
    typeof ex.templateType === "string" &&
    typeof ex.params === "object" &&
    ex.params !== null
  );
}

/** Extensión opcional (si el BE envía estos campos adicionales) */
type FinalRoundItemExt = {
  round: number;
  winnerId: string | null;
  noParticipation?: boolean;
};

type StateExtras = {
  code?: string;
  ready?: number;
  readyIds?: string[];
  players?: number;
  playersInfo?: PlayerInfo[];
  maxPlayers?: number;
};

type ServerStateMsgWithExtras = Extract<ServerMsg, { type: "state" }> &
  Partial<StateExtras>;
type ServerFinalMsgWithExtras = Extract<ServerMsg, { type: "final" }> & {
  playersInfo?: PlayerInfo[];
};

type ViewStatus = "WAITING" | "COUNTDOWN" | "ROUND" | "RESULTS";

/* ================================ Componente ================================ */

const DuelRoom: React.FC = () => {
  const { matchId: matchIdParam = "" } = useParams<{ matchId: string }>();
  const [search] = useSearchParams();
  const codeFromUrl = search.get("code") || undefined;

  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const myId: string = user?.id != null ? String(user.id) : "";

  const [status, setStatus] = useState<ViewStatus>("WAITING");
  const [round, setRound] = useState<number>(0);
  const [qIndex, setQIndex] = useState<number>(1);
  const [qTotal, setQTotal] = useState<number>(1);

  const [exercise, setExercise] = useState<DuelExercise | null>(null);
  const [exerciseHtml, setExerciseHtml] = useState<string | null>(null);

  const [score, setScore] = useState<Record<string, number>>({});
  const [finalWinner, setFinalWinner] = useState<string | null>(null);
  const [finalByRound, setFinalByRound] = useState<FinalRoundItemExt[]>([]);

  const [countdown, setCountdown] = useState<number>(0);
  const [sent, setSent] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingExerciseMeta, setLoadingExerciseMeta] = useState(false);
  const [exerciseLoadErr, setExerciseLoadErr] = useState<string | null>(null);

  // Meta del match (bestOf)
  const [bestOf, setBestOf] = useState<number | null>(null);

  // Lobby
  const [readyCount, setReadyCount] = useState<number | undefined>(undefined);
  const [readyIds, setReadyIds] = useState<Set<string>>(new Set());
  const [playersCount, setPlayersCount] = useState<number | undefined>(
    undefined
  );
  const [maxPlayers, setMaxPlayers] = useState<number | undefined>(undefined);

  // Nombres
  const [playersMap, setPlayersMap] = useState<Record<string, string>>({});

  // Timer por pregunta
  const deadlineRef = useRef<number | null>(null);
  const totalTimeMsRef = useRef<number>(0);
  const [timeLeftMs, setTimeLeftMs] = useState<number>(0);
  const timerRef = useRef<number | null>(null);

  const sentRef = useRef<boolean>(false);
  const autoSubmittedRef = useRef<boolean>(false);

  // UI: listo
  const [iAmReady, setIAmReady] = useState<boolean>(false);

  // Código corto
  const [shortCode, setShortCode] = useState<string | null>(
    codeFromUrl ?? null
  );

  // Progreso por sub-pregunta
  const [responded, setResponded] = useState<number>(0);
  const [respondedTotal, setRespondedTotal] = useState<number>(0);

  const token = getAccessToken() || "";

  // De-dupe de meta de ejercicio
  const lastExerciseKeyRef = useRef<string | null>(null);
  const inFlightRef = useRef<Record<string, boolean>>({ });
  const fetchAbortRef = useRef<AbortController | null>(null);

  // Montado (evitar setState tras unmount)
  const mountedRef = useRef<boolean>(false);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Habilitar WS hasta que haya resultados
  const wsEnabled = useMemo(
    () =>
      isAuthenticated &&
      token.length > 0 &&
      (Boolean(shortCode) || Boolean(matchIdParam)) &&
      status !== "RESULTS",
    [isAuthenticated, token, shortCode, matchIdParam, status]
  );

  const wsOpts: WsOpts = useMemo(() => {
    if (shortCode != null) return { code: shortCode, token };
    if (matchIdParam) return { matchId: matchIdParam, token };
    return { matchId: "", token };
  }, [shortCode, matchIdParam, token]);

  const { connected, lastMsg, send } = useDuelWs(wsOpts, wsEnabled);

  // medición local de duración
  const t0Ref = useRef<number>(0);
  const now = () =>
    typeof performance !== "undefined" ? performance.now() : Date.now();

  useEffect(() => {
    sentRef.current = sent;
  }, [sent]);

  // Validaciones básicas
  useEffect(() => {
    if (!isAuthenticated) {
      setError("No hay sesión activa. Inicia sesión para unirte al duelo.");
      return;
    }
    if (!token) {
      setError("No se encontró el token de acceso.");
      return;
    }
  }, [isAuthenticated, token]);

  // Resolver shortCode y bestOf si entro con :matchId
  useEffect(() => {
    const run = async () => {
      if (shortCode || !matchIdParam || !token) return;
      try {
        const m = await getMatch(matchIdParam, token);
        if (!mountedRef.current) return;
        if (m?.shortCode) setShortCode(m.shortCode);
        if (typeof m?.bestOf === "number") setBestOf(m.bestOf);
      } catch {
        // Silencioso: si falla, al menos el WS intentará resolver
      }
    };
    void run();
  }, [matchIdParam, shortCode, token]);

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      if (timerRef.current != null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      try {
        fetchAbortRef.current?.abort();
      } catch {
        /* noop */
      }
    };
  }, []);

  const normalizeStatus = (s: unknown): ViewStatus => {
    const v = typeof s === "string" ? s.toUpperCase() : "";
    if (
      v === "WAITING" ||
      v === "COUNTDOWN" ||
      v === "ROUND" ||
      v === "RESULTS"
    )
      return v;
    // fallback seguro
    return "WAITING";
  };

  const mergePlayersInfo = (list?: PlayerInfo[]) => {
    if (!list || list.length === 0) return;
    setPlayersMap((prev) => {
      const next = { ...prev };
      for (const p of list) {
        if (p && typeof p.id === "string") {
          const nm = (p.name || "").trim();
          if (nm) next[p.id] = nm;
          else if (!next[p.id]) next[p.id] = `Jugador ${p.id.slice(0, 4)}`;
        }
      }
      return next;
    });
  };

  // Envío de respuesta; congela qIndex
  const submitAnswer = useCallback(
    (
      answer: Record<string, unknown>,
      opts: { force?: boolean; auto?: boolean; qIndexAtSend?: number } = {}
    ): boolean => {
      const { force = false, auto = false } = opts;
      if (sentRef.current) return false;
      if (round <= 0) return false;

      const qIndexAtSend =
        typeof opts.qIndexAtSend === "number" && opts.qIndexAtSend > 0
          ? opts.qIndexAtSend
          : qIndex;
      if (!qIndexAtSend) return false;

      if (!force) {
        const deadlineMs = deadlineRef.current;
        if (deadlineMs && Date.now() >= deadlineMs) return false;
      }

      const t1 = now();
      const durationMs = Math.max(0, Math.round(t1 - t0Ref.current));

      send({ type: "answer", round, qIndex: qIndexAtSend, answer, durationMs });
      sentRef.current = true;
      autoSubmittedRef.current = auto;
      setSent(true);
      return true;
    },
    [round, qIndex, send]
  );

  // Reintento meta manual (con signal)
  const retryExerciseMeta = useCallback(() => {
    if (!exercise?.id) return;
    setExerciseLoadErr(null);
    setLoadingExerciseMeta(true);
    try {
      fetchAbortRef.current?.abort();
    } catch {
      /* noop */
    }
    fetchAbortRef.current = new AbortController();

    getExerciseForExam(exercise.id, fetchAbortRef.current.signal)
      .then((meta) => {
        if (!mountedRef.current) return;
        setExercise({
          id: exercise.id,
          templateType: meta.templateType,
          params: meta.parameters ?? {},
        });
        setExerciseHtml(meta.statementRendered ?? null);
      })
      .catch((err: unknown) => {
        if (!mountedRef.current) return;
        const name = (err as { name?: string })?.name;
        if (name === "CanceledError" || name === "AbortError") return;
        setExerciseLoadErr("No se pudo cargar el enunciado del ejercicio.");
      })
      .finally(() => {
        if (!mountedRef.current) return;
        setLoadingExerciseMeta(false);
      });
  }, [exercise?.id]);

  const submissionKey = useMemo(
    () =>
      exercise
        ? `duel:${
            shortCode || matchIdParam || "code"
          }:r${round}:q${qIndex}:ex:${exercise.id}`
        : `duel:pending`,
    [shortCode, matchIdParam, round, qIndex, exercise]
  );

  // Auto “ready” al reconectar si ya estabas listo
  useEffect(() => {
    if (!connected || iAmReady || status === "RESULTS") return;
    const res = send({ type: "ready" });
    if (!res.ok) {
      // no bloqueante
    }
  }, [connected, iAmReady, status, send]);

  // Manejo de mensajes WS (ya tipados)
  useEffect(() => {
    if (!lastMsg) return;

    switch (lastMsg.type) {
      case "answer_progress": {
        const sameRound = lastMsg.round === round;
        const sameQuestion = lastMsg.qIndex === qIndex;
        if (sameRound && sameQuestion) {
          setResponded(lastMsg.responded);
          setRespondedTotal(lastMsg.total);
        }
        break;
      }

      case "state": {
        const st = lastMsg as ServerStateMsgWithExtras;
        setStatus(normalizeStatus(st.status));
        if (typeof st.round === "number") setRound(st.round);
        if (typeof st.code === "string" && !shortCode) setShortCode(st.code);
        setReadyCount(typeof st.ready === "number" ? st.ready : undefined);
        setPlayersCount(
          typeof st.players === "number" ? st.players : undefined
        );
        setMaxPlayers(
          typeof st.maxPlayers === "number" ? st.maxPlayers : undefined
        );
        if (Array.isArray(st.readyIds)) setReadyIds(new Set(st.readyIds));
        if (Array.isArray(st.playersInfo)) mergePlayersInfo(st.playersInfo);
        break;
      }

      case "countdown": {
        setStatus("COUNTDOWN");
        setCountdown(lastMsg.sec);
        setIAmReady(false);
        setSent(false);
        setError(null);
        autoSubmittedRef.current = false;
        deadlineRef.current = null;
        if (timerRef.current != null) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setTimeLeftMs(0);
        setResponded(0);
        setRespondedTotal(0);
        break;
      }

      case "round_start": {
        setStatus("ROUND");
        setRound(lastMsg.round);
        setSent(false);
        setError(null);
        autoSubmittedRef.current = false;
        setIAmReady(false);
        setQIndex(lastMsg.qIndex ?? 1);
        setQTotal(lastMsg.qTotal ?? 1);
        t0Ref.current = now();

        setResponded(0);
        setRespondedTotal(0);

        // Tiempo por pregunta
        if (
          typeof lastMsg.deadline === "number" &&
          lastMsg.deadline > Date.now()
        ) {
          const deadlineMs = lastMsg.deadline;
          deadlineRef.current = deadlineMs;
          const total = deadlineMs - Date.now();
          totalTimeMsRef.current = total > 0 ? total : 0;
          setTimeLeftMs(totalTimeMsRef.current);

          if (timerRef.current != null) window.clearInterval(timerRef.current);
          timerRef.current = window.setInterval(() => {
            const rest = (deadlineRef.current ?? 0) - Date.now();
            const clamped = Math.max(0, rest);
            setTimeLeftMs(clamped);
            if (clamped <= 0 && timerRef.current != null) {
              window.clearInterval(timerRef.current);
              timerRef.current = null;
              if (!autoSubmittedRef.current && !sentRef.current) {
                const qFrozen = lastMsg.qIndex ?? qIndex;
                submitAnswer(
                  { value: null },
                  { force: true, auto: true, qIndexAtSend: qFrozen }
                );
              }
            }
          }, 250);
        } else {
          // ⬇️ sin deadline: permitir enviar normalmente
          deadlineRef.current = null;
          totalTimeMsRef.current = 0;
          if (timerRef.current != null) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
          }
          setTimeLeftMs(0);
        }

        // === DEDUPE de meta del ejercicio ===
        setExerciseLoadErr(null);
        const ex = lastMsg.exercise;
        const exId = ex.id;
        const key = `${lastMsg.round}:${lastMsg.qIndex ?? 1}:${exId}`;

        // mismo ejercicio → no repitas
        if (lastExerciseKeyRef.current === key) break;
        lastExerciseKeyRef.current = key;

        // aborta peticiones anteriores y prepara signal
        try {
          fetchAbortRef.current?.abort();
        } catch {
          /* noop */
        }
        fetchAbortRef.current = new AbortController();

        if (isCompleteExercise(ex)) {
          setExercise(ex);
          setExerciseHtml(null);
          break;
        }

        if (inFlightRef.current[key]) break;
        inFlightRef.current[key] = true;

        setLoadingExerciseMeta(true);
        getExerciseForExam(exId, fetchAbortRef.current.signal)
          .then((meta) => {
            if (!mountedRef.current) return;
            if (lastExerciseKeyRef.current !== key) return; // llegó otra pregunta antes
            setExercise({
              id: exId,
              templateType: meta.templateType,
              params: meta.parameters ?? {},
            });
            setExerciseHtml(meta.statementRendered ?? null);
          })
          .catch((err: unknown) => {
            if (!mountedRef.current) return;
            if (lastExerciseKeyRef.current !== key) return;
            const name = (err as { name?: string })?.name;
            if (name === "CanceledError" || name === "AbortError") return;
            setExercise({ id: exId });
            setExerciseHtml(null);
            setExerciseLoadErr("No se pudo cargar el enunciado del ejercicio.");
          })
          .finally(() => {
            if (!mountedRef.current) return;
            if (lastExerciseKeyRef.current === key) {
              setLoadingExerciseMeta(false);
            }
            inFlightRef.current[key] = false;
          });

        break;
      }

      case "round_end": {
        setSent(true);
        setScore(lastMsg.score);
        deadlineRef.current = null;
        if (timerRef.current != null) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setTimeLeftMs(0);
        setResponded(0);
        setRespondedTotal(0);
        try {
          if (submissionKey) {
            localStorage.removeItem(`duel:ans:${submissionKey}`);
          }
        } catch {
          /* noop */
        }
        break;
      }

      case "final": {
        const fm = lastMsg as ServerFinalMsgWithExtras;
        setStatus("RESULTS");
        setFinalWinner(fm.winnerId ?? null);

        const byR: FinalRoundItemExt[] = Array.isArray(fm.byRound)
          ? fm.byRound.map((r) => ({
              round: r.round,
              winnerId: r.winnerId ?? null,
              noParticipation:
                (r as { noParticipation?: boolean }).noParticipation === true
                  ? true
                  : undefined,
            }))
          : [];
        setFinalByRound(byR);

        setScore(fm.score);
        if (Array.isArray(fm.playersInfo)) mergePlayersInfo(fm.playersInfo);

        deadlineRef.current = null;
        if (timerRef.current != null) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setTimeLeftMs(0);
        setResponded(0);
        setRespondedTotal(0);
        break;
      }

      case "error": {
        const raw = String(lastMsg.message || "").toLowerCase();
        if (raw.includes("room full")) setError("La sala está llena.");
        else if (raw.includes("match running"))
          setError("El duelo ya está en curso.");
        else if (raw.includes("match finished"))
          setError("El duelo ya finalizó.");
        else if (raw.includes("match not found"))
          setError("No se encontró el duelo.");
        else setError(lastMsg.message);
        break;
      }
    }
  }, [
    lastMsg,
    shortCode,
    submitAnswer,
    qIndex,
    round,
    matchIdParam,
    submissionKey,
  ]);

  const onReady = () => {
    if (iAmReady) return;
    const res = send({ type: "ready" });
    if (!res.ok) return;
    setIAmReady(true);
  };

  const onSubmit = (answer: Record<string, unknown>) => {
    const qFrozen = qIndex;
    submitAnswer(answer, { qIndexAtSend: qFrozen });
  };

  // Scoreboard
  const entries = useMemo(() => {
    const ids = Object.keys(score);
    return ids
      .map((id) => ({ id, points: score[id] ?? 0 }))
      .sort((a, b) => b.points - a.points);
  }, [score]);

  const displayName = useCallback(
    (id: string) =>
      id === myId ? "Tú" : playersMap[id] || `${id.slice(0, 8)}…`,
    [myId, playersMap]
  );

  const meScore = useMemo(() => (myId ? score[myId] ?? 0 : 0), [score, myId]);
  const oppScore = useMemo(() => {
    const ids = Object.keys(score);
    const other = ids.find((id) => id !== myId);
    return other ? score[other] ?? 0 : 0;
  }, [score, myId]);

  const matchLabel = shortCode
    ? `Código: ${shortCode}${bestOf ? ` · Mejor de ${bestOf}` : ""}`
    : matchIdParam
    ? `Match: ${matchIdParam}${bestOf ? ` · Mejor de ${bestOf}` : ""}`
    : bestOf
    ? `Mejor de ${bestOf}`
    : "";

  // Tiempo
  const fmtTime = (ms: number) => {
    const sec = Math.ceil(ms / 1000);
    const s = Math.max(0, sec);
    const mm = Math.floor(s / 60);
    const ss = s % 60;
    return `${mm}:${ss.toString().padStart(2, "0")}`;
  };

  const progressPct = useMemo(() => {
    if (!totalTimeMsRef.current || timeLeftMs <= 0) return 0;
    const used = totalTimeMsRef.current - timeLeftMs;
    return Math.min(100, Math.max(0, (used / totalTimeMsRef.current) * 100));
  }, [timeLeftMs]);

  const lobbyPlayers = useMemo(
    () =>
      Object.entries(playersMap).map(([id, name]) => ({
        id,
        name: id === myId ? "Tú" : name || `${id.slice(0, 8)}…`,
        ready: readyIds.has(id),
      })),
    [playersMap, readyIds, myId]
  );

  const respondedPct = useMemo(() => {
    if (respondedTotal <= 0) return 0;
    return Math.min(100, Math.max(0, (responded / respondedTotal) * 100));
  }, [responded, respondedTotal]);

  const statusLabel = (() => {
    switch (status) {
      case "WAITING":
        return "En sala";
      case "COUNTDOWN":
        return "Preparados...";
      case "ROUND":
        return "Respondiendo";
      case "RESULTS":
        return "Resultados";
      default:
        return status;
    }
  })();

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl flex-col p-4">
      {/* Header sticky en móvil */}
      <header className="sticky top-0 z-10 mb-3 flex items-center justify-between gap-3 border-b bg-gray-50/80 pb-2 backdrop-blur dark:border-gray-800 dark:bg-gray-900/80 sm:static sm:border-0 sm:bg-transparent sm:pb-0 sm:backdrop-blur-none">
        <div>
          <h1 className="text-lg font-bold sm:text-2xl">⚔️ Duelo</h1>
          {matchLabel && (
            <p className="text-[11px] text-gray-500 sm:text-xs">{matchLabel}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 text-[11px] sm:flex-row sm:items-center sm:text-xs">
          {/* Estado de conexión solo mientras el duelo no ha terminado */}
          {status !== "RESULTS" && (
            <span
              className={`rounded-full px-2.5 py-1 ${
                connected
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}
              aria-live="polite"
            >
              {connected ? "Conectado" : "Reconectando…"}
            </span>
          )}
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-800 dark:bg-blue-900/30 dark:text-blue-100">
            {status === "RESULTS" ? "Duelo finalizado" : statusLabel}
          </span>
          {status !== "RESULTS" && (
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-100">
              {meScore} — {oppScore}
            </span>
          )}
        </div>
      </header>

      {!!error && (
        <div
          className="mb-3 rounded-md border border-rose-300 bg-rose-50 p-2 text-sm text-rose-800 dark:border-rose-700 dark:bg-rose-900/20 dark:text-rose-100"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Si no hay sesión, no sigas renderizando lógica de duelo */}
      {!isAuthenticated || !token ? (
        <div className="mt-4 rounded-xl border bg-white p-4 text-sm dark:border-gray-700 dark:bg-gray-800">
          Inicia sesión para poder unirte a un duelo.
        </div>
      ) : (
        <>
          {/* Scoreboard N jugadores (mientras no haya resultados finales) */}
          {Object.keys(score).length > 0 && status !== "RESULTS" && (
            <section className="mb-3">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {entries.map((e, idx) => (
                  <div
                    key={e.id}
                    className={`rounded-lg border p-3 text-sm dark:border-gray-700 ${
                      e.id === myId
                        ? "bg-emerald-50 dark:bg-emerald-900/10"
                        : "bg-white dark:bg-gray-800"
                    }`}
                    title={e.id}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] opacity-70">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <span className="text-lg font-bold">{e.points}</span>
                    </div>
                    <div className="mt-1 truncate text-xs opacity-80">
                      {displayName(e.id)}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {status === "WAITING" && (
            <div className="rounded-xl border bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-2 text-base">Esperando jugadores…</div>
              {(playersCount || readyCount || maxPlayers) && (
                <div className="mb-2 text-xs opacity-80 sm:text-sm">
                  Conectados:{" "}
                  <b>{playersCount ?? Object.keys(playersMap).length}</b>
                  {typeof maxPlayers === "number" ? (
                    <>
                      {" "}
                      / <b>{maxPlayers}</b>
                    </>
                  ) : null}
                  {" · "} Listos: <b>{readyCount ?? readyIds.size}</b>
                </div>
              )}

              {/* Lista de conectados */}
              {lobbyPlayers.length > 0 && (
                <ul className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {lobbyPlayers.map((p) => (
                    <li
                      key={p.id}
                      className={`flex items-center justify-between rounded-md border px-3 py-2 text-sm dark:border-gray-700 ${
                        p.id === myId
                          ? "bg-emerald-50 dark:bg-emerald-900/10"
                          : "bg-white dark:bg-gray-800"
                      }`}
                    >
                      <span className="truncate">{p.name}</span>
                      <span
                        className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                          p.ready
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-200"
                        }`}
                        title={p.ready ? "Listo" : "No listo"}
                        aria-label={p.ready ? "Listo" : "No listo"}
                      >
                        {p.ready ? "✔ Listo" : "Pendiente"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <p className="mb-3 text-sm opacity-80">
                Comparte el enlace o el código y pulsa “¡Estoy listo!” cuando
                todos estén en la sala.
              </p>

              {/* Panel compartir */}
              <div className="mb-3 flex flex-col gap-2">
                {shortCode ? (
                  <>
                    <div className="text-sm">
                      Código: <b className="font-mono">{shortCode}</b>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <input
                        readOnly
                        className="w-full rounded border px-2 py-2 text-xs dark:border-gray-700 dark:bg-gray-900 sm:text-sm"
                        value={
                          shortCode
                            ? `${
                                window.location.origin
                              }/student/duels/join?code=${encodeURIComponent(
                                shortCode
                              )}`
                            : ""
                        }
                        aria-label="Enlace para compartir"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="rounded bg-gray-800 px-3 py-2 text-xs text-white hover:bg-black"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(
                                `${
                                  window.location.origin
                                }/student/duels/join?code=${encodeURIComponent(
                                  shortCode ?? ""
                                )}`
                              );
                            } catch {
                              /* noop */
                            }
                          }}
                        >
                          Copiar
                        </button>
                        <button
                          type="button"
                          className="rounded bg-indigo-600 px-3 py-2 text-xs text-white hover:bg-indigo-700"
                          onClick={async () => {
                            const link = shortCode
                              ? `${
                                  window.location.origin
                                }/student/duels/join?code=${encodeURIComponent(
                                  shortCode
                                )}`
                              : null;
                            if (!link) return;
                            try {
                              if (navigator.share) {
                                await navigator.share({
                                  title: "Únete a mi duelo",
                                  text: "Entra con este enlace:",
                                  url: link,
                                });
                              } else {
                                await navigator.clipboard.writeText(link);
                              }
                            } catch {
                              /* noop */
                            }
                          }}
                        >
                          Compartir
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-xs opacity-60">Generando código…</div>
                )}
              </div>

              <button
                type="button"
                className={`rounded-lg px-4 py-2 text-white focus-visible:ring-2 focus-visible:ring-offset-2 ${
                  iAmReady
                    ? "bg-emerald-600"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
                onClick={onReady}
                disabled={!connected || iAmReady}
                aria-disabled={!connected || iAmReady}
              >
                {iAmReady ? "¡Listo! ✔" : "¡Estoy listo!"}
              </button>
            </div>
          )}

          {status === "COUNTDOWN" && (
            <div
              className="mt-2 rounded-xl border bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-800"
              aria-live="polite"
            >
              <div className="text-base">La ronda comienza en…</div>
              <div className="text-5xl font-extrabold">{countdown}</div>
            </div>
          )}

          {status === "ROUND" && (
            <div className="mt-2 space-y-3" aria-live="polite">
              {/* Banner de tiempo */}
              {timeLeftMs > 0 && (
                <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                  <div className="mb-1 flex items-center justify-between text-xs sm:text-sm">
                    <span className="opacity-80">Tiempo restante</span>
                    <span className="font-semibold">{fmtTime(timeLeftMs)}</span>
                  </div>
                  <div className="h-2 w-full rounded bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-2 rounded bg-emerald-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              )}

              {sent && (
                <div className="rounded-md border border-emerald-200 bg-emerald-50 p-2 text-xs text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200 sm:text-sm">
                  Respuesta enviada — esperando al resto…
                </div>
              )}

              {/* Progreso global (barra + contador) */}
              {(responded > 0 || respondedTotal > 0) && (
                <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="opacity-80">Respuestas recibidas</span>
                    <span className="font-mono">
                      {responded}/{respondedTotal}
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-2 rounded bg-blue-500 transition-all"
                      style={{ width: `${respondedPct}%` }}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(respondedPct)}
                      role="progressbar"
                      aria-label="Progreso de respuestas de los participantes"
                    />
                  </div>
                </div>
              )}

              {/* Fin de tiempo */}
              {timeLeftMs <= 0 && deadlineRef.current && !sent && (
                <div className="rounded-md border border-amber-300 bg-amber-50 p-2 text-xs text-amber-800 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-200 sm:text-sm">
                  Se acabó el tiempo para esta pregunta.
                </div>
              )}

              <div className="text-sm opacity-70">
                Ronda {round}
                {qTotal > 1 ? ` — Pregunta ${qIndex}/${qTotal}` : null}
              </div>

              {loadingExerciseMeta ||
              !exercise?.id ||
              !exercise.templateType ||
              !exercise.params ? (
                <div className="rounded-md border bg-white p-4 text-sm opacity-80 dark:border-gray-700 dark:bg-gray-800">
                  {exerciseLoadErr ? (
                    <div>
                      <div className="mb-2 text-rose-700 dark:text-rose-300">
                        {exerciseLoadErr}
                      </div>
                      <button
                        type="button"
                        className="rounded bg-rose-600 px-3 py-1.5 text-xs text-white hover:bg-rose-700"
                        onClick={retryExerciseMeta}
                      >
                        Reintentar
                      </button>
                    </div>
                  ) : (
                    "Cargando ejercicio…"
                  )}
                </div>
              ) : (
                <DuelExerciseRenderer
                  templateType={exercise.templateType}
                  params={exercise.params}
                  submissionKey={submissionKey}
                  onSubmit={onSubmit}
                  disabled={
                    !(
                      status === "ROUND" &&
                      !sent &&
                      (timeLeftMs > 0 || !deadlineRef.current)
                    )
                  }
                  statementHtml={exerciseHtml}
                />
              )}
            </div>
          )}

          {status === "RESULTS" && (
            <div className="mt-3 rounded-2xl border bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-6">
              {/* Encabezado resultados */}
              <div className="mb-4 text-center">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Resultados del duelo
                </div>
                <div className="mt-1 text-2xl font-bold sm:text-3xl">
                  {finalWinner
                    ? finalWinner === myId
                      ? "¡Ganaste! 🏆"
                      : `${displayName(finalWinner)} ganó 🏆`
                    : "¡Empate! 🤝"}
                </div>
                {matchLabel && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {matchLabel} · {entries.length} jugador
                    {entries.length === 1 ? "" : "es"}
                  </p>
                )}
              </div>

              {/* Leaderboard final bonito */}
              {entries.length > 0 && (
                <div className="mb-4">
                  <div className="mb-2 text-sm font-semibold">
                    Clasificación
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {entries.map((e, idx) => {
                      const isMe = e.id === myId;
                      const isWinner = finalWinner
                        ? e.id === finalWinner
                        : idx === 0;
                      const medal =
                        idx === 0
                          ? "🥇"
                          : idx === 1
                          ? "🥈"
                          : idx === 2
                          ? "🥉"
                          : null;
                      return (
                        <div
                          key={e.id}
                          className={`rounded-lg border p-3 text-sm transition dark:border-gray-700 ${
                            isWinner
                              ? "bg-emerald-50 ring-1 ring-emerald-400 dark:bg-emerald-900/20"
                              : isMe
                              ? "bg-indigo-50 dark:bg-indigo-900/20"
                              : "bg-white dark:bg-gray-800"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold dark:border-gray-600">
                                {idx + 1}
                              </span>
                              <div className="flex flex-col">
                                <span className="flex items-center gap-1 truncate">
                                  {displayName(e.id)}
                                  {medal && (
                                    <span className="text-base leading-none">
                                      {medal}
                                    </span>
                                  )}
                                </span>
                                {isMe && (
                                  <span className="text-[11px] text-indigo-600 dark:text-indigo-300">
                                    Eres tú
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="text-lg font-bold">
                              {e.points}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Resumen por ronda */}
              {finalByRound.length > 0 && (
                <div className="rounded-xl bg-gray-50 p-3 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-200 sm:text-sm">
                  <div className="mb-1 font-semibold">Resumen por ronda</div>
                  <ul className="list-inside list-disc space-y-1">
                    {finalByRound.map((r) => (
                      <li key={r.round}>
                        <span className="font-medium">Ronda {r.round}:</span>{" "}
                        {r.noParticipation
                          ? "nadie respondió"
                          : r.winnerId
                          ? r.winnerId === myId
                            ? "tú ganaste esta ronda"
                            : `${displayName(r.winnerId)} ganó esta ronda`
                          : "empate"}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Botones de salida */}
              <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => navigate("/student/duels/hub")}
                  className="w-full rounded-xl border px-4 py-2 text-sm transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 sm:w-auto"
                >
                  Volver al Hub de duelos
                </button>
                {shortCode && (
                  <button
                    type="button"
                    onClick={async () => {
                      const link = `${
                        window.location.origin
                      }/student/duels/join?code=${encodeURIComponent(
                        shortCode
                      )}`;
                      try {
                        if (navigator.share) {
                          await navigator.share({
                            title: "Resultados del duelo",
                            text: "Te comparto el código del duelo que jugamos:",
                            url: link,
                          });
                        } else {
                          await navigator.clipboard.writeText(link);
                        }
                      } catch {
                        /* noop */
                      }
                    }}
                    className="w-full rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                  >
                    Compartir código
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Aviso de reconexión: SOLO mientras el duelo no ha terminado */}
          {!connected && wsEnabled && status !== "RESULTS" && (
            <div className="mt-3 rounded-md border border-amber-300 bg-amber-50 p-2 text-xs text-amber-800 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-200">
              Reconectando con el servidor… Si tarda, revisa tu conexión o
              recarga la página.
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DuelRoom;
