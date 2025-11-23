# app/routers/ws.py
from __future__ import annotations
import logging
from typing import Optional, Dict, Any, Tuple

from fastapi import APIRouter, WebSocket, Query
from starlette.websockets import WebSocketState
import jwt
from sqlalchemy.orm import Session

from ..deps import SessionLocal
from ..services.duel_manager import ws_lobby, resolve_short_code
from ..config import JWT_KEY_BYTES, JWT_ALGS, BEHIND_GATEWAY
from ..metrics import duels_ws_connections  # métricas de conexiones

router = APIRouter()
log = logging.getLogger("duels.ws")


class WsAuthError(Exception):
    pass


def _extract_token(
    headers: Dict[str, Any],
    query_params: Dict[str, Any],
) -> Optional[str]:
    """
    Extrae bearer token de:
      - header Authorization: Bearer ...
      - query params: token | access_token
    """
    auth = headers.get("authorization") or headers.get("Authorization")
    if auth and isinstance(auth, str) and auth.lower().startswith("bearer "):
        return auth[7:].strip()

    for k in ("token", "access_token"):
        if k in query_params and query_params[k]:
            return str(query_params[k]).strip()

    return None


def _parse_user(token: str) -> Tuple[Optional[str], Optional[str]]:
    """
    Decodifica el JWT y obtiene (user_id, username).
    Devuelve (None, None) si hay problema.
    """
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
    """
    Resuelve el matchId ya sea por:
      - query param matchId
      - query param code
      - header x-duel-code (inyectado por el gateway)
    """
    qp = dict(ws.query_params)
    headers_lower = {k.lower(): v for k, v in ws.headers.items()}

    # Si el gateway mandó el código por header y aún no está en los query params, úsalo.
    code_hdr = headers_lower.get("x-duel-code")
    if code_hdr and "code" not in qp:
        qp["code"] = code_hdr

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
            # Puede lanzar si el socket se cerró simultáneamente
            pass


async def _safe_close(ws: WebSocket, code: int) -> None:
    if ws.client_state != WebSocketState.DISCONNECTED:
        try:
            await ws.close(code=code)
        except RuntimeError:
            pass


@router.websocket("/ws")
async def ws_endpoint(
    websocket: WebSocket,
    code: Optional[str] = Query(default=None),
    token: Optional[str] = Query(default=None),
):
    await websocket.accept()
    duels_ws_connections.labels(state="open").inc()

    try:
        headers_lower = {k.lower(): v for k, v in websocket.headers.items()}
        qp_dict = dict(websocket.query_params)

        # ============================
        # 1) Resolver usuario
        # ============================
        user_id: Optional[str] = None
        username: Optional[str] = None

        if BEHIND_GATEWAY:
            # --- 1.a) Camino ideal: confiar en el gateway ---
            gw_user_id = headers_lower.get("x-user-id")
            gw_username = (
                headers_lower.get("x-user-name")
                or headers_lower.get("x-user-username")
                or headers_lower.get("x-auth-username")
            )

            if gw_user_id:
                user_id = gw_user_id
                username = gw_username or gw_user_id
                log.info(
                    "WS handshake (gateway headers): uid=%s uname=%s",
                    user_id,
                    username,
                )
            else:
                # --- 1.b) Fallback: intentar JWT directo (útil en dev o si el gateway no inyecta) ---
                log.warning(
                    "WS behind gateway pero sin x-user-id; intentando fallback con token directo. "
                    "headers=%s qp=%s",
                    headers_lower,
                    qp_dict,
                )

                eff_token = token or _extract_token(headers_lower, qp_dict)
                log.info(
                    "WS fallback JWT directo: has_token=%s qp=%s",
                    bool(eff_token),
                    qp_dict,
                )
                user_id, username = _parse_user(eff_token) if eff_token else (None, None)

                if not user_id:
                    # Si ni gateway ni JWT directo funcionan, negar acceso
                    raise WsAuthError("invalid token (no gateway headers)")

        else:
            # ============================
            # 2) Modo sin gateway (dev directo)
            # ============================
            eff_token = token or _extract_token(headers_lower, qp_dict)
            log.info(
                "WS handshake (local token): has_token=%s qp=%s",
                bool(eff_token),
                qp_dict,
            )
            user_id, username = _parse_user(eff_token) if eff_token else (None, None)
            if not user_id:
                raise WsAuthError("invalid token")

        # ============================
        # 3) Resolver match
        # ============================
        match_id, code_norm = _resolve_match_id_and_code(websocket)
        if not match_id:
            await _safe_send_json(
                websocket, {"type": "error", "message": "match not found"}
            )
            await _safe_close(websocket, 1008)
            return

        # Forzar matchId en querystring para compat hacia abajo (ws_lobby)
        websocket.scope["query_string"] = f"matchId={match_id}".encode(
            "utf-8"
        )  # type: ignore[index]

        # Feedback inmediato
        await _safe_send_json(
            websocket,
            {
                "type": "state",
                "status": "WAITING",
                "round": 0,
                "code": code_norm,
            },
        )

        log.info(
            "WS enter lobby matchId=%s user=%s name=%s",
            match_id,
            user_id,
            username or "-",
        )
        await ws_lobby(websocket, user_id=user_id, user_name=username)
        return

    except WsAuthError as e:
        log.warning("WS unauthorized: %s", e)
        await _safe_send_json(websocket, {"type": "error", "message": "unauthorized"})
        await _safe_close(websocket, 1008)
        return
    except Exception as e:
        log.exception("WS fatal error: %s", e)
        await _safe_send_json(websocket, {"type": "error", "message": "internal"})
        await _safe_close(websocket, 1011)
        return
    finally:
        duels_ws_connections.labels(state="closed").inc()
