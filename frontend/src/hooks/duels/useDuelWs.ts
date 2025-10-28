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
    try {
      console.log("[WS SEND]", { msg, readyState: ws?.readyState });
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(msg));
        console.log("[WS SEND OK]");
      } else {
        queueRef.current.push(msg);
        console.log("[WS QUEUED]", { queued: queueRef.current.length });
      }
    } catch (e) {
      console.error("[WS SEND ERROR]", e);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      console.log("[WS DISABLED] closing...");
      setConnected(false);
      setLastMsg(null);
      stopRef.current = true;
      finishedRef.current = false;
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch {
          /* noop */
        }
        wsRef.current = null;
      }
      return;
    }

    stopRef.current = false;
    finishedRef.current = false;

    const connect = () => {
      if (stopRef.current) return;

      console.log("[WS CONNECT] opening", url);
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        backoffRef.current = 500;

        const pending = queueRef.current.splice(0);
        if (pending.length > 0) {
          console.log("[WS OPEN] flushing", pending.length, "message(s)");
        }
        for (const m of pending) {
          try {
            ws.send(JSON.stringify(m));
            console.log("[WS FLUSH] sent", m);
          } catch (err) {
            console.error("[WS FLUSH ERROR]", err, m);
            queueRef.current.unshift(m);
            break;
          }
        }
      };

      ws.onmessage = (ev: MessageEvent<string>) => {
        let parsed: unknown;
        try {
          parsed = JSON.parse(ev.data);
        } catch {
          console.log("[WS RECV] (non-JSON)", ev.data);
          return;
        }

        // Log genérico de todo lo que llega
        console.log("[WS RECV]", parsed);

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

        // Deja pasar TODO lo que tenga type, aunque sea un tipo “nuevo”
        setLastMsg(payload as ServerMsg);
      };

      ws.onclose = (ev: CloseEvent) => {
        console.warn("[WS CLOSE]", ev.code, ev.reason);
        setConnected(false);
        if (stopRef.current) return;
        if (ev.code === 1000 || ev.code === 1001 || ev.code === 1008) return;
        const wait = Math.min(backoffRef.current, 8000);
        console.log("[WS RETRY] in", wait, "ms");
        window.setTimeout(connect, wait);
        backoffRef.current *= 2;
      };

      ws.onerror = (ev) => {
        console.error("[WS ERROR]", ev);
        // onclose hará el backoff
      };
    };

    connect();

    return () => {
      console.log("[WS CLEANUP] closing...");
      stopRef.current = true;
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch {
          /* noop */
        }
        wsRef.current = null;
      }
    };
  }, [url, enabled]);

  return { connected, lastMsg, send };
}
