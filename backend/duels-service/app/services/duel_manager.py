# app/services/duel_manager.py
from __future__ import annotations
import os
import json, time, uuid, asyncio, logging, contextlib
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone  # <- añade timezone
from typing import Optional, Dict, List, Tuple

from fastapi import WebSocket, WebSocketDisconnect, HTTPException
from sqlalchemy import select, func, exists, and_
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from ..deps import SessionLocal
from ..models import Match, Round, RoundConfig, RoundPick, Answer, DuelRating, MatchPlayer
from ..metrics import duels_round_duration_seconds, duels_answers_total
from ..clients.curriculum import check_answer
from ..clients.progress import send_duel_result
from .exercise_picker import pick_exercise_for_objective, available_count_for_objective
from .shortcode import gen_short_code

log = logging.getLogger("duels.manager")

COUNTDOWN_SEC = 3
ROUND_MS_DEFAULT = 30_000  # fallback
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

def _distribute_top_level_picks(dedup_ids: List[str], best_of: int, questions_per_round: int) -> Dict[Tuple[int,int], str]:
    """
    Distribuye exerciseIds secuencialmente por (n, q_index).
    Retorna {(n, q_index) -> exerciseId}.
    Si faltan ids, los huecos se rellenarán en runtime por picker.
    """
    mapping: Dict[Tuple[int,int], str] = {}
    i = 0
    total_needed = best_of * questions_per_round
    for n in range(1, best_of + 1):
        for q in range(1, questions_per_round + 1):
            if i < len(dedup_ids):
                mapping[(n, q)] = dedup_ids[i]
                i += 1
    if i < total_needed:
        log.info("Provided exerciseIds (%d) < needed (%d). Remaining will be picked at runtime.", len(dedup_ids), total_needed)
    return mapping

