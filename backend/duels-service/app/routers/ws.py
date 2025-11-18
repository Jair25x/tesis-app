# app/routers/ws.py
from __future__ import annotations
import logging
from typing import Optional, Dict, Any, Tuple

from fastapi import APIRouter, WebSocket
from starlette.websockets import WebSocketState
import jwt
from sqlalchemy.orm import Session

from ..deps import SessionLocal
from ..services.duel_manager import ws_lobby, resolve_short_code
from ..config import JWT_KEY_BYTES, JWT_ALGS
from ..metrics import duels_ws_connections  # métricas de conexiones

router = APIRouter()
log = logging.getLogger("duels.ws")


def _extract_token(headers: Dict[str, Any], query_params: Dict[str, Any]) -> Optional[str]:
    """Extrae bearer token del header Authorization o de query params (token|access_token)."""
    auth = headers.get("authorization") or headers.get("Authorization")
    if auth and isinstance(auth, str) and auth.lower().startswith("bearer "):
        return auth[7:].strip()
    for k in ("token", "access_token"):
        if k in query_params and query_params[k]:
            return str(query_params[k]).strip()
    return None


def _parse_user(token: str) -> Tuple[Optional[str], Optional[str]]:
    if not token or not JWT_KEY_BYTES:
        log.warning("WS _parse_user: missing token or JWT_KEY_BYTES")
        return None, None
    try:
        claims = jwt.decode(
            token,
            key=JWT_KEY_BYTES,
            algorithms=JWT_ALGS,
            options={"verify_aud": False, "verify_exp": True},
            leeway=10,
        )
        uid = claims.get("userId") or claims.get("sub")
        uname = (
            claims.get("username")
            or claims.get("preferred_username")
            or claims.get("name")
            or None
        )
        if not uname:
            g = (claims.get("given_name") or "").strip()
            f = (claims.get("family_name") or "").strip()
            if g or f:
                uname = f"{g} {f}".strip()
        log.info("WS _parse_user ok uid=%s uname=%s", uid, uname)
        return (str(uid) if uid else None, str(uname) if uname else None)
    except Exception as e:
        log.warning("WS JWT decode error: %s", e)
        return None, None


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
    duels_ws_connections.labels(state="open").inc()
    try:
        # ============================
        # 1) Preferir identidad del gateway
        # ============================
        headers_lower = {k.lower(): v for k, v in websocket.headers.items()}
        gw_user_id = headers_lower.get("x-user-id")
        gw_username = headers_lower.get("x-user-name") or headers_lower.get("x-user-username")

        if gw_user_id:
            user_id = gw_user_id
            username = gw_username
            log.info("WS handshake (gateway headers): uid=%s uname=%s", user_id, username)
        else:
            # ============================
            # 2) Fallback: token (query/header)
            # ============================
            qp_dict = dict(websocket.query_params)
            token = _extract_token(websocket.headers, qp_dict)
            log.info(
                "WS handshake (token): has_token=%s qp=%s",
                bool(token),
                qp_dict,
            )
            user_id, username = _parse_user(token) if token else (None, None)

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

        # Feedback inmediato
        await _safe_send_json(
            websocket,
            {"type": "state", "status": "WAITING", "round": 0, "code": code_norm},
        )

        log.info("WS enter lobby matchId=%s user=%s name=%s", match_id, user_id, username or "-")
        await ws_lobby(websocket, user_id=user_id, user_name=username)
        return
    except Exception as e:
        log.exception("WS fatal error: %s", e)
        await _safe_send_json(websocket, {"type": "error", "message": "internal"})
        await _safe_close(websocket, 1011)
        return
    finally:
        duels_ws_connections.labels(state="closed").inc()
