# app/clients/curriculum.py
import httpx, time, jwt
from contextlib import asynccontextmanager
from ..metrics import duels_check_latency_seconds
from ..config import CURRICULUM_BASE
from ..config import JWT_SECRET as PUBLIC_JWT  # si necesitas
from ..config import S2S_JWT_SECRET, PROGRESS_BASE  # noqa
import os

S2S_ISS = os.getenv("S2S_JWT_ISSUER", "duels-service")

def _s2s_token():
    now = int(time.time())
    payload = {
        "sub": "duels-service",
        "roles": ["INTERNAL"],
        "iss": S2S_ISS,
        "iat": now,
        "exp": now + 60,  # 1 minuto
    }
    return jwt.encode(payload, S2S_JWT_SECRET, algorithm="HS512")

@asynccontextmanager
async def _client():
    headers = {"Authorization": f"Bearer {_s2s_token()}"}
    async with httpx.AsyncClient(base_url=CURRICULUM_BASE, timeout=3.0, headers=headers) as c:
        yield c

async def check_answer(exercise_id: str, answer: dict) -> tuple[bool, float | None, str | None]:
    # Tu endpoint:
    # POST /internal/curricula/exercises/{exerciseId}/check  (INTERNAL)
    with duels_check_latency_seconds.time():
        async with _client() as c:
            r = await c.post(f"/internal/curricula/exercises/{exercise_id}/check", json={"answer": answer})
    r.raise_for_status()
    data = r.json()
    return bool(data.get("correct")), data.get("score"), data.get("feedback")
