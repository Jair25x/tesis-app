// src/hooks/duels/useDuelWs.ts
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import type { ServerMsg, ClientMsg } from "../../types/duels/duels";

type WsOpts =
  | { matchId: string; token: string }
  | { code: string; token: string };

function safeParseJson(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

export function useDuelWs(opts: WsOpts, enabled: boolean) {
  const [connected, setConnected] = useState<boolean>(false);
  const [lastMsg, setLastMsg] = useState<ServerMsg | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const queueRef = useRef<ClientMsg[]>([]);
  const backoffRef = useRef<number>(500);
  const stopRef = useRef<boolean>(false);
  const endedRef = useRef<boolean>(false); // final/RESULTS → no reconectar

  const url = useMemo(() => {
    const scheme = window.location.protocol === "https:" ? "wss" : "ws";
    const params = new URLSearchParams();
    if ("matchId" in opts) params.set("matchId", opts.matchId);
    if ("code" in opts) params.set("code", opts.code);
    params.set("token", opts.token);
    return `${scheme}://${
      window.location.host
    }/api/duels/ws?${params.toString()}`;
  }, [opts]);

  const send = useCallback((msg: ClientMsg) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    } else {
      queueRef.current.push(msg);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      stopRef.current = true;
      endedRef.current = false;
      setConnected(false);
      setLastMsg(null);
      const prev = wsRef.current;
      wsRef.current = null;
      try {
        prev?.close();
      } catch {
        return;
      }
      return;
    }

    stopRef.current = false;
    endedRef.current = false;

    const connect = () => {
      if (stopRef.current || endedRef.current) return;

      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        backoffRef.current = 500;
        const pending = queueRef.current.splice(0);
        for (const m of pending) {
          try {
            ws.send(JSON.stringify(m));
          } catch {
            return;
          }
        }
      };

      ws.onmessage = (ev: MessageEvent<string>) => {
        const raw = safeParseJson(ev.data);
        if (!raw || typeof raw !== "object") return;
        if (!("type" in raw)) return;

        const msg = raw as ServerMsg;

        // Detectar fin: final o state:RESULTS
        if (msg.type === "final") {
          endedRef.current = true;
        } else if (msg.type === "state" && msg.status === "RESULTS") {
          endedRef.current = true;
        }

        setLastMsg(msg);
      };

      ws.onclose = (ev: CloseEvent) => {
        setConnected(false);

        const shouldStop =
          stopRef.current ||
          endedRef.current ||
          ev.code === 1000 ||
          ev.code === 1008;
        if (shouldStop) return;

        const wait = Math.min(backoffRef.current, 8000);
        window.setTimeout(() => {
          if (!stopRef.current && !endedRef.current) {
            backoffRef.current = Math.min(backoffRef.current * 2, 8000);
            connect();
          }
        }, wait);
      };

      ws.onerror = () => {
        return;
      };
    };

    connect();

    return () => {
      stopRef.current = true;
      const prev = wsRef.current;
      wsRef.current = null;
      setConnected(false);
      try {
        prev?.close();
      } catch {
        return;
      }
    };
  }, [url, enabled]);

  return { connected, lastMsg, send };
}
