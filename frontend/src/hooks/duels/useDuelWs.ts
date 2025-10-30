// src/hooks/duels/useDuelWs.ts
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ServerMsg, ClientMsg } from "../../types/duels/duels";

/* ============================
   Tipos locales (sin any)
   ============================ */

type QueuedMsg = { raw: ClientMsg; payload: string };

export type SendResult =
  | { ok: true; queued: boolean; readyState: number | null }
  | {
      ok: false;
      queued: false;
      readyState: number | null;
      error: unknown;
    };

type WsOpts =
  | { matchId: string; token: string }
  | { code: string; token: string };

type UseDuelWsReturn = {
  connected: boolean;
  lastMsg: ServerMsg | null;
  send: (msg: ClientMsg) => SendResult;
};

// ===== Configuraciones =====
const MAX_QUEUE = 200; // límite de mensajes en cola

/* ============================
   Utilidades de tipado seguro
   ============================ */

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

const allowedTypes = new Set<ServerMsg["type"]>([
  "state",
  "countdown",
  "round_start",
  "round_end",
  "final",
  "error",
  "answer_progress",
]);

function isServerMsg(u: unknown): u is ServerMsg {
  if (!isRecord(u)) return false;
  const t = u["type"];
  if (typeof t !== "string" || !allowedTypes.has(t as ServerMsg["type"])) {
    return false;
  }
  // Validación mínima por variante
  switch (t) {
    case "state":
      return true;
    case "countdown":
      return typeof u["sec"] === "number";
    case "round_start":
      return typeof u["round"] === "number" && isRecord(u["exercise"]);
    case "round_end":
      return typeof u["round"] === "number" && isRecord(u["score"]);
    case "final":
      return isRecord(u["score"]);
    case "error":
      return typeof u["message"] === "string";
    case "answer_progress":
      return (
        typeof u["round"] === "number" &&
        typeof u["qIndex"] === "number" &&
        typeof u["responded"] === "number" &&
        typeof u["total"] === "number"
      );
    default:
      return false;
  }
}

/**
 * Construye la URL de WebSocket a partir de:
 * - VITE_DUELS_WS_URL: absoluta (ws/wss/http/https) o relativa (ej. "/api/duels/ws")
 * - Host/scheme actuales del navegador (si la base es relativa)
 * - Params: token + (matchId | code)
 */
function buildWsUrl(base: string | undefined, params: URLSearchParams): string {
  const defaultBase = "/api/duels/ws";
  const rawBase = base ?? defaultBase;

  const isAbsolute =
    rawBase.startsWith("ws://") ||
    rawBase.startsWith("wss://") ||
    rawBase.startsWith("http://") ||
    rawBase.startsWith("https://");

  if (isAbsolute) {
    try {
      const u = new URL(rawBase);
      if (u.protocol === "http:") u.protocol = "ws:";
      if (u.protocol === "https:") u.protocol = "wss:";
      u.search = params.toString();
      return u.toString();
    } catch {
      /* fallback abajo */
    }
  }

  const scheme = window.location.protocol === "https:" ? "wss" : "ws";
  const host = window.location.host;
  const path = rawBase.startsWith("/") ? rawBase : `/${rawBase}`;
  return `${scheme}://${host}${path}?${params.toString()}`;
}

/* ============================
   Hook principal
   ============================ */

export function useDuelWs(opts: WsOpts, enabled: boolean): UseDuelWsReturn {
  const [connected, setConnected] = useState<boolean>(false);
  const [lastMsg, setLastMsg] = useState<ServerMsg | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const queueRef = useRef<QueuedMsg[]>([]);
  const backoffRef = useRef<number>(500);
  const stopRef = useRef<boolean>(false);

  const token = "token" in opts ? opts.token : "";
  const matchId = "matchId" in opts ? opts.matchId : "";
  const code = "code" in opts ? opts.code : "";

  const base = import.meta.env.VITE_DUELS_WS_URL as string | undefined;

  const url = useMemo(() => {
    const params = new URLSearchParams();
    if (matchId) params.set("matchId", matchId);
    if (code) params.set("code", code);
    params.set("token", token);
    return buildWsUrl(base, params);
  }, [token, matchId, code, base]);

  const send = useCallback((msg: ClientMsg): SendResult => {
    let payload: string;
    try {
      payload = JSON.stringify(msg);
    } catch (e: unknown) {
      return {
        ok: false,
        queued: false,
        readyState: wsRef.current?.readyState ?? null,
        error: e,
      };
    }

    const ws = wsRef.current;
    const readyState = ws?.readyState ?? null;

    try {
      if (ws && readyState === WebSocket.OPEN) {
        ws.send(payload);
        return { ok: true, queued: false, readyState };
      }

      if (queueRef.current.length >= MAX_QUEUE) {
        queueRef.current.shift();
      }
      queueRef.current.push({ raw: msg, payload });

      return { ok: true, queued: true, readyState };
    } catch (e: unknown) {
      return { ok: false, queued: false, readyState, error: e };
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setConnected(false);
      setLastMsg(null);
      stopRef.current = true;
      try {
        wsRef.current?.close();
      } catch {
        /* noop */
      }
      wsRef.current = null;
      return;
    }

    stopRef.current = false;

    const connect = () => {
      if (stopRef.current) return;

      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        backoffRef.current = 500;

        // Flush cola
        const pending = queueRef.current.splice(0);
        while (pending.length > 0) {
          const item = pending.shift();
          if (!item) continue;
          try {
            ws.send(item.payload);
          } catch {
            queueRef.current.unshift(item, ...pending);
            break;
          }
        }
      };

      ws.onmessage = (ev: MessageEvent<string>) => {
        try {
          const unknownParsed: unknown = JSON.parse(ev.data);

          // —— ping/pong lightweight ——
          if (isRecord(unknownParsed) && unknownParsed.type === "ping") {
            // responder "pong" y no pasar al reducer
            try {
              ws.send(JSON.stringify({ type: "pong" }));
            } catch {
              /* noop */
            }
            return;
          }

          // Mensajes de aplicación
          if (isServerMsg(unknownParsed)) {
            setLastMsg(unknownParsed);
          }
        } catch {
          // Ignora frames no JSON
        }
      };

      ws.onclose = () => {
        setConnected(false);
        if (stopRef.current) return;

        // Reconexión exponencial con tope
        const delay = Math.min(backoffRef.current, 8000);
        backoffRef.current = Math.min(backoffRef.current * 2, 8000);
        window.setTimeout(connect, delay);
      };

      ws.onerror = () => {
        try {
          ws.close();
        } catch {
          /* noop */
        }
      };
    };

    connect();
    return () => {
      stopRef.current = true;
      try {
        wsRef.current?.close();
      } catch {
        /* noop */
      }
      wsRef.current = null;
    };
  }, [enabled, url]);

  return { connected, lastMsg, send };
}
