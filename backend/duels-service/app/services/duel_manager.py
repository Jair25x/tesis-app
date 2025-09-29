# app/services/duel_manager.py
from __future__ import annotations
import json, time, uuid, asyncio, logging, contextlib
from dataclasses import dataclass, field
from typing import Optional, Dict, Tuple

from fastapi import WebSocket, WebSocketDisconnect
from sqlalchemy import select, func, exists, and_
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from ..deps import SessionLocal
from ..models import Match, Round, Answer, DuelRating, MatchPlayer
from ..metrics import duels_round_duration_seconds, duels_answers_total
from ..clients.curriculum import check_answer
from ..clients.progress import send_duel_result
# from .exercise_picker import pick_exercise_for_objective  # si lo usas más adelante
from .shortcode import gen_short_code

log = logging.getLogger("duels.manager")

COUNTDOWN_SEC = 3
ROUND_MS_DEFAULT = 30_000  # fallback si no viene en match.question_time_sec
DEFAULT_MAX_PLAYERS = 2

# -------------------------------------------------------------------
# Short code & CRUD
# -------------------------------------------------------------------
def _ensure_short_code(db: Session, length: int = 6) -> str:
    for _ in range(15):
        code = gen_short_code(length)
        exists_q = db.scalar(
            select(func.count()).select_from(Match).where(func.upper(Match.short_code) == code.upper())
        )
        if not exists_q:
            return code
    return gen_short_code(8)

def _matchplayer_exists(db: Session, match_id: str, user_id: str) -> bool:
    q = select(exists().where(and_(MatchPlayer.match_id == match_id, MatchPlayer.user_id == user_id)))
    return bool(db.scalar(q))

def create_match(db: Session, *, creator_id: str, req) -> Match:
    m = Match(
        id=str(uuid.uuid4()),
        creator_id=creator_id,
        opponent_id=getattr(req, "opponentId", None),  # legacy 1v1
        curriculum_id=req.curriculumId,
        best_of=(req.bestOf or 1),
        status="WAITING",
        is_public=bool(getattr(req, "isPublic", True)),
        max_players=int(getattr(req, "maxPlayers", DEFAULT_MAX_PLAYERS) or DEFAULT_MAX_PLAYERS),
        mode=str(getattr(req, "mode", "bestOf") or "bestOf"),
        question_time_sec=getattr(req, "questionTimeSec", None),
        win_target=getattr(req, "winTarget", None),
    )
    m.short_code = _ensure_short_code(db)
    db.add(m)

    if getattr(req, "exerciseIds", None):
        for i, exid in enumerate(req.exerciseIds[: m.best_of], start=1):
            r = Round(match_id=m.id, n=i, exercise_id=str(exid), objective_id=getattr(req, "objectiveId", None))
            db.add(r)

    db.flush()

    # Registrar creador como jugador (exists correcto)
    if not _matchplayer_exists(db, m.id, creator_id):
        db.add(MatchPlayer(match_id=m.id, user_id=creator_id))
        db.flush()

    return m

def list_open_matches(db: Session, *, curriculum_id: Optional[str] = None, limit: int = 50) -> list[Match]:
    q = (
        select(Match)
        .where(Match.status == "WAITING", Match.is_public == True)  # noqa
        .order_by(Match.created_at.desc())
        .limit(limit)
    )
    if curriculum_id:
        q = q.where(Match.curriculum_id == curriculum_id)
    return list(db.scalars(q))

def resolve_short_code(db: Session, code: str) -> Optional[str]:
    m = db.scalar(select(Match).where(func.upper(Match.short_code) == code.upper()))
    return m.id if m else None

# -------------------------------------------------------------------
# Elo rating (sólo 1v1; si N>2, lo omitimos)
# -------------------------------------------------------------------
def _get_rating(db: Session, user_id: str) -> int:
    r = db.get(DuelRating, user_id)
    if r:
        return r.rating
    r = DuelRating(user_id=user_id, rating=1000)
    db.add(r); db.flush()
    return r.rating

def _set_rating(db: Session, user_id: str, rating: int):
    r = db.get(DuelRating, user_id)
    if not r:
        db.add(DuelRating(user_id=user_id, rating=rating))
    else:
        r.rating = rating