def create_match(db: Session, *, creator_id: str, req) -> Match:
    """
    Crea el Match con validación robusta de inventario.
    Soporta modo uniforme (questionsPerRound/difficulty) o modo avanzado con rounds[].
    Garantiza picks exactos por sub-pregunta si envías exerciseIds (top-level o por ronda).
    """
    rounds_req = getattr(req, "rounds", None) or []
    best_of = int(getattr(req, "bestOf", 1) or 1)
    qpr_uniform = int(getattr(req, "questionsPerRound", 1) or 1)
    objective_id = getattr(req, "objectiveId", None)
    difficulty_global = getattr(req, "difficulty", None)

    # Coherencia best_of vs rounds[]
    if rounds_req:
        best_of = len(rounds_req)

    # Validación mínima
    provided_ids_top = [str(x) for x in (getattr(req, "exerciseIds", None) or [])]
    has_any_round_ids = any((getattr(r, "exerciseIds", None) or []) for r in rounds_req)
    if not objective_id and not provided_ids_top and not has_any_round_ids:
        raise HTTPException(status_code=400, detail="Provide exerciseIds[]/rounds[].exerciseIds[] or objectiveId")

    # === Validar inventario ===
    if rounds_req:
        # Rondas
        if objective_id:
            for idx, r in enumerate(rounds_req, start=1):
                q_needed = int(getattr(r, "questions", 1) or 1)
                diff_r = getattr(r, "difficulty", None)
                if q_needed > 0:
                    available = available_count_for_objective(str(objective_id), q_needed, diff_r or difficulty_global)
                    if available < q_needed:
                        raise HTTPException(
                            status_code=400,
                            detail=f"Ronda {idx}: OA tiene {available} ejercicios activos (dif={diff_r or difficulty_global}); se requieren {q_needed}."
                        )
        # Longitud picks por ronda (si se mandan)
        for idx, r in enumerate(rounds_req, start=1):
            ids_r = [str(x) for x in (getattr(r, "exerciseIds", None) or [])]
            if ids_r and len(dict.fromkeys(ids_r)) < int(getattr(r, "questions", 1) or 1):
                raise HTTPException(
                    status_code=400,
                    detail=f"Ronda {idx}: enviaste {len(dict.fromkeys(ids_r))} IDs; se requieren {int(getattr(r, 'questions', 1) or 1)}."
                )
    else:
        # Uniforme
        total_needed = best_of * qpr_uniform
        if provided_ids_top:
            dedup = list(dict.fromkeys(provided_ids_top))
            if len(dedup) < total_needed:
                raise HTTPException(
                    status_code=400,
                    detail=f"Este duelo requiere {total_needed} ejercicios, pero enviaste {len(dedup)}."
                )
        elif objective_id:
            available = available_count_for_objective(str(objective_id), total_needed, difficulty_global)
            if available < total_needed:
                raise HTTPException(
                    status_code=400,
                    detail=f"El OA seleccionado tiene {available} ejercicios activos; se requieren {total_needed}."
                )

    # === Crear Match
    m = Match(
        id=str(uuid.uuid4()),
        creator_id=creator_id,
        opponent_id=getattr(req, "opponentId", None),
        curriculum_id=req.curriculumId,
        best_of=best_of,
        status="WAITING",
        is_public=bool(getattr(req, "isPublic", True)),
        max_players=int(getattr(req, "maxPlayers", DEFAULT_MAX_PLAYERS) or DEFAULT_MAX_PLAYERS),
        mode=str(getattr(req, "mode", "bestOf") or "bestOf"),
        question_time_sec=getattr(req, "questionTimeSec", None),
        win_target=getattr(req, "winTarget", None),
        questions_per_round=qpr_uniform,
    )
    # Hints opcionales
    try:
        if hasattr(m, "objective_id") and objective_id:
            setattr(m, "objective_id", str(objective_id))
    except Exception:
        pass
    try:
        if hasattr(m, "difficulty") and difficulty_global:
            setattr(m, "difficulty", str(difficulty_global))
    except Exception:
        pass

    m.short_code = _ensure_short_code(db)
    db.add(m)
    db.flush()  # ya tenemos m.id

    # Registrar creador como jugador
    if not _matchplayer_exists(db, m.id, creator_id):
        db.add(MatchPlayer(match_id=m.id, user_id=creator_id))
        db.flush()

    # === Persistir configuración / picks
    rounds_req = getattr(req, "rounds", None) or []
    if rounds_req:
        for i, r in enumerate(rounds_req, start=1):
            q_count = int(getattr(r, "questions", 1) or 1)
            diff_r = getattr(r, "difficulty", None)
            db.add(RoundConfig(match_id=m.id, n=i, questions=q_count, difficulty=diff_r))

            ids_r = [str(x) for x in (getattr(r, "exerciseIds", None) or [])]
            if ids_r:
                dedup_r = list(dict.fromkeys(ids_r))
                for q_idx in range(1, min(q_count, len(dedup_r)) + 1):
                    db.add(RoundPick(match_id=m.id, n=i, q_index=q_idx, exercise_id=dedup_r[q_idx - 1]))
    else:
        provided_ids_top = [str(x) for x in (getattr(req, "exerciseIds", None) or [])]
        if provided_ids_top:
            dedup = list(dict.fromkeys(provided_ids_top))
            mapping = _distribute_top_level_picks(dedup, best_of, qpr_uniform)
            for n in range(1, best_of + 1):
                db.add(RoundConfig(match_id=m.id, n=n, questions=qpr_uniform, difficulty=difficulty_global))
            for (n, q_idx), exid in mapping.items():
                db.add(RoundPick(match_id=m.id, n=n, q_index=q_idx, exercise_id=str(exid)))
        else:
            for n in range(1, best_of + 1):
                db.add(RoundConfig(match_id=m.id, n=n, questions=qpr_uniform, difficulty=difficulty_global))

    db.flush()
    return m

