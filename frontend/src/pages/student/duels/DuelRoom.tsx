import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../../../context/useAuth";
import { useDuelWs } from "../../../hooks/duels/useDuelWs";
import type {
  ServerMsg,
  DuelExercise,
  PlayerInfo,
} from "../../../types/duels/duels";
import DuelExerciseRenderer from "../../../components/student/duels/DuelExerciseRenderer";
import { getExerciseForExam } from "../../../services/exerciseService";
import { getMatch } from "../../../services/duelsService";
import type { TemplateType } from "../../../types/exercise/TemplateSchemaResponse";

/* === Helpers === */
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

/** Opciones para abrir WS: por matchId o por código corto */
type WsOpts =
  | { token: string; matchId: string; code?: undefined }
  | { token: string; matchId?: undefined; code: string };

/** Type guard: ejercicio “completo” (ya trae templateType/params) */
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

/** Extensión local para soportar un posible flag noParticipation del backend */
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
  StateExtras;
type ServerFinalMsgWithExtras = Extract<ServerMsg, { type: "final" }> & {
  playersInfo?: PlayerInfo[];
};

const DuelRoom: React.FC = () => {
  const { matchId: matchIdParam = "" } = useParams<{ matchId: string }>();
  const [search] = useSearchParams();
  const codeFromUrl = search.get("code") || undefined;

  const { user, isAuthenticated } = useAuth();
  const myId: string = user?.id != null ? String(user.id) : "";

  const [status, setStatus] = useState<
    "WAITING" | "COUNTDOWN" | "ROUND" | "RESULTS"
  >("WAITING");
  const [round, setRound] = useState<number>(0);
  const [qIndex, setQIndex] = useState<number>(1);
  const [qTotal, setQTotal] = useState<number>(1);

  const [exercise, setExercise] = useState<DuelExercise | null>(null);
  const [exerciseHtml, setExerciseHtml] = useState<string | null>(null);

  const [score, setScore] = useState<Record<string, number>>({});
  const [finalWinner, setFinalWinner] = useState<string | null>(null);
  const [finalByRound, setFinalByRound] = useState<
    Array<{ round: number; winnerId: string | null; noParticipation?: boolean }>
  >([]);

  const [countdown, setCountdown] = useState<number>(0);
  const [sent, setSent] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingExerciseMeta, setLoadingExerciseMeta] = useState(false);
  const [exerciseLoadErr, setExerciseLoadErr] = useState<string | null>(null);

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

  // UI: listo
  const [iAmReady, setIAmReady] = useState<boolean>(false);

  // Código corto
  const [shortCode, setShortCode] = useState<string | null>(
    codeFromUrl ?? null
  );

  const token = getAccessToken() || "";

  const wsEnabled = useMemo(
    () =>
      isAuthenticated &&
      !!token &&
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

  // medición local de duración por (sub)pregunta
  const t0Ref = useRef<number>(0);
  const now = () =>
    typeof performance !== "undefined" ? performance.now() : Date.now();

  useEffect(() => {
    sentRef.current = sent;
  }, [sent]);

  // Validaciones básicas
  useEffect(() => {
    if (!isAuthenticated) {
      setError("No hay sesión activa. Inicia sesión.");
      return;
    }
    if (!token) {
      setError("No se encontró el token de acceso.");
      return;
    }
  }, [isAuthenticated, token]);

  // Resolver shortCode por HTTP si entro con :matchId
  useEffect(() => {
    const run = async () => {
      if (shortCode || !matchIdParam || !token) return;
      try {
        const m = await getMatch(matchIdParam, token);
        if (m?.shortCode) setShortCode(m.shortCode);
      } catch {
        /* noop */
      }
    };
    void run();
  }, [matchIdParam, shortCode, token]);

  // Limpieza del interval al desmontar
  useEffect(() => {
    return () => {
      if (timerRef.current != null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const mergePlayersInfo = (list?: PlayerInfo[]) => {
    if (!list || list.length === 0) return;
    setPlayersMap((prev) => {
      const next = { ...prev };
      for (const p of list) {
        if (p && typeof p.id === "string") {
          const nm = (p.name || "").trim();
          if (nm) next[p.id] = nm;
          else next[p.id] ||= `Jugador ${p.id.slice(0, 4)}`;
        }
      }
      return next;
    });
  };

  // Reintento meta ejercicio
  const retryExerciseMeta = useCallback(() => {
    if (!exercise?.id) return;
    setExerciseLoadErr(null);
    setLoadingExerciseMeta(true);
    getExerciseForExam(exercise.id)
      .then((meta) => {
        setExercise({
          id: exercise.id,
          templateType: meta.templateType,
          params: meta.parameters ?? {},
        });
        setExerciseHtml(meta.statementRendered ?? null);
      })
      .catch(() => {
        setExerciseLoadErr("No se pudo cargar el enunciado del ejercicio.");
      })
      .finally(() => setLoadingExerciseMeta(false));
  }, [exercise?.id]);

  // Manejo de mensajes del WS
  useEffect(() => {
    if (!lastMsg) return;

    const m = lastMsg;
    switch (m.type) {
      case "state": {
        const st = m as ServerStateMsgWithExtras;
        setStatus(st.status);
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
        setCountdown(m.sec);
        // reset de UI
        setIAmReady(false);
        setSent(false);
        // timer a cero
        deadlineRef.current = null;
        if (timerRef.current != null) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setTimeLeftMs(0);
        break;
      }
      case "round_start": {
        setStatus("ROUND");
        setRound(m.round);
        setSent(false);
        setIAmReady(false);
        setQIndex(m.qIndex ?? 1);
        setQTotal(m.qTotal ?? 1);
        t0Ref.current = now();

        // Banner de tiempo (sin auto-envío al expirar)
        if (typeof m.deadline === "number" && m.deadline > Date.now()) {
          const deadlineMs = m.deadline;
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
              // ⛔️ No enviamos respuesta vacía: backend maneja noParticipation/reintento.
            }
          }, 250);
        } else {
          deadlineRef.current = null;
          totalTimeMsRef.current = 0;
          if (timerRef.current != null) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
          }
          setTimeLeftMs(0);
        }

        // Cargar meta del ejercicio
        setExerciseLoadErr(null);
        const ex = m.exercise;
        if (isCompleteExercise(ex)) {
          setExercise(ex);
          setExerciseHtml(null);
        } else {
          setLoadingExerciseMeta(true);
          getExerciseForExam(ex.id)
            .then((meta) => {
              setExercise({
                id: ex.id,
                templateType: meta.templateType,
                params: meta.parameters ?? {},
              });
              setExerciseHtml(meta.statementRendered ?? null);
            })
            .catch(() => {
              setExercise({ id: ex.id });
              setExerciseHtml(null);
              setExerciseLoadErr(
                "No se pudo cargar el enunciado del ejercicio."
              );
            })
            .finally(() => setLoadingExerciseMeta(false));
        }
        break;
      }
      case "round_end": {
        setSent(true);
        setScore(m.score);
        // apagar banner de tiempo
        deadlineRef.current = null;
        if (timerRef.current != null) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setTimeLeftMs(0);
        break;
      }
      case "final": {
        const fm = m as ServerFinalMsgWithExtras;
        setStatus("RESULTS");
        setFinalWinner(fm.winnerId ?? null);

        // Mapeo seguro: leemos un posible noParticipation si el backend lo envía.
        const mapped: FinalRoundItemExt[] = (
          fm.byRound as unknown as FinalRoundItemExt[]
        ).map((r) => ({
          round: r.round,
          winnerId: r.winnerId ?? null,
          noParticipation: r.noParticipation === true ? true : undefined,
        }));
        setFinalByRound(mapped);

        setScore(fm.score);
        if (Array.isArray(fm.playersInfo)) mergePlayersInfo(fm.playersInfo);

        // limpia timer
        deadlineRef.current = null;
        if (timerRef.current != null) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setTimeLeftMs(0);
        break;
      }
      case "error": {
        setError(m.message);
        break;
      }
    }
  }, [lastMsg, shortCode]);

  const onReady = () => {
    if (iAmReady) return;
    setIAmReady(true);
    send({ type: "ready" });
  };

  const onSubmit = (answer: Record<string, unknown>) => {
    if (sent) return;
    if (timeLeftMs <= 0) return; // evita carreras al expirarse el tiempo
    const t1 = now();
    const durationMs = Math.max(0, Math.round(t1 - t0Ref.current));
    send({ type: "answer", round, answer, durationMs });
    setSent(true);
  };

  // === Scoreboard N jugadores ===
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

  const submissionKey = useMemo(
    () =>
      exercise
        ? `duel:${
            shortCode || matchIdParam || "code"
          }:r${round}:q${qIndex}:ex:${exercise.id}`
        : `duel:pending`,
    [shortCode, matchIdParam, round, qIndex, exercise]
  );

  const matchLabel = shortCode
    ? `Código: ${shortCode}`
    : matchIdParam
    ? `Match: ${matchIdParam}`
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

  const lobbyPlayers = useMemo(() => {
    return Object.entries(playersMap).map(([id, name]) => ({
      id,
      name: id === myId ? "Tú" : name || `${id.slice(0, 8)}…`,
      ready: readyIds.has(id),
    }));
  }, [playersMap, readyIds, myId]);


  return (
    <div className="mx-auto max-w-3xl p-4">
      <header className="mb-3 flex items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold">⚔️ Duelo</h1>
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
          <span
            className={`rounded-full px-2.5 py-1 ${
              connected
                ? "bg-emerald-100 text-emerald-800"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {connected ? "Conectado" : "Reconectando…"}
          </span>
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-800">
            Estado: {status}
          </span>
          {status !== "RESULTS" && (
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-800">
              {meScore} — {oppScore}
            </span>
          )}
        </div>
      </header>

      <p className="mb-2 text-xs sm:text-sm opacity-70">{matchLabel}</p>

      {!!error && (
        <div
          className="mb-3 rounded-md border border-rose-300 bg-rose-50 p-2 text-sm text-rose-800 dark:border-rose-700 dark:bg-rose-900/20 dark:text-rose-100"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Scoreboard N jugadores */}
      {Object.keys(score).length > 0 && (
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
        <div className="rounded-xl border bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-2 text-base">Esperando jugadores…</div>
          {(playersCount || readyCount || maxPlayers) && (
            <div className="mb-2 text-xs sm:text-sm opacity-80">
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

          {/* Lista de conectados con estado listo */}
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
                        : "bg-gray-100 text-gray-600"
                    }`}
                    title={p.ready ? "Listo" : "No listo"}
                  >
                    {p.ready ? "✔ Listo" : "Pendiente"}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <p className="mb-3 text-sm opacity-80">
            Comparte el enlace o el código y pulsa “¡Estoy listo!” cuando todos
            estén en la sala.
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
                    className="w-full rounded border px-2 py-2 text-xs sm:text-sm dark:border-gray-700 dark:bg-gray-900"
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
            className={`rounded-lg px-4 py-2 text-white focus-visible:ring-2 focus-visible:ring-offset-2 ${
              iAmReady ? "bg-emerald-600" : "bg-indigo-600 hover:bg-indigo-700"
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
          className="rounded-xl border bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-800"
          aria-live="polite"
        >
          <div className="text-base">La ronda comienza en…</div>
          <div className="text-5xl font-extrabold">{countdown}</div>
        </div>
      )}

      {status === "ROUND" && (
        <div className="space-y-3" aria-live="polite">
          {/* Banner de tiempo por pregunta */}
          {timeLeftMs > 0 && (
            <div className="rounded-lg border p-3 dark:border-gray-700">
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

              {sent && timeLeftMs > 0 && (
                <div className="mt-2 text-xs sm:text-sm text-emerald-700 dark:text-emerald-300">
                  Respuesta enviada — esperando al resto…
                </div>
              )}
            </div>
          )}

          {/* Aviso si se acabó el tiempo y no enviaste */}
          {timeLeftMs <= 0 && !sent && (
            <div className="rounded-md border border-amber-300 bg-amber-50 p-2 text-xs sm:text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-200">
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
                    className="rounded bg-rose-600 px-3 py-1.5 text-white hover:bg-rose-700 text-xs"
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
              disabled={!(status === "ROUND" && timeLeftMs > 0 && !sent)}
              statementHtml={exerciseHtml}
            />
          )}
        </div>
      )}

      {status === "RESULTS" && (
        <div className="rounded-xl border bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-2 text-2xl font-bold">
            {finalWinner
              ? finalWinner === myId
                ? "¡Ganaste! 🏆"
                : `${displayName(finalWinner)} ganó`
              : "¡Empate!"}
          </div>

          {/* Leaderboard final */}
          {entries.length > 0 && (
            <div className="mb-4">
              <div className="mb-2 text-sm font-semibold">Clasificación</div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {entries.map((e, idx) => (
                  <div
                    key={e.id}
                    className={`rounded-lg border p-3 text-sm dark:border-gray-700 ${
                      e.id === myId
                        ? "bg-emerald-50 dark:bg-emerald-900/10"
                        : "bg-white dark:bg-gray-800"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold dark:border-gray-600">
                          {idx + 1}
                        </span>
                        <span className="truncate">{displayName(e.id)}</span>
                      </div>
                      <span className="text-lg font-bold">{e.points}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-sm">
            {finalByRound.map((r) => (
              <div key={r.round}>
                Ronda {r.round}:{" "}
                {r.noParticipation
                  ? "nadie respondió"
                  : r.winnerId
                  ? r.winnerId === myId
                    ? "tú"
                    : displayName(r.winnerId)
                  : "empate"}
              </div>
            ))}
          </div>
        </div>
      )}

      {!connected && wsEnabled && status !== "RESULTS" && (
        <div className="mt-3 rounded-md border border-amber-300 bg-amber-50 p-2 text-xs text-amber-800 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-200">
          Reconectando con el servidor… Si tarda, revisa tu conexión o recarga
          la página.
        </div>
      )}
    </div>
  );
};

export default DuelRoom;
