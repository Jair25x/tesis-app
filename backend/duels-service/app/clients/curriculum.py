from __future__ import annotations

import os
import time
from contextlib import asynccontextmanager
from typing import Dict, List, Optional, Tuple, Any, Literal

import httpx

from ..metrics import duels_check_latency_seconds
from ..config import CURRICULUM_BASE
from .s2s import s2s_token  # helper único

# =========================
# Config
# =========================
_TIMEOUT_SEC = float(os.getenv("CURRICULUM_HTTP_TIMEOUT_SEC", "3.0"))
_RETRIES = int(os.getenv("CURRICULUM_HTTP_RETRIES", "2"))  # total intentos = 1 + _RETRIES
_BACKOFF_BASE_MS = int(os.getenv("CURRICULUM_HTTP_BACKOFF_MS", "120"))

# TTL caches sencillas (en memoria)
_TTL_COUNTS_SEC = float(os.getenv("CURRICULUM_COUNTS_TTL_SEC", "180"))
_TTL_FIRST_EXS_SEC = float(os.getenv("CURRICULUM_FIRST_TTL_SEC", "60"))
_TTL_VALIDATE_SEC = float(os.getenv("CURRICULUM_VALIDATE_TTL_SEC", "180"))

_counts_cache: Dict[str, Tuple[float, Dict[str, int]]] = {}
_first_cache: Dict[str, Tuple[float, List[dict]]] = {}
_validate_cache: Dict[str, Tuple[float, Dict[str, Dict[str, Any]]]] = {}


def _now() -> float:
    return time.time()


def _cache_get(store: dict, key: str):
    item = store.get(key)
    if not item:
        return None
    exp, val = item
    if exp >= _now():
        return val
    store.pop(key, None)
    return None


def _cache_put(store: dict, key: str, ttl: float, value):
    store[key] = (_now() + ttl, value)


