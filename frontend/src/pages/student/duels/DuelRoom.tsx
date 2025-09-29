import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../../../context/useAuth";
import { useDuelWs } from "../../../hooks/duels/useDuelWs";
import type { ServerMsg, DuelExercise } from "../../../types/duels/duels";
import DuelExerciseRenderer from "../../../components/student/duels/DuelExerciseRenderer";
import { getExerciseForExam } from "../../../services/exerciseService";
import { getMatch } from "../../../services/duelsService";

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

/** Mensaje "state" con extras opcionales del backend */
type StateExtras = {
  code?: string;
  ready?: number;
  players?: number;
  maxPlayers?: number;
};
type ServerStateMsgWithExtras = Extract<ServerMsg, { type: "state" }> &
  StateExtras;

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
  const [exercise, setExercise] = useState<DuelExercise | null>(null);
  const [exerciseHtml, setExerciseHtml] = useState<string | null>(null);
  const [score, setScore] = useState<Record<string, number>>({});
  const [finalWinner, setFinalWinner] = useState<string | null>(null);
  const [finalByRound, setFinalByRound] = useState<
    Array<{ round: number; winnerId: string | null }>
  >([]);
  const [countdown, setCountdown] = useState<number>(0);
  const [sent, setSent] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingExerciseMeta, setLoadingExerciseMeta] = useState(false);

  // Lobby: métricas opcionales del backend
  const [readyCount, setReadyCount] = useState<number | undefined>(undefined);
  const [playersCount, setPlayersCount] = useState<number | undefined>(
    undefined
  );
  const [maxPlayers, setMaxPlayers] = useState<number | undefined>(undefined);

  // Tiempo por pregunta (si el backend manda deadline millis)
  const deadlineRef = useRef<number | null>(null);
  const totalTimeMsRef = useRef<number>(0);
  const [timeLeftMs, setTimeLeftMs] = useState<number>(0);
  const timerRef = useRef<number | null>(null);

  // UI: estado "yo estoy listo"
  const [iAmReady, setIAmReady] = useState<boolean>(false);

  // Código corto a mostrar
  const [shortCode, setShortCode] = useState<string | null>(
    codeFromUrl ?? null
  );

  const token = getAccessToken() || "";

  // Habilitar WS solo si hay login + token + (match o código) y no estamos en RESULTS
  const wsEnabled =
    isAuthenticated &&
    !!token &&
    (Boolean(shortCode) || Boolean(matchIdParam)) &&
    status !== "RESULTS";

  const wsOpts: WsOpts =
    shortCode != null
      ? { code: shortCode, token }
      : matchIdParam
      ? { matchId: matchIdParam, token }
      : { matchId: "", token };

  const { connected, lastMsg, send } = useDuelWs(wsOpts, wsEnabled);

  // medición local de duración por ronda (para enviar durationMs)
  const t0Ref = useRef<number>(0);
  const now = () =>
    typeof performance !== "undefined" ? performance.now() : Date.now();

  // Validaciones de sesión/token
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

  // Si entro por :matchId y no tengo ?code, resuelvo por HTTP
  useEffect(() => {
    const run = async () => {
      if (shortCode || !matchIdParam || !token) return;
      try {
        const m = await getMatch(matchIdParam, token);
        if (m?.shortCode) setShortCode(m.shortCode);
      } catch {
        return;
      }
    };
    void run();
  }, [matchIdParam, shortCode, token]);

  // Limpia el timer del banner de tiempo cuando desmonta
  useEffect(() => {
    return () => {
      if (timerRef.current != null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  // Manejo de mensajes del WS
  useEffect(() => {
    const msg = lastMsg;
    if (!msg) return;

    const handle = async (m: ServerMsg) => {
      switch (m.type) {
        case "state": {
          setStatus(m.status);
          if (typeof m.round === "number") setRound(m.round);

          // extras opcionales enviados por el BE
          const st = m as ServerStateMsgWithExtras;
          if (typeof st.code === "string" && !shortCode) setShortCode(st.code);
          setReadyCount(st.ready);
          setPlayersCount(st.players);
          setMaxPlayers(st.maxPlayers);
          break;
        }
        case "countdown": {
          setStatus("COUNTDOWN");
          setCountdown(m.sec);
          // reset UI flags
          setIAmReady(false);
          setSent(false);
          // limpia banner de tiempo si veníamos de round
          deadlineRef.current = null;
          if (timerRef.current != null) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
          }
          break;
        }
        case "round_start": {
          setStatus("ROUND");
          setRound(m.round);
          setSent(false);
          setIAmReady(false);
          t0Ref.current = now();

          // Banner de tiempo por pregunta (si el backend manda deadline en ms epoch)
          if (typeof m.deadline === "number" && m.deadline > Date.now()) {
            deadlineRef.current = m.deadline;
            const total = m.deadline - Date.now();
            totalTimeMsRef.current = total > 0 ? total : 0;
            setTimeLeftMs(totalTimeMsRef.current);

            if (timerRef.current != null)
              window.clearInterval(timerRef.current);
            timerRef.current = window.setInterval(() => {
              const rest = (deadlineRef.current ?? 0) - Date.now();
              setTimeLeftMs(Math.max(0, rest));
              if (rest <= 0 && timerRef.current != null) {
                window.clearInterval(timerRef.current);
                timerRef.current = null;
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

          const ex = m.exercise;
          const hasTpl =
            Object.prototype.hasOwnProperty.call(ex, "templateType") &&
            Object.prototype.hasOwnProperty.call(ex, "params");

          if (!hasTpl) {
            setLoadingExerciseMeta(true);
            try {
              const meta = await getExerciseForExam(ex.id);
              setExercise({
                id: ex.id,
                templateType: meta.templateType,
                params: meta.parameters ?? {},
              });
              setExerciseHtml(meta.statementRendered ?? null);
            } catch {
              setExercise({ id: ex.id } as DuelExercise);
              setExerciseHtml(null);
            } finally {
              setLoadingExerciseMeta(false);
            }
          } else {
            setExercise(ex);
            setExerciseHtml(null);
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
          setStatus("RESULTS");
          setFinalWinner(m.winnerId ?? null);
          const mapped = (m.byRound || []).map((r) => ({
            round: r.round,
            winnerId: r.winnerId,
          }));
          setFinalByRound(mapped);
          setScore(m.score);
          // limpia timer por si acaso
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
    };

    void handle(msg);
  }, [lastMsg, shortCode]);

  const onReady = () => {
    if (iAmReady) return;
    setIAmReady(true);
    send({ type: "ready" });
  };

  const onSubmit = (answer: Record<string, unknown>) => {
    if (sent) return;
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

  const meScore = useMemo(() => (myId ? score[myId] ?? 0 : 0), [score, myId]);
  const oppScore = useMemo(() => {
    // compat 1v1 (para el chip de cabecera)
    const ids = Object.keys(score);
    const other = ids.find((id) => id !== myId);
    return other ? score[other] ?? 0 : 0;
  }, [score, myId]);

  // === UI helpers ===
  const submissionKey = useMemo(
    () =>
      exercise
        ? `duel:${shortCode || matchIdParam || "code"}:r${round}:ex:${
            exercise.id
          }`
        : `duel:pending`,
    [shortCode, matchIdParam, round, exercise]
  );

  const matchLabel = shortCode
    ? `Código: ${shortCode}`
    : matchIdParam
    ? `Match: ${matchIdParam}`
    : "";

  const shareLink =
    shortCode != null
      ? `${window.location.origin}/student/duels/join?code=${encodeURIComponent(
          shortCode
        )}`
      : null;

  const copyShare = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
    } catch {
      return;
    }
  };

  const nativeShare = async () => {
    if (!shareLink) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Únete a mi duelo",
          text: "Entra con este enlace:",
          url: shareLink,
        });
      } else {
        await copyShare();
      }
    } catch {
      return;
    }
  };

  // === Banner tiempo por pregunta ===
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

      {/* Scoreboard N jugadores (en cualquier fase excepto waiting vacío) */}
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
                <div className="mt-1 truncate text-xs opacity-70">
                  {e.id === myId ? "Tú" : `${e.id.slice(0, 8)}…`}
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
              Conectados: <b>{playersCount ?? "?"}</b>
              {typeof maxPlayers === "number" ? (
                <>
                  {" "}
                  / <b>{maxPlayers}</b>
                </>
              ) : null}
              {" · "}
              Listos: <b>{readyCount ?? 0}</b>
            </div>
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
                    value={shareLink ?? ""}
                    aria-label="Enlace para compartir"
                  />
                  <div className="flex gap-2">
                    <button
                      className="rounded bg-gray-800 px-3 py-2 text-xs text-white hover:bg-black"
                      onClick={copyShare}
                    >
                      Copiar
                    </button>
                    <button
                      className="rounded bg-indigo-600 px-3 py-2 text-xs text-white hover:bg-indigo-700"
                      onClick={nativeShare}
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
          {/* Banner de tiempo por pregunta (si aplica) */}
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
            </div>
          )}

          <div className="text-sm opacity-70">Ronda {round}</div>
          {loadingExerciseMeta ||
          !exercise?.id ||
          !exercise.templateType ||
          !exercise.params ? (
            <div className="rounded-md border bg-white p-4 text-sm opacity-80 dark:border-gray-700 dark:bg-gray-800">
              Cargando ejercicio…
            </div>
          ) : (
            <DuelExerciseRenderer
              templateType={exercise.templateType}
              params={exercise.params}
              submissionKey={submissionKey}
              onSubmit={onSubmit}
              disabled={sent}
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
                : "Ganó tu oponente"
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
                        <span className="truncate">
                          {e.id === myId ? "Tú" : `${e.id.slice(0, 8)}…`}
                        </span>
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
                {r.winnerId
                  ? r.winnerId === myId
                    ? "tú"
                    : "oponente"
                  : "empate"}
              </div>
            ))}
          </div>
        </div>
      )}

      {!connected && wsEnabled && (
        <div className="mt-3 rounded-md border border-amber-300 bg-amber-50 p-2 text-xs text-amber-800 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-200">
          Reconectando con el servidor… Si tarda, revisa tu conexión o recarga
          la página.
        </div>
      )}
    </div>
  );
};

export default DuelRoom;
