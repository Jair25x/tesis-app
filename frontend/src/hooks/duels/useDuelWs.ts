import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import type { ServerMsg, ClientMsg } from "../../types/duels/duels";

type WsOpts =
  | { matchId: string; token: string }
  | { code: string; token: string };

type ErrorMsg = { type: "error"; message: string };

export function useDuelWs(opts: WsOpts, enabled: boolean) {
  const [connected, setConnected] = useState<boolean>(false);
  const [lastMsg, setLastMsg] = useState<ServerMsg | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const queueRef = useRef<ClientMsg[]>([]);
  const backoffRef = useRef<number>(500);
  const stopRef = useRef<boolean>(false);
  const finishedRef = useRef<boolean>(false);

  const token = opts.token;
  const matchId = "matchId" in opts ? opts.matchId : "";
  const code = "code" in opts ? opts.code : "";

  const url = useMemo(() => {
    const scheme = window.location.protocol === "https:" ? "wss" : "ws";
    const params = new URLSearchParams();
    if (matchId) params.set("matchId", matchId);
    if (code) params.set("code", code);
    params.set("token", token);
    return `${scheme}://${
      window.location.host
    }/api/duels/ws?${params.toString()}`;
  }, [token, matchId, code]);

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
      setConnected(false);
      setLastMsg(null);
      stopRef.current = true;
      finishedRef.current = false;
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch {
          /* empty */
        }
        wsRef.current = null;
      }
      return;
    }

    stopRef.current = false;
    finishedRef.current = false;

    const connect = () => {
      if (stopRef.current) return;

      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        backoffRef.current = 500;
        for (const m of queueRef.current.splice(0)) {
          ws.send(JSON.stringify(m));
        }
      };

      ws.onmessage = (ev: MessageEvent<string>) => {
        let parsed: unknown;
        try {
          parsed = JSON.parse(ev.data);
        } catch {
          return;
        }
        if (!parsed || typeof parsed !== "object") return;

        const payload = parsed as {
          type?: string;
          status?: string;
          [k: string]: unknown;
        };

        if (payload.type === "ping") {
          try {
            ws.send(JSON.stringify({ type: "pong" }));
          } catch {
            /* empty */
          }
          return;
        }

        if (payload.type === "error") {
          const err = payload as ErrorMsg;
          if (err.message === "unauthorized") {
            setLastMsg(null);
            stopRef.current = true;
            try {
              ws.close(1008, "unauthorized");
            } catch {
              /* empty */
            }
            return;
          }
          // Otros errores se manejan desde la UI
          setLastMsg(payload as ServerMsg);
          return;
        }

        if (
          payload.type === "final" ||
          (payload.type === "state" && payload.status === "RESULTS")
        ) {
          finishedRef.current = true;
          stopRef.current = true;
          setLastMsg(payload as ServerMsg);
          try {
            ws.close(1000, "done");
          } catch {
            /* empty */
          }
          return;
        }

        setLastMsg(payload as ServerMsg);
      };

      ws.onclose = (ev: CloseEvent) => {
        setConnected(false);
        if (stopRef.current) return;
        if (ev.code === 1000 || ev.code === 1001 || ev.code === 1008) return;
        const wait = Math.min(backoffRef.current, 8000);
        window.setTimeout(connect, wait);
        backoffRef.current *= 2;
      };

      ws.onerror = () => {
        /* onclose hará el backoff */
      };
    };

    connect();

    return () => {
      stopRef.current = true;
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch {
          /* empty */
        }
        wsRef.current = null;
      }
    };
  }, [url, enabled]);

  return { connected, lastMsg, send };
}