@asynccontextmanager
async def _client():
    headers = {
        "Authorization": f"Bearer {s2s_token(authorities=['ROLE_INTERNAL'])}",
        "X-Internal-Call": "duels-service",
        "X-Auth-Username": "duels-service",
        "X-Auth-Roles": "ROLE_INTERNAL",
        "Content-Type": "application/json",
    }
    timeout = httpx.Timeout(_TIMEOUT_SEC)
    async with httpx.AsyncClient(
        base_url=CURRICULUM_BASE,
        timeout=timeout,
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
_DB_TO_UI = {v: k for k, v in _UI_TO_DB.items()}


def ui_to_db_difficulty(d: Optional[str]) -> Optional[str]:
    if not d:
        return None
    up = str(d).strip().upper()
    return _UI_TO_DB.get(up) or (
        up if up in ("BASIC", "INTERMEDIATE", "ADVANCED") else None
    )


def db_to_ui_difficulty(d: Optional[str]) -> Optional[str]:
    if not d:
        return None
    up = str(d).strip().upper()
    return _DB_TO_UI.get(up) or (
        up if up in ("EASY", "MEDIUM", "HARD") else None
    )


# ----------------------------
# Requests con reintentos
# ----------------------------
async def _retry_json(
    method: str,
    url: str,
    *,
    json_body: Any = None,
    params: Dict[str, Any] | None = None,
):
    last_exc = None
    for attempt in range(_RETRIES + 1):
        try:
            async with _client() as c:
                if method == "GET":
                    r = await c.get(url, params=params)
                else:
                    r = await c.post(url, json=json_body, params=params)
            r.raise_for_status()
            return r.json() or {}
        except Exception as e:
            last_exc = e
            if attempt < _RETRIES:
                await _backoff(attempt)
            else:
                raise
    raise last_exc  # pragma: no cover


async def _backoff(attempt: int):
    # backoff lineal simple (suficiente para este volumen)
    ms = _BACKOFF_BASE_MS * max(1, attempt + 1)
    await _sleep_ms(ms)


async def _sleep_ms(ms: int):
    import asyncio
    await asyncio.sleep(ms / 1000.0)


# ----------------------------
# Endpoints internos
# ----------------------------
async def check_answer(
    exercise_id: str,
    answer: dict,
) -> tuple[bool, float | None, str | None]:
    with duels_check_latency_seconds.time():
        data = await _retry_json(
            "POST",
            f"/internal/curricula/exercises/{exercise_id}/check",
            json_body={"answer": answer},
        )
    return bool(data.get("correct")), data.get("score"), data.get("feedback")


async def count_exercises(
    objective_ids: List[str],
    *,
    active: bool = True,
    difficulty_ui: Optional[str] = None,
) -> Dict[str, int]:
    if not objective_ids:
        return {}
    diff_db = ui_to_db_difficulty(difficulty_ui)
    body = {"ids": objective_ids, "active": active, "difficulty": diff_db}

    key = f"counts:{sorted(objective_ids)}:{active}:{diff_db}"
    cached = _cache_get(_counts_cache, key)
    if cached is not None:
        return cached

    data = await _retry_json(
        "POST",
        "/internal/objectives/exercise-counts",
        json_body=body,
    )
    counts = data.get("counts", {}) or {}
    _cache_put(_counts_cache, key, _TTL_COUNTS_SEC, counts)
    return counts


async def first_exercises(
    objective_id: str,
    *,
    limit: int = 3,
    active: bool = True,
    difficulty_ui: Optional[str] = None,
    random: bool = True,
    order: str = "desc",
) -> List[dict]:
    """
    Devuelve una lista de ejercicios para un OA:
      - Si random=true → NO se cachea (la respuesta debe ser aleatoria).
      - Si random=false → se cachea (respuesta determinista).
    """
    params: Dict[str, Any] = {
        "limit": max(1, min(limit, 20)),
        "active": "true" if active else "false",
        "random": "true" if random else "false",
        "order": order if order in ("asc", "desc") else "desc",
    }

    diff_db = ui_to_db_difficulty(difficulty_ui)
    if diff_db:
        params["difficulty"] = diff_db

    # ⚠️ Solo cacheamos cuando la respuesta es determinista:
    # random=false → el backend debe devolver siempre lo mismo
    cacheable = (params["random"] == "false")

    key = f"first:{objective_id}:{params}"

    if cacheable:
        cached = _cache_get(_first_cache, key)
        if cached is not None:
            return cached

    data = await _retry_json(
        "GET",
        f"/internal/objectives/{objective_id}/exercises",
        params=params,
    )
    items = list(data.get("items", []) or [])

    if cacheable:
        _cache_put(_first_cache, key, _TTL_FIRST_EXS_SEC, items)

    return items


# ----------------------------
# VALIDACIÓN batch de exercises
# ----------------------------
async def validate_exercises(
    objective_id: Optional[str],
    ids: List[str],
) -> Dict[str, Dict[str, Any]]:
    """
    Retorna un dict:
      { "<exerciseId>": {"belongs": bool|None, "active": bool|None, "difficultyUi": "EASY|...|None"} }
    - Si objective_id es None, 'belongs' será None (no se valida pertenencia).
    """
    if not ids:
        return {}

    # Cache
    key = f"validate:{objective_id}:{sorted(ids)}"
    cached = _cache_get(_validate_cache, key)
    if cached is not None:
        return cached

    if objective_id:
        # Endpoint interno batch (OA + estado + dificultad)
        data = await _retry_json(
            "POST",
            f"/internal/objectives/{objective_id}/validate-exercises",
            json_body={"ids": ids},
        )
        out: Dict[str, Dict[str, Any]] = {}
        for it in data.get("items", []) or []:
            eid = str(it.get("id"))
            belongs = bool(it.get("belongs", False))
            active = bool(it.get("active", False))
            diff_db = it.get("difficulty")
            out[eid] = {
                "belongs": belongs,
                "active": active,
                "difficultyUi": db_to_ui_difficulty(diff_db),
            }
        _cache_put(_validate_cache, key, _TTL_VALIDATE_SEC, out)
        return out
    else:
        # Sin OA: validar 'active' y 'difficulty' usando un endpoint general
        data = await _retry_json(
            "POST",
            "/internal/exercises/lookup",
            json_body={"ids": ids},
        )
        out: Dict[str, Dict[str, Any]] = {}
        for it in data.get("items", []) or []:
            eid = str(it.get("id"))
            active = bool(it.get("active", False))
            diff_db = it.get("difficulty")
            out[eid] = {
                "belongs": None,  # no hay OA
                "active": active,
                "difficultyUi": db_to_ui_difficulty(diff_db),
            }
        _cache_put(_validate_cache, key, _TTL_VALIDATE_SEC, out)
        return out