def list_open_matches(db: Session, *, curriculum_id: Optional[str] = None, limit: int = 50) -> list[Match]:
    """
    Devuelve partidas públicas realmente abiertas:
      - WAITING
      - short_code no vacío
      - al menos 1 jugador (EXISTS en match_players)
      - no muy antiguas (por defecto 48h; configurable vía DUELS_OPEN_MAX_AGE_H)
      - (Opcional) con cupo disponible (jugadores < max_players)
    """
    # Ventana de "vigencia" para el lobby
    try:
        max_age_h = int(os.getenv("DUELS_OPEN_MAX_AGE_H", "48"))
    except Exception:
        max_age_h = 48
    max_age_h = max(1, min(max_age_h, 336))  # [1h, 14d]
    min_created_at = datetime.utcnow() - timedelta(hours=max_age_h)

    # Subquery: contar jugadores por match (útil para cupo)
    mp_count_sq = (
        select(MatchPlayer.match_id, func.count().label("cnt"))
        .group_by(MatchPlayer.match_id)
        .subquery()
    )

    # Base query
    q = (
        select(Match)
        .where(
            Match.status == "WAITING",
            Match.is_public.is_(True),
            Match.created_at >= min_created_at,
            Match.short_code.is_not(None),
            func.length(func.trim(Match.short_code)) >= 4,
            exists().where(MatchPlayer.match_id == Match.id),  # 👈 debe haber algún jugador
        )
        .order_by(Match.created_at.desc())
        .limit(limit)
    )

    if curriculum_id:
        q = q.where(Match.curriculum_id == curriculum_id)

    # (Opcional) exigir cupo disponible: players < max_players
    # Descomenta si quieres ocultar salas llenas:
    # q = (
    #     q.join(mp_count_sq, mp_count_sq.c.match_id == Match.id, isouter=True)
    #       .where((mp_count_sq.c.cnt.is_(None)) | (mp_count_sq.c.cnt < (Match.max_players or 2)))
    # )

    return list(db.scalars(q))

def resolve_short_code(db: Session, code: str) -> Optional[str]:
    if not code:
        return None
    m = db.scalar(
        select(Match).where(
            Match.short_code.is_not(None),
            Match.short_code != "",
            func.upper(Match.short_code) == code.upper(),
        )
    )
    return m.id if m else None

# -------------------------------------------------------------------
# Elo rating (1v1)
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
    members: Dict[str, WebSocket] = field(default_factory=dict)
    ready: set[str] = field(default_factory=set)
    names: Dict[str, str] = field(default_factory=dict)
    lock: asyncio.Lock = field(default_factory=asyncio.Lock)
    orchestrator_started: bool = False
    round_no: int = 0
    current_exercise_id: Optional[str] = None
    round_t0: Optional[float] = None
    question_t0: Optional[float] = None
    q_index: int = 0
    q_total: int = 1
    questions_per_round: int = 1
    closed: bool = False
    leader_id: Optional[str] = None
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
            questions_per_round=max(1, int(getattr(m, "questions_per_round", 1) or 1)),
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

def _players_info(room: Room) -> List[Dict[str, str]]:
    items: List[Tuple[str, WebSocket]] = list(room.members.items())
    out: List[Dict[str, str]] = []
    for uid, _ws in items:
        name = room.names.get(uid) or f"Jugador {uid[:4]}"
        out.append({"id": uid, "name": name})
    return out

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
        "readyIds": list(room.ready),
        "players": len(room.members),
        "playersInfo": _players_info(room),
        "maxPlayers": room.max_players,
    })

