# app/clients/curriculum.py
from __future__ import annotations

from contextlib import asynccontextmanager
from typing import Dict, List, Optional
import httpx

from ..metrics import duels_check_latency_seconds
from ..config import CURRICULUM_BASE
from .s2s import s2s_token  # helper único

@asynccontextmanager
async def _client():
    headers = {
        "Authorization": f"Bearer {s2s_token(authorities=['ROLE_INTERNAL'])}",
        "X-Internal-Call": "duels-service",
        "X-Auth-Username": "duels-service",
        "X-Auth-Roles": "ROLE_INTERNAL",
        "Content-Type": "application/json",
    }
    async with httpx.AsyncClient(
        base_url=CURRICULUM_BASE,
        timeout=3.0,
        headers=headers,
    ) as c:
        yield c

# ----------------------------
# Helpers de mapeo dificultad
# ----------------------------
_UI_TO_DB = {
    "EASY": "BASIC",
    "MEDIUM": "INTERMEDIATE",
    "HARD": "ADVANCED",
}

def ui_to_db_difficulty(d: Optional[str]) -> Optional[str]:
    if not d:
        return None
    up = str(d).strip().upper()
    return _UI_TO_DB.get(up) or (up if up in ("BASIC", "INTERMEDIATE", "ADVANCED") else None)

# ----------------------------
# Endpoints internos
# ----------------------------
async def check_answer(exercise_id: str, answer: dict) -> tuple[bool, float | None, str | None]:
    with duels_check_latency_seconds.time():
        async with _client() as c:
            r = await c.post(
                f"/internal/curricula/exercises/{exercise_id}/check",
                json={"answer": answer},
            )
    r.raise_for_status()
    data = r.json()
    return bool(data.get("correct")), data.get("score"), data.get("feedback")

async def count_exercises(objective_ids: List[str], *, active: bool = True, difficulty_ui: Optional[str] = None) -> Dict[str, int]:
    if not objective_ids:
        return {}
    diff_db = ui_to_db_difficulty(difficulty_ui)
    body = {"ids": objective_ids, "active": active, "difficulty": diff_db}
    async with _client() as c:
        r = await c.post("/internal/objectives/exercise-counts", json=body)
    r.raise_for_status()
    data = r.json() or {}
    return data.get("counts", {}) or {}

async def first_exercises(
    objective_id: str,
    *,
    limit: int = 3,
    active: bool = True,
    difficulty_ui: Optional[str] = None,
    random: bool = True,
    order: str = "desc",
) -> List[dict]:
    params = {
        "limit": max(1, min(limit, 20)),
        "active": "true" if active else "false",
        "random": "true" if random else "false",
        "order": order if order in ("asc", "desc") else "desc",
    }
    diff_db = ui_to_db_difficulty(difficulty_ui)
    if diff_db:
        params["difficulty"] = diff_db

    async with _client() as c:
        r = await c.get(f"/internal/objectives/{objective_id}/exercises", params=params)
    r.raise_for_status()
    data = r.json() or {}
    return list(data.get("items", []) or [])