def apply_elo(db: Session, winner_id: Optional[str], player_a: str, player_b: str, k: int = 24):
    ra = _get_rating(db, player_a); rb = _get_rating(db, player_b)
    ea = 1 / (1 + 10 ** ((rb - ra) / 400))
    eb = 1 / (1 + 10 ** ((ra - rb) / 400))
    if winner_id is None:
        sa, sb = 0.5, 0.5
    else:
        sa, sb = (1.0, 0.0) if winner_id == player_a else (0.0, 1.0)
    _set_rating(db, player_a, round(ra + k * (sa - ea)))
    _set_rating(db, player_b, round(rb + k * (sb - eb)))

# -------------------------------------------------------------------
# Room registry (en memoria)
# -------------------------------------------------------------------
@dataclass
class Room:
    match_id: str
    code: Optional[str]
    max_players: int
    mode: str
    question_time_ms: int
    win_target: Optional[int]
    members: Dict[str, WebSocket] = field(default_factory=dict)     # userId -> ws
    ready: set[str] = field(default_factory=set)
    lock: asyncio.Lock = field(default_factory=asyncio.Lock)
    orchestrator_started: bool = False
    round_no: int = 0
    current_exercise_id: Optional[str] = None
    round_t0: Optional[float] = None
    closed: bool = False
    leader_id: Optional[str] = None  # creator
    keepalive_tasks: Dict[str, asyncio.Task] = field(default_factory=dict)

ROOMS: Dict[str, Room] = {}
ROOMS_LOCK = asyncio.Lock()