# -------------------------------------------------------------------
# Heartbeat
# -------------------------------------------------------------------
async def _keepalive(ws: WebSocket, user_id: str):
    try:
        while True:
            await asyncio.sleep(25)
            await ws.send_json({"type": "ping"})
    except Exception:
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
            if n <= 0 or n != room.round_no or not room.current_exercise_id or room.q_index <= 0:
                continue
            answer = data.get("answer") or {}

            # Evalúa y persiste
            try:
                correct, _score, _fb = await check_answer(room.current_exercise_id, answer)
            except Exception:
                correct = False

            elapsed_ms = 0
            if room.question_t0 is not None:
                elapsed_ms = max(0, int((time.perf_counter() - room.question_t0) * 1000))

            duels_answers_total.labels(correct="true" if correct else "false").inc()

            db = SessionLocal()
            try:
                a = Answer(
                    match_id=room.match_id, n=n, q_index=room.q_index, student_id=user_id,
                    correct=bool(correct), time_ms=elapsed_ms
                )
                db.add(a); db.commit()
            except IntegrityError:
                db.rollback()
            except Exception as e:
                db.rollback()
                log.exception("Persistiendo answer falló: match=%s n=%s q=%s user=%s err=%s",
                              room.match_id, n, room.q_index, user_id, e)
            finally:
                db.close()

# -------------------------------------------------------------------
# Helpers de fallo amable
# -------------------------------------------------------------------
async def _fail_and_close(room: Room, message: str):
    await _broadcast(room, {"type": "error", "message": message})
    await _broadcast(room, {
        "type": "final",
        "winnerId": None,
        "byRound": [],
        "score": {},
        "playersInfo": _players_info(room),
    })
    await _broadcast(room, {"type": "state", "status": "RESULTS"})
    async with room.lock:
        room.closed = True
        members = list(room.members.items())
    for uid, ws in members:
        with contextlib.suppress(Exception):
            await ws.close(code=1000)

