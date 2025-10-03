# app/clients/progress.py
from __future__ import annotations
import httpx
from typing import Dict, Any, List, Optional
from contextlib import asynccontextmanager

from ..config import PROGRESS_BASE
from .s2s import s2s_token  # ← helper unificado

TIMEOUT = 5.0

@asynccontextmanager
async def _client():
    if not PROGRESS_BASE:
        yield None
        return
    headers = {"Authorization": f"Bearer {s2s_token(authorities=['ROLE_INTERNAL'])}"}
    async with httpx.AsyncClient(base_url=PROGRESS_BASE, timeout=TIMEOUT, headers=headers) as c:
        yield c

def _map_to_events_body(full_payload: Dict[str, Any]) -> Dict[str, Any]:
    match_id = str(full_payload.get("matchId", ""))
    winner_id = full_payload.get("winnerId", None)

    rounds: List[Dict[str, Any]] = []
    for r in list(full_payload.get("byRound") or []):
        rounds.append(
            {
                "round": int(r.get("round", 0) or 0),
                "exerciseId": r.get("exerciseId"),
                "winnerId": r.get("winnerId"),
                "result": r.get("result"),
            }
        )
    return {"matchId": match_id, "winnerId": winner_id, "rounds": rounds}

async def send_duel_result(full_payload: Dict[str, Any]) -> None:
    async with _client() as c:
        if c is None:
            return
        try:
            r1 = await c.post("/internal/progress/duels/result", json=full_payload)
            if r1.status_code < 400:
                _ = r1.text
                return
        except Exception:
            pass

        try:
            reduced = _map_to_events_body(full_payload)
            r2 = await c.post("/internal/progress/duels/events", json=reduced)
            _ = r2.text
        except Exception:
            pass
