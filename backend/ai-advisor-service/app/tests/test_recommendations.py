# app/tests/test_recommendations.py
from __future__ import annotations

import uuid
import pytest

import app.api.routers.recommendations as reco_module


class _FakeResult:
    def __init__(self, rows):
        self._rows = rows

    def mappings(self):
        class _M(list):
            def all(self_):  # noqa: N802
                return list(self_)
        return _M(self._rows)


class FakeSession:
    def __init__(self, rows):
        self._rows = rows

    def execute(self, sql, params):
        sql_s = str(sql).lower()
        if "select objective_id, attempts, corrects" in sql_s:
            return _FakeResult(self._rows)
        return _FakeResult([])

    def commit(self): pass
    def rollback(self): pass


class FakeCurriculumClient:
    def get_first_exercise(self, objective_id, difficulty=None, random=True):
        return {
            "exerciseId": str(uuid.uuid4()),
            "objectiveId": str(objective_id),
            "difficulty": "EASY",
            "title": "Ejercicio de prueba",
        }


@pytest.fixture
def fake_reco_env(monkeypatch):
    # Parchar get_db
    rows = [{
        "objective_id": uuid.uuid4(),
        "attempts": 5,
        "corrects": 2,
        "avg_score": 2.5,
        "last_attempt_at": None,
        "streak": 1,
    }]
    def _yield_db():
        yield FakeSession(rows)
    monkeypatch.setattr(reco_module, "get_db", _yield_db)

    # Parchar cliente de currículo
    def _yield_curr():
        return FakeCurriculumClient()
    monkeypatch.setattr(reco_module, "get_curriculum_client", _yield_curr)

    # Evitar cache redis
    def _yield_redis():
        return None
    monkeypatch.setattr(reco_module, "get_redis", _yield_redis)

    return True


def test_recommendations_me(client, student_headers, fake_reco_env):
    r = client.get("/api/ai/recommendations/students/me?limit=3", headers=student_headers)
    assert r.status_code == 200
    body = r.json()
    assert "generatedAt" in body
    assert isinstance(body["items"], list)
    # Con nuestro fake siempre habrá 1 ítem
    assert len(body["items"]) >= 1
    assert "exerciseId" in body["items"][0]
