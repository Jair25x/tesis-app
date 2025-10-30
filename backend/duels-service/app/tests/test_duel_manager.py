import asyncio
import json
import os
import uuid
import time
import contextlib
from types import SimpleNamespace
from typing import List, Optional

import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from app.services import duel_manager as dm
from app.models import Match, RoundPick, RoundConfig, Answer, Round, MatchPlayer

# Tablas a limpiar ANTES de cada test (nunca después, para no cortar tasks vivos)
TABLES_TO_TRUNCATE = [
    "answers",
    "round_picks",
    "round_configs",
    "rounds",
    "match_players",
    "duel_ratings",
    "matches",
]

@pytest.fixture(scope="function")
def test_session_local(monkeypatch):
    """
    Usa el mismo ENGINE para todo y crea sesiones nuevas cuando se llamé SessionLocal().
    Limpieza SOLO al inicio para evitar TRUNCATE mientras aún corre el reader task.
    """
    db_url = os.getenv("DATABASE_URL") or "postgresql+psycopg://postgres:misan@duels-db:5432/duelsdb"
    engine = create_engine(db_url, future=True, pool_pre_ping=True)
    TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)

    # Limpia al inicio
    with engine.begin() as conn:
        for tbl in TABLES_TO_TRUNCATE:
            try:
                conn.execute(text(f'TRUNCATE TABLE "{tbl}" CASCADE'))
            except Exception:
                pass

    # Parchea el SessionLocal del módulo bajo prueba para que cree nuevas sesiones del mismo engine
    def factory():
        return TestingSessionLocal()

    monkeypatch.setattr(dm, "SessionLocal", factory)
    yield factory
    # No hacemos TRUNCATE ni close global aquí; cada test cierra sus sesiones puntuales.


# -------- Helpers --------
class FakeWebSocket:
    def __init__(self, incoming: Optional[List[dict]] = None):
        self._incoming = [json.dumps(m) for m in (incoming or [])]
        self._sent = []
        self._closed = False

    async def receive_text(self) -> str:
        if not self._incoming:
            from fastapi import WebSocketDisconnect
            raise WebSocketDisconnect(code=1000)
        return self._incoming.pop(0)

    async def send_json(self, payload: dict):
        self._sent.append(payload)

    async def close(self, code: int = 1000):
        self._closed = True


def _req_obj(**kwargs):
    return SimpleNamespace(**kwargs)


# -------- TEST 1 --------
def test_create_match_freezes_roundpicks_and_distributes_top_level(test_session_local):
    ex_a = str(uuid.uuid4())
    ex_b = str(uuid.uuid4())

    DB = test_session_local
    db = DB()

    req = _req_obj(
        curriculumId=str(uuid.uuid4()),
        bestOf=2,
        questionsPerRound=2,
        roundPicks=[
            {"round": 1, "qIndex": 1, "exerciseId": ex_a},
            {"n": 2, "qIndex": 2, "exerciseId": ex_b},
        ],
        exerciseIds=[],  # evitamos colisiones
        isPublic=True,
        mode="bestOf",
        questionTimeSec=20,
        maxPlayers=2,
    )

    m = dm.create_match(db, creator_id=str(uuid.uuid4()), req=req)

    rcs = db.query(RoundConfig).filter_by(match_id=m.id).order_by(RoundConfig.n.asc()).all()
    assert len(rcs) == 2
    assert [rc.n for rc in rcs] == [1, 2]
    assert all(rc.questions == 2 for rc in rcs)

    rps = (
        db.query(RoundPick)
        .filter_by(match_id=m.id)
        .order_by(RoundPick.n.asc(), RoundPick.q_index.asc())
        .all()
    )
    frozen = {(rp.n, rp.q_index): str(rp.exercise_id) for rp in rps}
    assert frozen.get((1, 1)) == ex_a
    assert frozen.get((2, 2)) == ex_b

    seen = set()
    for rp in rps:
        key = (rp.n, rp.q_index)
        assert key not in seen
        seen.add(key)

    m2 = db.get(Match, m.id)
    assert m2.status == "WAITING"
    assert isinstance(m2.short_code, str) and len(m2.short_code) >= 4

    db.close()


