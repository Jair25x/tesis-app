from __future__ import annotations
import logging
import asyncio
import os
import time
from typing import Optional, Dict, Any, List, Tuple, Literal

from ..clients.curriculum import (
    count_exercises,
    first_exercises,
)

log = logging.getLogger("duels.exercise_picker")

# =========================================================
# Config por env (valores seguros por defecto)
# =========================================================
_AVAIL_TIMEOUT_SEC = float(os.getenv("DUELS_AVAILABILITY_TIMEOUT_SEC", "2.5"))
_CACHE_TTL_SEC = float(os.getenv("DUELS_AVAILABILITY_CACHE_TTL_SEC", "180"))

# Cache local simple (clave->(exp_ts, value))
# value = (count:int, source: "server"|"sample")
_cache: Dict[str, Tuple[float, Tuple[int, Literal["server", "sample"]]]] = {}


def _cache_key(objective_id: str, k: int, difficulty: Optional[str]) -> str:
    d = (difficulty or "").upper()
    return f"avail:{objective_id}:{k}:{d}"


def _put_cache(key: str, value: Tuple[int, Literal["server", "sample"]]):
    _cache[key] = (time.time() + _CACHE_TTL_SEC, value)


def _get_cache(key: str) -> Optional[Tuple[int, Literal["server", "sample"]]]:
    exp, val = _cache.get(key, (0.0, (0, "sample")))
    if exp > time.time():
        return val
    _cache.pop(key, None)
    return None


# =========================================================
# Async helpers (usan el cliente de curriculum)
# =========================================================

async def _async_available_count_for_objective_raw(
    objective_id: str,
    k: int,
    difficulty: Optional[str] = None,
) -> Tuple[int, Literal["server", "sample"]]:
    """
    1) Intenta conteo exacto via /internal/objectives/exercise-counts (acepta difficulty) -> source="server".
    2) Si falla, fallback a first_exercises(objective_id, limit=k) y retorna len(items) -> source="sample".
    """
    if not objective_id:
        return 0, "sample"

    # (1) Preciso (S2S) con timeout
    try:
        async def _exact():
            counts = await count_exercises([objective_id], active=True, difficulty_ui=difficulty)
            total = int(counts.get(objective_id, 0) or 0)
            # Cap razonable (defensa)
            return max(0, min(total, 10_000))

        total = await asyncio.wait_for(_exact(), timeout=_AVAIL_TIMEOUT_SEC)
        return total, "server"
    except Exception as e:
        log.warning(
            "S2S exact count failed (using fallback). objective=%s diff=%s err=%s",
            objective_id,
            difficulty,
            e,
        )

    # (2) Fallback: pedir algunos y contar
    try:
        async def _fallback():
            items: List[Dict[str, Any]] = await first_exercises(
                objective_id,
                limit=max(1, int(k)),
                active=True,
                difficulty_ui=difficulty,
                random=True,
                order="desc",
            )
            return len(items)

        total = await asyncio.wait_for(_fallback(), timeout=_AVAIL_TIMEOUT_SEC)
        return total, "sample"
    except Exception as e:
        log.exception(
            "Error fallback first_exercises objective=%s diff=%s err=%s",
            objective_id,
            difficulty,
            e,
        )
        return 0, "sample"


async def available_count_for_objective_async(
    objective_id: str,
    k: int,
    difficulty: Optional[str] = None,
) -> Tuple[int, Literal["server", "sample"]]:
    """
    Versión async con cache local. Usa conteo exacto vía S2S y,
    si falla, hace un sample basado en first_exercises.
    """
    key = _cache_key(objective_id, max(1, int(k)), (difficulty or "").upper() or None)
    cached = _get_cache(key)
    if cached is not None:
        return cached

    result = await _async_available_count_for_objective_raw(objective_id, k, difficulty)
    _put_cache(key, result)
    return result


async def pick_exercise_for_objective_async(
    objective_id: str,
    difficulty: Optional[str] = None,
) -> Optional[str]:
    """
    Estrategia progresiva (toda async) para elegir 1 ejercicio:
      1) random=true + difficulty (si viene)
      2) random=true sin difficulty
      3) random=false, order=desc (últimos)
    Retorna el exerciseId o None.
    """
    if not objective_id:
        return None

    tries: List[Dict[str, Any]] = []
    base: Dict[str, Any] = {"limit": 1, "active": True}

    # 1) Primero intentamos con dificultad UI si se pasó
    if difficulty:
        tries.append({**base, "random": True, "difficulty_ui": difficulty})

    # 2) Luego random sin dificultad
    tries.append({**base, "random": True})

    # 3) Finalmente, determinista (últimos)
    tries.append({**base, "random": False, "order": "desc"})

    for params in tries:
        try:
            items = await first_exercises(
                objective_id,
                limit=int(params.get("limit", 1) or 1),
                active=bool(params.get("active", True)),
                difficulty_ui=params.get("difficulty_ui"),
                random=bool(params.get("random", True)),
                order=str(params.get("order", "desc")),
            )
            if items:
                exid = items[0].get("id") or items[0].get("exerciseId")
                if exid:
                    return str(exid)
        except Exception as e:
            log.info(
                "Picker: no items for objective=%s with params=%s (err=%s)",
                objective_id,
                params,
                e,
            )

    return None


# =========================================================
# Wrappers sync (para handlers sync). Evitan asyncio.run() dentro de loop activo.
# =========================================================

def available_count_for_objective(
    objective_id: str,
    k: int,
    difficulty: Optional[str] = None,
) -> Tuple[int, Literal["server", "sample"]]:
    """
    Wrapper síncrono para contexts no-async (por ejemplo, endpoints HTTP sync).
    """
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None

    if loop and loop.is_running():
        # Seguridad: no hacer asyncio.run dentro de un loop activo
        raise RuntimeError(
            "available_count_for_objective(): usa la versión async dentro de contextos async"
        )

    return asyncio.run(available_count_for_objective_async(objective_id, k, difficulty))


def pick_exercise_for_objective(
    objective_id: str,
    difficulty: Optional[str] = None,
) -> Optional[str]:
    """
    Wrapper síncrono de pick_exercise_for_objective_async.
    """
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None

    if loop and loop.is_running():
        raise RuntimeError(
            "pick_exercise_for_objective(): usa la versión async dentro de contextos async"
        )

    return asyncio.run(pick_exercise_for_objective_async(objective_id, difficulty))