async def _load_room_from_db(match_id: str) -> Room | None:
    db = SessionLocal()
    try:
        m = db.get(Match, match_id)
        if not m:
            return None
        qms = (m.question_time_sec or (ROUND_MS_DEFAULT // 1000)) * 1000
        return Room(
            match_id=match_id,
            code=m.short_code,
            max_players=m.max_players or DEFAULT_MAX_PLAYERS,
            mode=m.mode or "bestOf",
            question_time_ms=int(qms),
            win_target=m.win_target,
            leader_id=m.creator_id,
        )
    finally:
        db.close()

async def _get_room(match_id: str) -> Room | None:
    async with ROOMS_LOCK:
        r = ROOMS.get(match_id)
        if r:
            return r
        r = await _load_room_from_db(match_id)
        if r:
            ROOMS[match_id] = r
        return r

async def _broadcast(room: Room, payload: dict):
    drop: list[str] = []
    for uid, ws in list(room.members.items()):
        try:
            await ws.send_json(payload)
        except Exception:
            drop.append(uid)
    if drop:
        async with room.lock:
            for uid in drop:
                room.members.pop(uid, None)
                room.ready.discard(uid)

async def _send_state(room: Room):
    await _broadcast(room, {
        "type": "state",
        "status": "WAITING" if room.round_no == 0 and not room.closed else ("RESULTS" if room.closed else "ROUND"),
        "round": room.round_no,
        "code": room.code,
        "ready": len(room.ready),
        "players": len(room.members),
        "maxPlayers": room.max_players,
    })

# -------------------------------------------------------------------
# Heartbeat (ping/pong)
# -------------------------------------------------------------------
async def _keepalive(ws: WebSocket, user_id: str):
    try:
        while True:
            await asyncio.sleep(25)
            await ws.send_json({"type": "ping"})
    except Exception:
        # se cerrará en onclose
        pass

# -------------------------------------------------------------------
# WS readers por conexión
# -------------------------------------------------------------------
async def _reader_task(room: Room, user_id: str, ws: WebSocket):
    while True:
        try:
            msg = await ws.receive_text()
        except WebSocketDisconnect:
            break
        except Exception:
            break

        try:
            data = json.loads(msg)
        except Exception:
            continue

        t = data.get("type")
        if t == "pong":
            continue

        if t == "ready":
            async with room.lock:
                room.ready.add(user_id)
            await _send_state(room)
            continue

        if t == "answer":
            n = int(data.get("round") or 0)
            if n <= 0 or n != room.round_no or not room.current_exercise_id:
                continue
            answer = data.get("answer") or {}
            # Evalúa y persiste
            try:
                correct, _score, _fb = await check_answer(room.current_exercise_id, answer)
            except Exception:
                correct = False
            elapsed_ms = 0
            if room.round_t0 is not None:
                elapsed_ms = max(0, int((time.perf_counter() - room.round_t0) * 1000))
            duels_answers_total.labels(correct="true" if correct else "false").inc()

            db = SessionLocal()
            try:
                a = Answer(
                    match_id=room.match_id, n=n, student_id=user_id,
                    correct=bool(correct), time_ms=elapsed_ms
                )
                db.add(a); db.commit()
            except IntegrityError:
                db.rollback()
            finally:
                db.close()

# -------------------------------------------------------------------
# Orquestador
# -------------------------------------------------------------------
async def _orchestrator(room: Room):
    # Espera jugadores suficientes y registra MatchPlayer
    while True:
        if room.closed:
            return
        db = SessionLocal()
        try:
            m = db.get(Match, room.match_id)
            if not m:
                return

            # Inserta jugadores conectados en match_players
            for uid in list(room.members.keys()):
                if not _matchplayer_exists(db, room.match_id, uid):
                    db.add(MatchPlayer(match_id=room.match_id, user_id=uid))
            db.commit()

            if len(room.members) >= 2:
                break
        finally:
            db.close()
        await asyncio.sleep(0.25)

    await _send_state(room)

    # Lobby: todos listos (o al menos min(players, max_players))
    while True:
        if room.closed:
            return
        async with room.lock:
            ready = len(room.ready)
            players = len(room.members)
            all_ready = players >= 2 and ready >= min(players, room.max_players)
        if all_ready:
            break
        await asyncio.sleep(0.2)

    # Countdown
    for sec in range(COUNTDOWN_SEC, 0, -1):
        if room.closed:
            return
        await _broadcast(room, {"type": "countdown", "sec": sec})
        await asyncio.sleep(1)

    # Cargar datos del match
    db = SessionLocal()
    try:
        m = db.get(Match, room.match_id)
        if not m:
            return
        best_of = m.best_of
        mode = m.mode or "bestOf"
        needed = best_of // 2 + 1 if mode == "bestOf" else None
        qtime_ms = room.question_time_ms or ROUND_MS_DEFAULT

        # Participantes (N jugadores)
        rows = list(db.scalars(select(MatchPlayer).where(MatchPlayer.match_id == room.match_id)))
        participants = {r.user_id for r in rows} or set(room.members.keys())
    finally:
        db.close()

    score: Dict[str, int] = {uid: 0 for uid in participants}
    by_round: list[dict] = []
    winner_id: Optional[str] = None

    def _round_end_winner(reg_map: Dict[str, tuple[bool, Optional[int]]]) -> Optional[str]:
        winners = [(uid, t) for uid, (c, t) in reg_map.items() if c and t is not None]
        if not winners:
            return None
        winners.sort(key=lambda x: x[1])
        return winners[0][0]

    rounds_to_play = best_of if mode in ("bestOf", "timePerQuestion") else 10

    for n in range(1, rounds_to_play + 1):
        if room.closed:
            return

        # ejercicio (si no existe para esta ronda, crea placeholder)
        db = SessionLocal()
        try:
            r: Round | None = db.query(Round).filter_by(match_id=room.match_id, n=n).one_or_none()
            if not r:
                exercise_id = str(uuid.uuid4())  # TODO: integrar picker real
                r = Round(match_id=room.match_id, n=n, exercise_id=exercise_id)
                db.add(r); db.commit()
            exercise_id = r.exercise_id
        finally:
            db.close()

        # Inicia ronda
        room.round_no = n
        room.current_exercise_id = exercise_id
        room.round_t0 = time.perf_counter()
        await _broadcast(room, {"type": "round_start", "round": n, "exercise": {"id": exercise_id}})

        deadline = time.time() + ((qtime_ms or ROUND_MS_DEFAULT) / 1000.0)

        # Espera: todos contesten o timeout
        while time.time() < deadline:
            if room.closed:
                return
            db = SessionLocal()
            try:
                a_rows = db.query(Answer).filter_by(match_id=room.match_id, n=n).all()
                got = {str(a.student_id) for a in a_rows}
                if got.issuperset(participants):
                    break
            finally:
                db.close()
            await asyncio.sleep(0.1)

        # margen
        await asyncio.sleep(0.2)

        # Leer respuestas y decidir ganador de la ronda
        start_perf = room.round_t0 or time.perf_counter()
        db = SessionLocal()
        try:
            a_rows = db.query(Answer).filter_by(match_id=room.match_id, n=n).all()
            reg = {str(a.student_id): (a.correct, a.time_ms) for a in a_rows}
        finally:
            db.close()

        duels_round_duration_seconds.observe(max(0.0, time.perf_counter() - start_perf))

        round_winner: Optional[str] = _round_end_winner(reg)

        result_map = {uid: {"correct": bool(reg.get(uid, (False, None))[0]),
                            "timeMs": reg.get(uid, (False, None))[1]} for uid in participants}
        payload = {"round": n, "exerciseId": exercise_id, "result": result_map, "winnerId": round_winner}
        by_round.append(payload)

        if round_winner:
            score[round_winner] = score.get(round_winner, 0) + 1

        await _broadcast(room, {"type": "round_end", "round": n, "score": score})

        if mode == "bestOf" and needed is not None:
            if any(v >= needed for v in score.values()):
                winner_id = max(score.items(), key=lambda kv: kv[1])[0]
                break
        elif mode == "firstToAll":
            target = m.win_target or 5
            if any(v >= target for v in score.values()):
                winner_id = max(score.items(), key=lambda kv: kv[1])[0]
                break

    if winner_id is None:
        ordered = sorted(score.items(), key=lambda kv: kv[1], reverse=True)
        if len(ordered) >= 1:
            if len(ordered) == 1 or ordered[0][1] > ordered[1][1]:
                winner_id = ordered[0][0]
            else:
                winner_id = None

    await _broadcast(room, {"type": "final", "winnerId": winner_id, "byRound": by_round, "score": score})

    db = SessionLocal()
    try:
        m = db.get(Match, room.match_id)
        if m and m.status != "FINISHED":
            m.status = "FINISHED"
            db.add(m)
            if len(score) == 2:
                players = list(score.keys())
                a, b = players[0], players[1]
                apply_elo(db, winner_id, a, b)
            db.commit()
    finally:
        db.close()

    with contextlib.suppress(Exception):
        await send_duel_result({
            "matchId": room.match_id,
            "mode": room.mode,
            "winnerId": winner_id,
            "score": score,
            "byRound": by_round,
            "finishedAt": int(time.time() * 1000),
        })

    await _broadcast(room, {"type": "state", "status": "RESULTS"})
    async with room.lock:
        room.closed = True
        members = list(room.members.items())
    for uid, ws in members:
        with contextlib.suppress(Exception):
            await ws.close(code=1000)

# -------------------------------------------------------------------
# WS entrypoint
# -------------------------------------------------------------------
async def ws_lobby(ws: WebSocket, user_id: str):
    params = dict(ws.query_params)
    match_id = params.get("matchId")
    if not match_id:
        await ws.close(code=1008)
        return
    match_id = str(match_id)

    room = await _get_room(match_id)
    if not room:
        await ws.send_json({"type": "error", "message": "Match not found"})
        await ws.close(code=1008)
        return

    # Validaciones básicas
    db = SessionLocal()
    try:
        m: Match | None = db.get(Match, match_id)
        if not m:
            await ws.send_json({"type": "error", "message": "Match not found"}); await ws.close(code=1008); return
        if m.status == "FINISHED":
            await ws.send_json({"type": "error", "message": "match finished"}); await ws.close(code=1000); return
        if len(room.members) >= (m.max_players or DEFAULT_MAX_PLAYERS) and user_id not in room.members:
            await ws.send_json({"type": "error", "message": "room full"}); await ws.close(code=1008); return
    finally:
        db.close()

    # Unir
    async with room.lock:
        room.members[user_id] = ws
        room.ready.discard(user_id)

    # Keepalive
    ka = asyncio.create_task(_keepalive(ws, user_id))
    async with room.lock:
        room.keepalive_tasks[user_id] = ka

    await _send_state(room)

    # Reader
    reader = asyncio.create_task(_reader_task(room, user_id, ws))

    # Orquestador (una sola vez, el líder/creator)
    async with room.lock:
        need_start = (not room.orchestrator_started) and (room.leader_id == user_id)
        if need_start:
            room.orchestrator_started = True
    if need_start:
        asyncio.create_task(_orchestrator(room))

    # Mantener vivo hasta que la sala cierre o el cliente se vaya
    try:
        while True:
            if room.closed:
                break
            await asyncio.sleep(5)
    except WebSocketDisconnect:
        pass
    finally:
        reader.cancel()
        with contextlib.suppress(Exception):
            await reader
        async with room.lock:
            room.members.pop(user_id, None)
            room.ready.discard(user_id)
            task = room.keepalive_tasks.pop(user_id, None)
            if task:
                task.cancel()
        await _send_state(room)
