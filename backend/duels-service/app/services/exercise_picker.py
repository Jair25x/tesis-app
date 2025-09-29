# app/services/exercise_picker.py
import httpx
from typing import Optional
from ..clients.curriculum import _s2s_token
from ..config import CURRICULUM_BASE

async def pick_exercise_for_objective(objective_id: str, difficulty: Optional[str] = None) -> Optional[str]:
    headers = {"Authorization": f"Bearer {_s2s_token()}"}
    params = {
        "limit": 1,
        "active": "true",
        "difficulty": difficulty or "",
        "random": "false",
        "order": "desc",
    }
    async with httpx.AsyncClient(base_url=CURRICULUM_BASE, timeout=3.0, headers=headers) as c:
        r = await c.get(f"/internal/objectives/{objective_id}/exercises", params=params)
    if r.status_code == 200:
        data = r.json() or {}
        items = data.get("items") or []
        if items:
            exid = items[0].get("exerciseId")
            return str(exid) if exid else None
    return None
