// pages/student/duels/DuelHub.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../context/useAuth";
import {
  getMyDuelSummary,
  getMyDuelHistory,
  listOpenMatches,
  resolveCode,
} from "../../../services/duelsService";
import { useToastError } from "../../../hooks/useToastError";

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

type OpenMatchItem = {
  matchId: string;
  shortCode: string;
  bestOf: number;
  createdAt: string;
  createdBy?: string;
  maxPlayers: number;
};

const DuelHub: React.FC = () => {
  const nav = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const token = getAccessToken() || "";

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [summary, setSummary] = useState<{
    played: number;
    wins: number;
    losses: number;
    rating: number;
    lastPlayedAt?: string | null;
  } | null>(null);

  const [history, setHistory] = useState<
    Array<{
      matchId: string;
      finishedAt?: string | null;
      bestOf: number;
      winnerId?: string | null;
      shortCode?: string | null;
    }>
  >([]);

  const [openMatches, setOpenMatches] = useState<OpenMatchItem[]>([]);

  // Join by code (inline input UX)
  const [joinCode, setJoinCode] = useState("");
  const [joinBusy, setJoinBusy] = useState(false);
  const [joinErr, setJoinErr] = useState<string | null>(null);

  const toastError = useToastError(setErr);
  const toastJoinError = useToastError(setJoinErr);

  // Nombre amigable
  const playerName = useMemo(() => {
    const raw =
      (user?.nombres || "").trim() ||
      (user?.username || "").trim() ||
      (user?.email || "").trim() ||
      "Jugador";
    return raw.split(" ")[0];
  }, [user?.nombres, user?.username, user?.email]);

  useEffect(() => {
    if (!isAuthenticated || !token) return;
    let canceled = false;

    const run = async () => {
      setBusy(true);
      setErr(null);
      try {
        const [s, h, opens] = await Promise.all([
          getMyDuelSummary(token),
          getMyDuelHistory(token, 10),
          listOpenMatches(token),
        ]);
        if (!canceled) {
          setSummary(s);
          setHistory(h);
          setOpenMatches(opens);
        }
      } catch (e) {
        if (!canceled) toastError(e, "No se pudo cargar tu resumen de duelos.");
      } finally {
        if (!canceled) setBusy(false);
      }
    };
    void run();
    return () => {
      canceled = true;
    };
  }, [isAuthenticated, token, toastError]);

  const goJoinByCode = async () => {
    const code = joinCode.trim().toUpperCase();
    setJoinErr(null);
    if (!code || code.length < 4 || code.length > 12) {
      toastJoinError("Ingresa un código válido (4–12 caracteres).");
      return;
    }
    if (!token) {
      toastJoinError("No hay sesión activa.");
      return;
    }
    setJoinBusy(true);
    try {
      await resolveCode(code, token); // validación server-side
      nav(`/student/duels/room?code=${encodeURIComponent(code)}`);
    } catch (e) {
      toastJoinError(e, "Código no encontrado.");
    } finally {
      setJoinBusy(false);
    }
  };

  const refreshOpens = async () => {
    if (!token) return;
    try {
      setBusy(true);
      const items = await listOpenMatches(token);
      setOpenMatches(items);
    } catch (e) {
      toastError(e, "No se pudo actualizar la lista.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight">
          ⚔️ Duelos — ¡Hola, {playerName}!
        </h1>

        {/* Acciones principales */}
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Link
            to="/student/duels/new"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            aria-label="Crear un nuevo duelo"
          >
            <span className="mr-2">➕</span>
            Nuevo duelo
          </Link>

          <Link
            to="/student/duels/new/advanced"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-indigo-200 bg-white px-4 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-indigo-800 dark:bg-gray-900 dark:text-indigo-300 dark:hover:bg-gray-800"
            aria-label="Configurar un duelo avanzado"
          >
            <span className="mr-2">⚙️</span>
            Avanzado
          </Link>
        </div>
      </div>

      {/* Join by code inline */}
      <div className="mb-6 rounded-2xl border bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="text-sm font-medium sm:w-48">
            Unirme por código
          </label>
          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <input
              type="text"
              inputMode="text"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              maxLength={12}
              placeholder="Ej: ABC123"
              value={joinCode}
              onChange={(e) =>
                setJoinCode(
                  e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "")
                )
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" && !joinBusy && joinCode.trim()) {
                  e.preventDefault();
                  void goJoinByCode();
                }
              }}
              className="h-11 w-full rounded-xl border px-3 font-mono tracking-widest outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900"
            />
            <button
              onClick={goJoinByCode}
              disabled={joinBusy || !joinCode.trim()}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Unirme al duelo por código"
            >
              {joinBusy ? "Entrando…" : "Unirme"}
            </button>
          </div>
        </div>
        {joinErr && (
          <div className="mt-2 text-xs text-rose-600 dark:text-rose-300">
            {joinErr}
          </div>
        )}
      </div>

      {/* Summary + KPI */}
      <section className="mb-6 grid gap-4 md:grid-cols-[300px,1fr]">
        <div className="rounded-2xl border bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-emerald-500 text-3xl text-white shadow">
              🛡️
            </div>
            <div>
              <div className="text-sm opacity-70">Tu personaje</div>
              <div className="text-lg font-bold">{playerName}</div>
            </div>
          </div>
          <div className="text-xs opacity-70">
            Personaliza tu avatar y vestimenta próximamente.
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border bg-white p-4 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="text-xs opacity-70">Ganados</div>
            <div className="text-3xl font-extrabold text-emerald-600">
              {summary?.wins ?? 0}
            </div>
          </div>
          <div className="rounded-2xl border bg-white p-4 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="text-xs opacity-70">Perdidos</div>
            <div className="text-3xl font-extrabold text-rose-600">
              {summary?.losses ?? 0}
            </div>
          </div>
          <div className="rounded-2xl border bg-white p-4 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="text-xs opacity-70">Rating</div>
            <div className="text-3xl font-extrabold text-indigo-600">
              {summary?.rating ?? 1000}
            </div>
          </div>
        </div>
      </section>

      {/* Open matches + History */}
      <section className="mb-8 grid gap-4 md:grid-cols-2">
        {/* Open matches */}
        <div className="rounded-2xl border bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Partidas públicas</h2>
            <button
              onClick={refreshOpens}
              className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:text-indigo-300"
            >
              ⟳ Actualizar
            </button>
          </div>

          {busy && (
            <div className="mb-2 text-xs opacity-70">Cargando datos…</div>
          )}

          {openMatches.length === 0 ? (
            <div className="flex items-center justify-between rounded-xl border border-dashed p-4 text-sm opacity-70 dark:border-gray-700">
              <span>No hay salas abiertas.</span>
              <button
                onClick={() => nav("/student/duels/new")}
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-white transition hover:bg-indigo-700"
              >
                Crear una
              </button>
            </div>
          ) : (
            <ul className="grid gap-2">
              {openMatches.map((m) => (
                <li
                  key={m.matchId}
                  className="flex items-center justify-between rounded-xl border p-3 text-sm shadow-sm transition hover:border-indigo-300/70 dark:border-gray-700 dark:hover:border-indigo-700/50"
                >
                  <div>
                    <div className="font-medium">
                      Código:{" "}
                      <span className="font-mono tracking-widest">
                        {m.shortCode}
                      </span>
                    </div>
                    <div className="text-xs opacity-70">
                      Best of {m.bestOf} · Max {m.maxPlayers}
                    </div>
                  </div>
                  <button
                    className="inline-flex h-9 items-center justify-center rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                    onClick={() =>
                      nav(
                        `/student/duels/room?code=${encodeURIComponent(
                          m.shortCode
                        )}`
                      )
                    }
                    aria-label={`Unirme al duelo ${m.shortCode}`}
                  >
                    Unirme
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* History */}
        <div className="rounded-2xl border bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-3 text-lg font-semibold">Mi historial</h2>

          {history.length === 0 ? (
            <div className="rounded-xl border border-dashed p-4 text-sm opacity-70 dark:border-gray-700">
              Aún no has jugado.
            </div>
          ) : (
            <ul className="grid gap-2">
              {history.map((h) => {
                const iAmWinner =
                  h.winnerId != null &&
                  user?.id != null &&
                  String(user.id) === String(h.winnerId);

                return (
                  <li
                    key={h.matchId}
                    className="flex items-center justify-between rounded-xl border p-3 text-sm shadow-sm dark:border-gray-700"
                  >
                    <div>
                      <div className="font-medium">
                        {h.shortCode ? (
                          <span className="font-mono">#{h.shortCode}</span>
                        ) : (
                          "Partida"
                        )}{" "}
                        · Best of {h.bestOf}
                      </div>
                      <div className="text-xs opacity-70">
                        {h.finishedAt
                          ? new Date(h.finishedAt).toLocaleString()
                          : "—"}
                      </div>
                    </div>
                    <div
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        h.winnerId == null
                          ? "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-100"
                          : iAmWinner
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-200"
                          : "bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-200"
                      }`}
                    >
                      {h.winnerId == null
                        ? "Empate"
                        : iAmWinner
                        ? "Ganaste"
                        : "Perdiste"}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* Alerts */}
      {err && (
        <div
          role="alert"
          className="rounded-lg border border-rose-300 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-700 dark:bg-rose-900/20 dark:text-rose-200"
        >
          {err}
        </div>
      )}
    </div>
  );
};

export default DuelHub;
