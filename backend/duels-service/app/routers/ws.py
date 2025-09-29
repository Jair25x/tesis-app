# app/routers/ws.py
from __future__ import annotations
import os, base64, logging
from typing import Optional, Dict, Any

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from starlette.websockets import WebSocketState
import jwt
from sqlalchemy.orm import Session

from ..deps import SessionLocal
from ..services.duel_manager import ws_lobby, resolve_short_code

router = APIRouter()
log = logging.getLogger("duels.ws")

JWT_ALGS = [a.strip() for a in (os.getenv("JWT_ALGS") or "HS512,HS384,HS256").split(",")]
JWT_SECRET_RAW = (os.getenv("JWT_SECRET") or "").strip()


def _best_effort_hmac_key() -> Optional[bytes]:
    if not JWT_SECRET_RAW:
        log.error("JWT_SECRET vacío en entorno")
        return None

    candidates = {JWT_SECRET_RAW}
    for pad in ("", "=", "==", "==="):
        candidates.add(JWT_SECRET_RAW + pad)

    for s in list(candidates):
        try:
            b = base64.b64decode(s, validate=True)
            if b:
                return b
        except Exception:
            pass
    for s in list(candidates):
        try:
            b = base64.urlsafe_b64decode(s + "===")
            if b:
                return b
        except Exception:
            pass

    log.warning("JWT_SECRET no es Base64 válido; usando bytes crudos como clave HMAC (fallback)")
    return JWT_SECRET_RAW.encode("utf-8")


JWT_KEY_BYTES = _best_effort_hmac_key()


def _extract_token(headers: Dict[str, Any], query_params: Dict[str, Any]) -> Optional[str]:
    auth = headers.get("authorization") or headers.get("Authorization")
    if auth and isinstance(auth, str) and auth.lower().startswith("bearer "):
        return auth[7:].strip()
    if "token" in query_params:
        return str(query_params["token"])
    return None


def _parse_user_id(token: str) -> Optional[str]:
    if not token or not JWT_KEY_BYTES:
        return None
    try:
        claims = jwt.decode(token, key=JWT_KEY_BYTES, algorithms=JWT_ALGS, options={"verify_aud": False})
        uid = claims.get("userId") or claims.get("sub")
        return str(uid) if uid else None
    except Exception as e:
        log.warning("JWT decode error: %s", e)
        return None


def _resolve_match_id_and_code(ws: WebSocket) -> tuple[Optional[str], Optional[str]]:
    qp = dict(ws.query_params)
    mid = qp.get("matchId")
    code = qp.get("code")
    if mid:
        return str(mid), None
    if code:
        code_norm = str(code).strip().upper()
        db: Session = SessionLocal()
        try:
            mid = resolve_short_code(db, code_norm)
            return (mid, code_norm) if mid else (None, code_norm)
        finally:
            db.close()
    return None, None


async def _safe_send_json(ws: WebSocket, payload: dict) -> None:
    # Evita raise si ya se envió un close
    if ws.client_state == WebSocketState.CONNECTED:
        try:
            await ws.send_json(payload)
        except RuntimeError:
            pass


async def _safe_close(ws: WebSocket, code: int) -> None:
    if ws.client_state != WebSocketState.DISCONNECTED:
        try:
            await ws.close(code=code)
        except RuntimeError:
            pass


@router.websocket("/ws")
async def ws_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        token = _extract_token(websocket.headers, dict(websocket.query_params))
        user_id = _parse_user_id(token) if token else None
        if not user_id:
            await _safe_send_json(websocket, {"type": "error", "message": "unauthorized"})
            await _safe_close(websocket, 1008)
            return

        match_id, code_norm = _resolve_match_id_and_code(websocket)
        if not match_id:
            await _safe_send_json(websocket, {"type": "error", "message": "match not found"})
            await _safe_close(websocket, 1008)
            return

        # Forzar matchId en querystring para compat hacia abajo
        websocket.scope["query_string"] = f"matchId={match_id}".encode("utf-8")  # type: ignore[index]

        # Feedback inmediato para el cliente
        await _safe_send_json(
            websocket,
            {"type": "state", "status": "WAITING", "round": 0, "code": code_norm},
        )

        log.info("WS enter lobby matchId=%s user=%s", match_id, user_id)
        # Dentro de ws_lobby se gestionan ready X/Y, round loop, keepalive pings y cierre final.
        await ws_lobby(websocket, user_id)
        # IMPORTANTE: no enviar nada más aquí; ws_lobby podría haber cerrado el socket.

        return

    except WebSocketDisconnect:
        log.info("WS client disconnected")
        return
    except Exception as e:
        log.exception("WS fatal error: %s", e)
        await _safe_send_json(websocket, {"type": "error", "message": "internal"})
        await _safe_close(websocket, 1011)
        return
