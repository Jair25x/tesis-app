from __future__ import annotations
import logging
import asyncio
from typing import Optional, Dict, Any, List

from ..clients.curriculum import (
    count_exercises,
    first_exercises,
)

log = logging.getLogger("duels.exercise_picker")

# =========================================================
# Async helpers (usan el cliente de curriculum)
# =========================================================

async def _async_available_count_for_objective(
    objective_id: str,
    k: int,
    difficulty: Optional[str] = None,
) -> int:
    """
    1) Intenta conteo exacto via /internal/objectives/exercise-counts (acepta difficulty).
    2) Si falla, hace fallback a first_exercises(objective_id, limit=k) y retorna len(items).
    """
    if not objective_id:
        return 0

    # (1) Preciso (S2S)
    try:
        counts = await count_exercises([objective_id], active=True, difficulty_ui=difficulty)
        total = int(counts.get(objective_id, 0) or 0)
        # Bound razonable por si BE devuelve algo raro
        return max(0, min(total, 10_000))
    except Exception as e:
        log.warning("S2S exact count failed, falling back. err=%s", e)

    # (2) Fallback: pedir algunos y contar
    try:
        items: List[Dict[str, Any]] = await first_exercises(
            objective_id,
            limit=max(1, int(k)),
            active=True,
            difficulty_ui=difficulty,
            random=True,
            order="desc",
        )
        return len(items)
    except Exception as e:
        log.exception("Error fallback first_exercises: %s", e)
        return 0


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
    if difficulty:
        tries.append({**base, "random": True, "difficulty_ui": difficulty})
    tries.append({**base, "random": True})
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
                # El cliente expone items con llave "id" (no "exerciseId")
                # Normalizamos a string
                exid = items[0].get("id") or items[0].get("exerciseId")
                if exid:
                    return str(exid)
        except Exception as e:
            log.info(
                "Picker: no items for objective=%s with params=%s (err=%s)",
                objective_id, params, e
            )
    return None

# =========================================================
# API sincronizada (compat) — safe en contextos sync
# =========================================================

async def available_count_for_objective_async(
    objective_id: str,
    k: int,
    difficulty: Optional[str] = None,
) -> int:
    return await _async_available_count_for_objective(objective_id, k, difficulty)



def available_count_for_objective(
    objective_id: str,
    k: int,
    difficulty: Optional[str] = None,
) -> int:
    """
    Wrapper síncrono sobre available_count_for_objective_async.
    Sólo puede usarse cuando NO hay un event loop corriendo en el hilo actual.
    """
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None

    if loop and loop.is_running():
        raise RuntimeError(
            "available_count_for_objective() no puede llamarse desde un contexto async; "
            "usa available_count_for_objective_async()"
        )

    return asyncio.run(available_count_for_objective_async(objective_id, k, difficulty))


def pick_exercise_for_objective(
    objective_id: str,
    difficulty: Optional[str] = None,
) -> Optional[str]:
    """
    Wrapper síncrono sobre pick_exercise_for_objective_async.
    Se limita a contextos puramente síncronos para evitar asyncio.run() anidados.
    """
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None

    if loop and loop.is_running():
        raise RuntimeError(
            "pick_exercise_for_objective() no puede llamarse desde un contexto async; "
            "usa pick_exercise_for_objective_async()"
        )

    return asyncio.run(pick_exercise_for_objective_async(objective_id, difficulty))