# -------------------------------------------------------------------
# Orquestador con sub-preguntas por ronda
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

    # Lobby: todos listos (o min(players, max_players))
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

    # RUNNING
    db = SessionLocal()
    try:
        m = db.get(Match, room.match_id)
        if not m:
            return
        if m.status != "FINISHED":
            m.status = "RUNNING"
            db.add(m); db.commit()
    finally:
        db.close()

    # Countdown
    for sec in range(COUNTDOWN_SEC, 0, -1):
        if room.closed:
            return
        await _broadcast(room, {"type": "countdown", "sec": sec})
        await asyncio.sleep(1)

    # Cargar datos del match + inferencias
    db = SessionLocal()
    try:
        m = db.get(Match, room.match_id)
        if not m:
            return
        best_of = m.best_of
        mode = m.mode or "bestOf"
        needed = best_of // 2 + 1 if mode == "bestOf" else None

        # Participantes
        rows = list(db.scalars(select(MatchPlayer).where(MatchPlayer.match_id == room.match_id)))
        participants = {r.user_id for r in rows} or set(room.members.keys())

        # Inferencias globales
        inferred_objective = getattr(m, "objective_id", None)
        inferred_difficulty = getattr(m, "difficulty", None)

        # Round configs (si no hay, usamos legacy)
        rc_rows = db.query(RoundConfig).filter_by(match_id=room.match_id).all()
        rc_map: Dict[int, RoundConfig] = {int(rc.n): rc for rc in rc_rows}

        room.questions_per_round = max(1, int(getattr(m, "questions_per_round", 1) or 1))
    finally:
        db.close()

    score: Dict[str, int] = {uid: 0 for uid in participants}
    by_round: list[dict] = []
    winner_id: Optional[str] = None

    def _decide_round_winner(stats: Dict[str, Tuple[int, int, int]]) -> Optional[str]:
        if not stats:
            return None
        ordered = sorted(
            stats.items(),
            key=lambda kv: (-kv[1][0], kv[1][1], kv[1][2] if kv[1][2] > 0 else 1_000_000_000)
        )
        if len(ordered) == 1:
            return ordered[0][0]
        a, b = ordered[0][1], ordered[1][1]
        if a[0] != b[0] or a[1] != b[1] or a[2] != b[2]:
            return ordered[0][0]
        return None

    rounds_to_play = best_of if mode in ("bestOf", "timePerQuestion") else 10

    for n in range(1, rounds_to_play + 1):
        if room.closed:
            return

        # ===== Ronda n =====
        rc = rc_map.get(n)
        q_total = int(rc.questions) if rc else room.questions_per_round
        diff_for_round = rc.difficulty if (rc and rc.difficulty) else inferred_difficulty

        room.round_no = n
        room.q_total = max(1, q_total)
        room.round_t0 = time.perf_counter()

        # Jugamos q_index=1..q_total
        for q in range(1, room.q_total + 1):
            if room.closed:
                return

            # Obtener ejercicio para (n, q)
            db = SessionLocal()
            try:
                exercise_id: Optional[str] = None

                # 1) PRIORIDAD: RoundPick persistido
                rp = db.query(RoundPick).filter_by(match_id=room.match_id, n=n, q_index=q).one_or_none()
                if rp:
                    exercise_id = rp.exercise_id
                else:
                    # 2) Legacy para q==1: Round.exercise_id
                    if q == 1:
                        r: Round | None = db.query(Round).filter_by(match_id=room.match_id, n=n).one_or_none()
                        if r:
                            exercise_id = r.exercise_id

                    # 3) Picker (OA obligatorio)
                    if not exercise_id:
                        if not inferred_objective:
                            await _fail_and_close(room, f"no exercises available (objective={inferred_objective}, qIndex={q})")
                            return
                        try:
                            exercise_id = await pick_exercise_for_objective(str(inferred_objective), diff_for_round)
                        except Exception:
                            exercise_id = None
                        if not exercise_id:
                            await _fail_and_close(room, f"no exercises available (objective={inferred_objective}, qIndex={q})")
                            return
            finally:
                db.close()

            room.current_exercise_id = exercise_id
            room.q_index = q
            room.question_t0 = time.perf_counter()

            qtime_ms = room.question_time_ms or ROUND_MS_DEFAULT
            deadline_ms = int(time.time() * 1000) + qtime_ms

            await _broadcast(room, {
                "type": "round_start",
                "round": n,
                "exercise": {"id": exercise_id},
                "deadline": deadline_ms,
                "qIndex": q,
                "qTotal": room.q_total,
            })

            deadline = time.time() + (qtime_ms / 1000.0)

            # Espera: todos contesten o timeout
            while time.time() < deadline:
                if room.closed:
                    return
                db = SessionLocal()
                try:
                    a_rows = db.query(Answer).filter_by(match_id=room.match_id, n=n, q_index=q).all()
                    got = {str(a.student_id) for a in a_rows}
                    if got.issuperset(participants):
                        break
                finally:
                    db.close()
                await asyncio.sleep(0.1)

            # margen pequeño
            await asyncio.sleep(0.2)

        # ===== Fin de ronda n: decidir ganador =====
        start_perf = room.round_t0 or time.perf_counter()
        db = SessionLocal()
        try:
            a_rows = db.query(Answer).filter_by(match_id=room.match_id, n=n).all()
            stats: Dict[str, Tuple[int, int, int]] = {}
            for uid in participants:
                user_ans = [a for a in a_rows if str(a.student_id) == uid]
                correct_count = sum(1 for a in user_ans if a.correct)
                total_time = sum(int(a.time_ms or 0) for a in user_ans)
                best_time = min([int(a.time_ms or 0) for a in user_ans], default=0)
                stats[uid] = (correct_count, total_time, best_time)
        finally:
            db.close()

        duels_round_duration_seconds.observe(max(0.0, time.perf_counter() - start_perf))

        round_winner: Optional[str] = _decide_round_winner(stats)

        by_round.append({"round": n, "winnerId": round_winner})
        if round_winner:
            score[round_winner] = score.get(round_winner, 0) + 1

        await _broadcast(room, {"type": "round_end", "round": n, "score": score})

        if room.mode == "bestOf" and needed is not None:
            if any(v >= needed for v in score.values()):
                winner_id = max(score.items(), key=lambda kv: kv[1])[0]
                break
        elif room.mode == "firstToAll":
            target = (room.win_target or 5)
            if any(v >= target for v in score.values()):
                winner_id = max(score.items(), key=lambda kv: kv[1])[0]
                break
        # timePerQuestion: se decide al final

    # Decidir ganador si aún no
    if winner_id is None:
        ordered = sorted(score.items(), key=lambda kv: kv[1], reverse=True)
        if len(ordered) >= 1:
            if len(ordered) == 1 or ordered[0][1] > ordered[1][1]:
                winner_id = ordered[0][0]
            else:
                winner_id = None

    # Final
    await _broadcast(room, {
        "type": "final",
        "winnerId": winner_id,
        "byRound": by_round,
        "score": score,
        "playersInfo": _players_info(room),
    })

    # Persistir FINISHED + ganador + Elo (1v1) + finished_at
    db = SessionLocal()
    try:
        m = db.get(Match, room.match_id)
        if m and m.status != "FINISHED":
            m.status = "FINISHED"
            m.winner_id = winner_id
            m.finished_at = datetime.now(timezone.utc)  # <- NUEVO
            db.add(m)
            if len(score) == 2:
                players = list(score.keys())
                a, b = players[0], players[1]
                apply_elo(db, winner_id, a, b)
            db.commit()
    finally:
        db.close()

    # Best effort: enviar a progress
    with contextlib.suppress(Exception):
        await send_duel_result({
            "matchId": room.match_id,
            "mode": room.mode,
            "winnerId": winner_id,
            "score": score,
            "byRound": by_round,
            "finishedAt": int(time.time() * 1000),
        })

    # Cerrar sala
    await _broadcast(room, {"type": "state", "status": "RESULTS"})
    async with room.lock:
        room.closed = True
        members = list(room.members.items())
    for uid, ws in members:
        with contextlib.suppress(Exception):
            await ws.close(code=1000)

    # LIMPIEZA
    async with ROOMS_LOCK:
        ROOMS.pop(room.match_id, None)