# -------- TEST 2 --------
@pytest.mark.asyncio
async def test_ws_reader_persists_answer_with_student_id(test_session_local, monkeypatch):
    """
    Valida que el reader persista Answer con la FK a rounds resuelta y el student_id en texto.
    Requisitos del modelo:
      - Round(exercise_id NOT NULL)
      - MatchPlayer solo (match_id, user_id[, joined_at server_default])
    """
    DB = test_session_local

    # --- setup con una sesión ---
    db = DB()

    match_id = str(uuid.uuid4())
    creator_id = str(uuid.uuid4())
    curriculum_id = str(uuid.uuid4())
    ex_pick = str(uuid.uuid4())
    user_id = str(uuid.uuid4())

    m = Match(
        id=match_id,
        creator_id=creator_id,
        curriculum_id=curriculum_id,
        best_of=1,
        status="IN_PROGRESS",
        is_public=True,
        max_players=2,
        mode="bestOf",
        question_time_sec=15,
        questions_per_round=1,
        short_code="ABC123",
    )
    db.add(m)
    db.flush()

    # Round requerido por la FK (match_id, n) y por NOT NULL de exercise_id
    db.add(Round(
        match_id=m.id,
        n=1,
        exercise_id=ex_pick,     # <-- obligatorio por el modelo
        # objective_id=None, started_at/ended_at opcionales
    ))

    db.add(RoundConfig(match_id=m.id, n=1, questions=1, difficulty=None))
    db.add(RoundPick(match_id=m.id, n=1, q_index=1, exercise_id=ex_pick))

    # Registrar jugador con las columnas reales del modelo
    db.add(MatchPlayer(
        match_id=m.id,
        user_id=user_id,
    ))

    db.commit()
    db.close()

    # --- mock de evaluación externa ---
    async def fake_check_answer(ex_id, answer_obj):
        assert str(ex_id) == ex_pick
        return True, 1.0, {"ok": True}

    monkeypatch.setattr(dm, "check_answer", fake_check_answer)

    # --- armar room en ventana válida ---
    room = dm.Room(
        match_id=match_id,
        code="ABC123",
        max_players=2,
        mode="bestOf",
        question_time_ms=15000,
        win_target=None,
        leader_id=creator_id,
        questions_per_round=1,
    )
    room.round_no = 1
    room.q_total = 1
    room.q_index = 1
    room.current_exercise_id = ex_pick
    room.participants_total = 2
    room.question_t0 = time.perf_counter()

    ws = FakeWebSocket(
        incoming=[{
            "type": "answer",
            "round": 1,
            "qIndex": 1,
            # formato compatible con _normalize_answer_payload
            "answer": {"value": {"value": {"choice": "A"}}},
        }]
    )

    room.members[user_id] = ws
    room.names[user_id] = "Estudiante X"

    # --- lanzar reader ---
    task = asyncio.create_task(dm._reader_task(room, user_id, ws))

    # --- poll con sesiones nuevas (para ver commits hechos por el reader) ---
    found = False
    for _ in range(30):  # ~3s
        await asyncio.sleep(0.1)
        db_poll = DB()
        try:
            rows = db_poll.query(Answer).filter_by(
                match_id=match_id, n=1, q_index=1, student_id=user_id
            ).all()
            if len(rows) == 1:
                found = True
                break
        finally:
            db_poll.close()

    # cancelar suavemente el task si sigue vivo
    if not task.done():
        task.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await task

    assert found, "No se encontró Answer persistido (match_id, n=1, q_index=1, student_id) tras esperar 3s"

    # verificación final con una nueva sesión fresca
    db_final = DB()
    try:
        rows = db_final.query(Answer).filter_by(
            match_id=match_id, n=1, q_index=1, student_id=user_id
        ).all()
        assert len(rows) == 1
        a = rows[0]
        assert str(a.student_id) == user_id
        if hasattr(a, "exercise_id"):
            assert str(a.exercise_id) == ex_pick
        if hasattr(a, "payload"):
            assert isinstance(a.payload, dict)
            assert a.payload.get("value", {}).get("choice") == "A"
    finally:
        db_final.close()
