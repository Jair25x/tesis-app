import asyncio
from typing import Any, Dict, List

import pytest

from app.services import exercise_picker


@pytest.mark.asyncio
async def test_available_count_for_objective_async_falls_back(monkeypatch):
    calls: Dict[str, int] = {"count": 0, "first": 0}

    async def fake_count(ids: List[str], *, active: bool = True, difficulty_ui: str | None = None):
        calls["count"] += 1
        raise RuntimeError("boom")

    async def fake_first(
        objective_id: str,
        *,
        limit: int = 3,
        active: bool = True,
        difficulty_ui: str | None = None,
        random: bool = True,
        order: str = "desc",
    ) -> List[Dict[str, Any]]:
        calls["first"] += 1
        assert difficulty_ui == "EASY"
        assert limit == 2
        return [{"id": "ex-1"}, {"id": "ex-2"}]

    monkeypatch.setattr(exercise_picker, "count_exercises", fake_count)
    monkeypatch.setattr(exercise_picker, "first_exercises", fake_first)

    result = await exercise_picker.available_count_for_objective_async("obj-1", 2, "EASY")

    assert result == 2
    assert calls == {"count": 1, "first": 1}


@pytest.mark.asyncio
async def test_pick_exercise_prefers_difficulty(monkeypatch):
    attempts: list[Dict[str, Any]] = []

    async def fake_first(
        objective_id: str,
        *,
        limit: int = 3,
        active: bool = True,
        difficulty_ui: str | None = None,
        random: bool = True,
        order: str = "desc",
    ) -> List[Dict[str, Any]]:
        attempts.append(
            {
                "difficulty_ui": difficulty_ui,
                "random": random,
                "order": order,
            }
        )
        if difficulty_ui:
            return [{"id": "preferred"}]
        return []

    monkeypatch.setattr(exercise_picker, "first_exercises", fake_first)

    result = await exercise_picker.pick_exercise_for_objective_async("obj-1", "EASY")

    assert result == "preferred"
    # Sólo se intenta una vez porque el primer intento devuelve item
    assert attempts == [
        {"difficulty_ui": "EASY", "random": True, "order": "desc"}
    ]


def test_sync_wrappers_reject_running_loop(monkeypatch):
    async def dummy():
        return 0

    async def check():
        with pytest.raises(RuntimeError):
            exercise_picker.available_count_for_objective("obj", 1)
        with pytest.raises(RuntimeError):
            exercise_picker.pick_exercise_for_objective("obj", None)

    monkeypatch.setattr(exercise_picker, "available_count_for_objective_async", dummy)
    monkeypatch.setattr(exercise_picker, "pick_exercise_for_objective_async", dummy)

    asyncio.run(check())