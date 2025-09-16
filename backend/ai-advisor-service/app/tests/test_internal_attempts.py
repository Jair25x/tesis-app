# app/tests/test_internal_attempts.py
from __future__ import annotations

import uuid
import types
import pytest

import app.api.routers.internal as internal_module


class _FakeResult:
    def __init__(self, rowcount: int = 0, rows=None):
        self.rowcount = rowcount
        self._rows = rows or []

    def mappings(self):
        class _M(list):
            def all(self_):  # noqa: N802
                return list(self_)
        return _M(self._rows)


class FakeSession:
    def __init__(self):
        self.events_seen = set()

    def execute(self, sql, params):
        sql_s = str(sql).lower()
        if "insert into advisor_events" in sql_s:
            sid = params["sid"]
            if sid in self.events_seen:
                return _FakeResult(rowcount=0)
            self.events_seen.add(sid)
            return _FakeResult(rowcount=1)
        if "insert into student_objective_stats" in sql_s or "on conflict (student_id, objective_id)" in sql_s:
            return _FakeResult(rowcount=1)
        return _FakeResult(rowcount=0)

    def commit(self):
        pass

    def rollback(self):
        pass


@pytest.fixture
def fake_db(monkeypatch):
    def _yield():
        yield FakeSession()
    monkeypatch.setattr(internal_module, "get_db", _yield)
    return True


def test_internal_attempts_ingest_and_duplicate(client, internal_headers, fake_db):
    payload = {
        "studentId": str(uuid.uuid4()),
        "source": "ASSESSMENT",
        "curriculumId": str(uuid.uuid4()),
        "exerciseId": str(uuid.uuid4()),
        "correct": True,
        "score": 3.0,
        "points": 5,
        "objectiveId": str(uuid.uuid4()),
        "metadata": {
            "assignmentId": str(uuid.uuid4()),
            "submissionId": str(uuid.uuid4()),
            "submissionItemId": str(uuid.uuid4()),
            "gradingMode": "AUTO",
        },
    }
    r1 = client.post("/internal/advisor/attempts", json=payload, headers=internal_headers)
    assert r1.status_code == 200
    assert r1.json()["status"] == "ingested"

    r2 = client.post("/internal/advisor/attempts", json=payload, headers=internal_headers)
    assert r2.status_code == 200
    assert r2.json()["status"] == "duplicate"