# -------------------------------------------------------------------
# WS entrypoint
# -------------------------------------------------------------------
async def ws_lobby(ws: WebSocket, user_id: str, user_name: Optional[str] = None):
    params = dict(ws.query_params)
    match_id = params.get("matchId")
    code = params.get("code")

    if not match_id and code:
        db = SessionLocal()
        try:
            match_id = resolve_short_code(db, str(code))
        finally:
            db.close()

    if not match_id:
        with contextlib.suppress(Exception):
            await ws.send_json({"type": "error", "message": "match not found"})
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

        if m.status == "RUNNING" and not _matchplayer_exists(db, match_id, user_id):
            await ws.send_json({"type": "error", "message": "match running"}); await ws.close(code=1008); return

        if m.status == "FINISHED":
            await ws.send_json({"type": "error", "message": "match finished"}); await ws.close(code=1000); return

        if len(room.members) >= (m.max_players or DEFAULT_MAX_PLAYERS) and user_id not in room.members:
            await ws.send_json({"type": "error", "message": "room full"}); await ws.close(code=1008); return
    finally:
        db.close()

    # Unir (y registrar nombre para UI)
    display_name = (user_name or "").strip() or f"Jugador {user_id[:4]}"
    async with room.lock:
        room.members[user_id] = ws
        room.names[user_id] = display_name
        room.ready.discard(user_id)

    # Keepalive
    ka = asyncio.create_task(_keepalive(ws, user_id))
    async with room.lock:
        room.keepalive_tasks[user_id] = ka

    await _send_state(room)

    # Reader
    reader = asyncio.create_task(_reader_task(room, user_id, ws))

    # Orquestador (solo una vez, el líder/creator)
    async with room.lock:
        need_start = (not room.orchestrator_started) and (room.leader_id == user_id)
        if need_start:
            room.orchestrator_started = True
    if need_start:
        asyncio.create_task(_orchestrator(room))

    # Mantener vivo hasta cierre
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
