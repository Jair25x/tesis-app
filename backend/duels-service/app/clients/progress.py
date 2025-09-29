# app/clients/progress.py
from __future__ import annotations
import os, time, jwt
import httpx
from typing import Dict, Any, List, Optional
from contextlib import asynccontextmanager
from ..config import PROGRESS_BASE, S2S_JWT_SECRET

S2S_ISS = os.getenv("S2S_JWT_ISSUER", "duels-service")
TIMEOUT = float(os.getenv("PROGRESS_TIMEOUT", "5.0"))

def _s2s_token() -> str:
    now = int(time.time())
    return jwt.encode(
        {
            "sub": "duels-service",
            "roles": ["INTERNAL"],
            "iss": S2S_ISS,
            "iat": now,
            "exp": now + 60,
        },
        S2S_JWT_SECRET,
        algorithm="HS256",
    )

@asynccontextmanager
async def _client():
    if not PROGRESS_BASE:
        yield None
        return
    headers = {"Authorization": f"Bearer {_s2s_token()}"}
    async with httpx.AsyncClient(base_url=PROGRESS_BASE, timeout=TIMEOUT, headers=headers) as c:
        yield c

def _map_to_events_body(full_payload: Dict[str, Any]) -> Dict[str, Any]:
    """Reduce el payload 'rico' del duels-service al formato /events existente."""
    match_id = str(full_payload.get("matchId", ""))
    winner_id = full_payload.get("winnerId", None)

    # Mapeo de byRound → rounds (estructura mínima esperada)
    rounds: List[Dict[str, Any]] = []
    for r in list(full_payload.get("byRound") or []):
        rounds.append(
            {
                "round": int(r.get("round", 0) or 0),
                "exerciseId": r.get("exerciseId"),
                "winnerId": r.get("winnerId"),
                "result": r.get("result"),  # opcional; DTO actual lo soporta
            }
        )
    return {"matchId": match_id, "winnerId": winner_id, "rounds": rounds}

async def send_duel_result(full_payload: Dict[str, Any]) -> None:
    """
    1) Intenta POST /internal/progress/duels/result con el payload completo.
    2) Si 404/405 (aún no existe en progress), hace fallback a /internal/progress/duels/events
       con el body reducido.
    best-effort: no levanta excepción si falla.
    """
    async with _client() as c:
        if c is None:
            return

        # Primero, endpoint "rico"
        try:
            r1 = await c.post("/internal/progress/duels/result", json=full_payload)
            if r1.status_code < 400:
                _ = r1.text  # no raise; best-effort
                return
        except Exception:
            # caemos a fallback
            pass

        # Fallback al endpoint actual
        try:
            reduced = _map_to_events_body(full_payload)
            r2 = await c.post("/internal/progress/duels/events", json=reduced)
            _ = r2.text  # no raise; best-effort
        except Exception:
            pass
