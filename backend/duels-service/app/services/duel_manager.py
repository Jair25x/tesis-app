# app/services/duel_manager.py
from __future__ import annotations
import os
import json, time, uuid, asyncio, logging, contextlib
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, List, Tuple, Set

from fastapi import WebSocket, WebSocketDisconnect, HTTPException
from sqlalchemy import select, func, exists, and_, text
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from ..deps import SessionLocal
from ..deps import redis as redis_client  # opcional (puede ser None)
from ..models import Match, Round, RoundConfig, RoundPick, Answer, DuelRating, MatchPlayer
from ..metrics import duels_round_duration_seconds, duels_answers_total
from ..clients.curriculum import check_answer
from ..clients.progress import send_duel_result
from .exercise_picker import (
    available_count_for_objective,
    pick_exercise_for_objective_async,
)
from .shortcode import gen_short_code

log = logging.getLogger("duels.manager")

COUNTDOWN_SEC = 3
ROUND_MS_DEFAULT = 30_000  # fallback
DEFAULT_MAX_PLAYERS = 2

def _env_bool(name: str, default: str = "false") -> bool:
    return (os.getenv(name, default) or "").strip().lower() in {"1", "true", "yes", "y"}

FAIL_ON_EMPTY_ROUND = _env_bool("DUELS_FAIL_ON_EMPTY_ROUND", "false")
NO_PARTICIPATION_RETRY = 0 if FAIL_ON_EMPTY_ROUND else 1  # reintentos por ronda si nadie responde
PICK_RETRIES = max(0, int(os.getenv("DUELS_PICK_RETRIES", "5") or "5"))  # reintentos para evitar duplicados

# -----------------------
# Claves Redis (opcional)
# -----------------------
REDIS_TTL_SECONDS = 2 * 60 * 60  # 2h: suficiente para una sesión larga

def _r_key_base(match_id: str, n: int, q_index: int) -> str:
    return f"duels:{match_id}:r{n}:q{q_index}"

def _r_key_set(match_id: str, n: int, q_index: int) -> str:
    # quiénes ya respondieron (SET)
    return _r_key_base(match_id, n, q_index) + ":responders"

def _r_key_list(match_id: str, n: int, q_index: int) -> str:
    # orden de llegada (LIST)
    return _r_key_base(match_id, n, q_index) + ":queue"

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
    Crea el Match soportando:
    - rounds[] (cada item: questions, difficulty?, exerciseIds? dedupe)
    - roundConfigs[] (alias de rounds[], mismo shape)
    - roundPicks[] top-level (cada item: round|n, qIndex, exerciseId) -> se congelan
    - exerciseIds[] top-level uniforme (se reparte bestOf * questionsPerRound)
    - objectiveId + difficulty (global) con validación de stock
    """
    # A) Normalización de insumos
    rounds_req = (
        getattr(req, "rounds", None)
        or getattr(req, "roundConfigs", None)
        or []
    )
    best_of = int(getattr(req, "bestOf", 1) or 1)
    qpr_uniform = int(getattr(req, "questionsPerRound", 1) or 1)
    objective_id = getattr(req, "objectiveId", None)
    difficulty_global = getattr(req, "difficulty", None)

    # Si rounds/roundConfigs vienen, bestOf = len()
    if rounds_req:
        best_of = len(rounds_req)

    provided_ids_top = [str(x) for x in (getattr(req, "exerciseIds", None) or [])]
    has_any_round_ids = any((getattr(r, "exerciseIds", None) or []) for r in rounds_req)
    round_picks_top = getattr(req, "roundPicks", None) or []  # [{round|n, qIndex, exerciseId}]

    if not objective_id and not provided_ids_top and not has_any_round_ids and not round_picks_top:
        raise HTTPException(
            status_code=400,
            detail="Provide exerciseIds[]/rounds[].exerciseIds[]/roundPicks[] or objectiveId",
        )

    # B) Validaciones de disponibilidad (cuando hay objectiveId)
    if rounds_req:
        if objective_id:
            for idx, r in enumerate(rounds_req, start=1):
                q_needed = int(getattr(r, "questions", 1) or 1)
                diff_r = getattr(r, "difficulty", None)
                if q_needed > 0:
                    available = available_count_for_objective(
                        str(objective_id), q_needed, diff_r or difficulty_global
                    )
                    if available < q_needed:
                        raise HTTPException(
                            status_code=400,
                            detail=(
                                f"Ronda {idx}: OA tiene {available} ejercicios activos "
                                f"(dif={diff_r or difficulty_global}); se requieren {q_needed}."
                            ),
                        )
        # Deduplicación y tamaño mínimo cuando envían exerciseIds por ronda
        for idx, r in enumerate(rounds_req, start=1):
            ids_r = [str(x) for x in (getattr(r, "exerciseIds", None) or [])]
            if ids_r and len(dict.fromkeys(ids_r)) < int(getattr(r, "questions", 1) or 1):
                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Ronda {idx}: enviaste {len(dict.fromkeys(ids_r))} IDs; "
                        f"se requieren {int(getattr(r, 'questions', 1) or 1)}."
                    ),
                )
    else:
        total_needed = best_of * qpr_uniform
        if provided_ids_top:
            dedup = list(dict.fromkeys(provided_ids_top))
            if len(dedup) < total_needed:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Este duelo requiere {total_needed} ejercicios, "
                        f"pero enviaste {len(dedup)}."
                    ),
                )
        elif objective_id:
            available = available_count_for_objective(
                str(objective_id), total_needed, difficulty_global
            )
            if available < total_needed:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"El OA seleccionado tiene {available} ejercicios activos; "
                        f"se requieren {total_needed}."
                    ),
                )

    # C) Crear Match base
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
    db.flush()

    if not _matchplayer_exists(db, m.id, creator_id):
        db.add(MatchPlayer(match_id=m.id, user_id=creator_id))
        db.flush()

    # D) Persistir RoundConfig + RoundPick segun rama
    if rounds_req:
        for i, r in enumerate(rounds_req, start=1):
            q_count = int(getattr(r, "questions", 1) or 1)
            diff_r = getattr(r, "difficulty", None)
            db.add(RoundConfig(match_id=m.id, n=i, questions=q_count, difficulty=diff_r))

            ids_r = [str(x) for x in (getattr(r, "exerciseIds", None) or [])]
            if ids_r:
                dedup_r = list(dict.fromkeys(ids_r))
                for q_idx in range(1, min(q_count, len(dedup_r)) + 1):
                    db.add(
                        RoundPick(
                            match_id=m.id, n=i, q_index=q_idx, exercise_id=dedup_r[q_idx - 1]
                        )
                    )
    else:
        if provided_ids_top:
            dedup = list(dict.fromkeys(provided_ids_top))
            mapping = _distribute_top_level_picks(dedup, best_of, qpr_uniform)
            for n in range(1, best_of + 1):
                db.add(
                    RoundConfig(
                        match_id=m.id, n=n, questions=qpr_uniform, difficulty=difficulty_global
                    )
                )
            for (n, q_idx), exid in mapping.items():
                db.add(
                    RoundPick(match_id=m.id, n=n, q_index=q_idx, exercise_id=str(exid))
                )
        else:
            # Sólo configs uniformes; picks se harán en runtime
            for n in range(1, best_of + 1):
                db.add(
                    RoundConfig(
                        match_id=m.id, n=n, questions=qpr_uniform, difficulty=difficulty_global
                    )
                )

    # E) Si llegan roundPicks[] top-level, congélalos (tiene prioridad sobre runtime picks)
    if round_picks_top:
        for rp in round_picks_top:
            try:
                # aceptar ambas formas por compatibilidad: round / n
                n = int(
                    getattr(rp, "round", None)
                    or getattr(rp, "n", None)
                    or (rp.get("round") if isinstance(rp, dict) else None)
                    or (rp.get("n") if isinstance(rp, dict) else None)
                )
                q_idx = int(
                    getattr(rp, "qIndex", None)
                    or (rp.get("qIndex") if isinstance(rp, dict) else None)
                )
                exid = str(
                    getattr(rp, "exerciseId", None)
                    or (rp.get("exerciseId") if isinstance(rp, dict) else None)
                )
            except Exception:
                continue
            if not n or not q_idx or not exid:
                continue
            # upsert “amable”
            existing = (
                db.query(RoundPick)
                .filter_by(match_id=m.id, n=n, q_index=q_idx)
                .one_or_none()
            )
            if existing:
                existing.exercise_id = exid
            else:
                db.add(RoundPick(match_id=m.id, n=n, q_index=q_idx, exercise_id=exid))

    db.flush()
    return m

def list_open_matches(db: Session, *, curriculum_id: Optional[str] = None, limit: int = 50) -> list[Match]:
    try:
        max_age_h = int(os.getenv("DUELS_OPEN_MAX_AGE_H", "48"))
    except Exception:
        max_age_h = 48
    max_age_h = max(1, min(max_age_h, 336))
    min_created_at = datetime.utcnow() - timedelta(hours=max_age_h)

    q = (
        select(Match)
        .where(
            Match.status == "WAITING",
            Match.is_public.is_(True),
            Match.created_at >= min_created_at,
            Match.short_code.is_not(None),
            func.length(func.trim(Match.short_code)) >= 4,
            exists().where(MatchPlayer.match_id == Match.id),
        )
        .order_by(Match.created_at.desc())
        .limit(limit)
    )

    if curriculum_id:
        q = q.where(Match.curriculum_id == curriculum_id)

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

def _normalize_answer_payload(answer_obj):
    """
    Acepta:
      - dict/valor plano -> lo retorna igual
      - { "value": X }
      - { "value": { "value": Y } } -> retorna { "value": Y }
    """
    try:
        if isinstance(answer_obj, dict) and "value" in answer_obj:
            inner = answer_obj.get("value")
            if isinstance(inner, dict) and "value" in inner:
                return inner
    except Exception:
        pass
    return answer_obj

# Límite defensivo de tamaño para respuestas
MAX_ANSWER_BYTES = 32_768
def _byte_len(obj) -> int:
    try:
        return len(json.dumps(obj).encode("utf-8"))
    except Exception:
        return len(str(obj).encode("utf-8"))

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
    # NUEVO: total de participantes del match (preciso, no solo conectados)
    participants_total: int = 0
    # Cache liviana para no spamear WS con payloads idénticos
    _last_progress_payload: Optional[str] = None

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
# Progreso (DB/Redis)
# -------------------------------------------------------------------
async def _progress_clear(room: Room, n: int, q_index: int):
    # limpia cache local
    room._last_progress_payload = None
    # limpia redis si existe
    if redis_client is not None:
        try:
            kset = _r_key_set(room.match_id, n, q_index)
            klist = _r_key_list(room.match_id, n, q_index)
            await redis_client.delete(kset, klist)  # type: ignore
        except Exception:
            pass

async def _progress_register_answer(room: Room, n: int, q_index: int, user_id: str):
    """Registra en Redis (si existe) la respuesta para mantener orden y set únicos."""
    if redis_client is None:
        return
    try:
        pipe = redis_client.pipeline()  # type: ignore
        kset = _r_key_set(room.match_id, n, q_index)
        klist = _r_key_list(room.match_id, n, q_index)
        # SADD devuelve 1 si se añadió; sólo en ese caso push a lista
        pipe.sadd(kset, user_id)
        pipe.expire(kset, REDIS_TTL_SECONDS)
        sadd_res, _ = await pipe.execute()
        if sadd_res == 1:
            # new user in set -> anotar orden
            t_ms = 0
            if room.question_t0 is not None:
                t_ms = max(0, int((time.perf_counter() - room.question_t0) * 1000))
            entry = json.dumps({"id": user_id, "tMs": t_ms})
            pipe = redis_client.pipeline()  # type: ignore
            pipe.rpush(klist, entry)
            pipe.expire(klist, REDIS_TTL_SECONDS)
            await pipe.execute()
    except Exception:
        pass

def _user_name(room: Room, uid: str) -> str:
    return room.names.get(uid) or f"Jugador {uid[:4]}"

async def _progress_snapshot(room: Room, n: int, q_index: int) -> Dict:
    """
    Devuelve {'responded': X, 'total': Y, 'queue': [{'id','name','tMs'}...]}
    - Si Redis existe: lee SET/LIST y arma cola.
    - Si no: consulta DB (Answer) ordenado por created_at y arma cola.
    """
    total = room.participants_total or max(1, len(room.members))
    queue: List[Dict[str, str | int]] = []
    responded_ids: List[str] = []

    if redis_client is not None:
        try:
            kset = _r_key_set(room.match_id, n, q_index)
            klist = _r_key_list(room.match_id, n, q_index)
            # leer lista (orden)
            entries = await redis_client.lrange(klist, 0, -1)  # type: ignore
            for e in entries or []:
                try:
                    obj = json.loads(e)
                    uid = str(obj.get("id"))
                    tms = int(obj.get("tMs", 0))
                    responded_ids.append(uid)
                    queue.append({"id": uid, "name": _user_name(room, uid), "tMs": tms})
                except Exception:
                    continue
            # si por algún motivo lista vacía, usar el set
            if not queue:
                s_ids = await redis_client.smembers(kset)  # type: ignore
                for uid in s_ids or []:
                    responded_ids.append(uid)
                    # sin tMs exacto; aproximar desde ahora si hay question_t0
                    tms = 0
                    if room.question_t0 is not None:
                        tms = max(0, int((time.perf_counter() - room.question_t0) * 1000))
                    queue.append({"id": uid, "name": _user_name(room, uid), "tMs": tms})
        except Exception:
            # fallback a DB
            pass

    if not queue:
        # Fallback sin Redis: DB
        dbp = SessionLocal()
        try:
            a_rows = (
                dbp.query(Answer)
                .filter_by(match_id=room.match_id, n=n, q_index=q_index)
                .order_by(Answer.created_at.asc())
                .all()
            )
            for a in a_rows:
                uid = str(a.student_id)
                responded_ids.append(uid)
                tms = int(a.time_ms or 0)
                queue.append({"id": uid, "name": _user_name(room, uid), "tMs": tms})
        finally:
            dbp.close()

    responded = len(set(responded_ids))
    return {"responded": int(responded), "total": int(total), "queue": queue}

async def _broadcast_progress(room: Room, n: int, q_index: int):
    snap = await _progress_snapshot(room, n, q_index)
    payload = {
        "type": "answer_progress",
        "round": n,
        "qIndex": q_index,
        **snap,
    }
    # evitar spam con payload idéntico
    enc = json.dumps(payload, sort_keys=True)
    if room._last_progress_payload == enc:
        return
    room._last_progress_payload = enc
    await _broadcast(room, payload)

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
            log.info("WS_ANSWER_RX match=%s user=%s keys=%s", room.match_id, user_id, list(data.keys()))

            n = int(data.get("round") or 0)
            if n <= 0 or n != room.round_no or room.q_index <= 0:
                log.debug("WS_ANSWER_IGNORED out_of_window match=%s user=%s round=%s q_index(room)=%s",
                          room.match_id, user_id, n, room.q_index)
                continue

            raw_answer = data.get("answer")
            if raw_answer is None:
                log.debug("WS_ANSWER_IGNORED empty match=%s user=%s", room.match_id, user_id)
                continue

            # límite defensivo de tamaño
            if _byte_len(raw_answer) > MAX_ANSWER_BYTES:
                log.info("ANSWER_TOO_LARGE match=%s user=%s", room.match_id, user_id)
                continue

            try:
                q_index = int(data.get("qIndex") or room.q_index or 0)
            except Exception:
                q_index = 0
            if q_index <= 0 or q_index > room.q_total:
                log.debug("WS_ANSWER_IGNORED bad_qindex match=%s user=%s q_index=%s q_total=%s",
                          room.match_id, user_id, q_index, room.q_total)
                continue

            answer_obj = _normalize_answer_payload(raw_answer)

            # Recuperar exercise_id REAL para (n, q_index)
            exercise_id_for_q: Optional[str] = None
            db_lookup = SessionLocal()
            try:
                rp = db_lookup.query(RoundPick).filter_by(
                    match_id=room.match_id, n=n, q_index=q_index
                ).one_or_none()
                if rp:
                    exercise_id_for_q = rp.exercise_id
                else:
                    if q_index == 1:
                        r: Round | None = db_lookup.query(Round).filter_by(
                            match_id=room.match_id, n=n
                        ).one_or_none()
                        if r and r.exercise_id:
                            exercise_id_for_q = r.exercise_id
            finally:
                db_lookup.close()

            exid_for_eval = exercise_id_for_q or room.current_exercise_id

            correct = False
            try:
                if exid_for_eval:
                    correct, _score, _fb = await check_answer(exid_for_eval, answer_obj)
            except Exception as e:
                log.warning("CHECK_ANSWER_FAIL match=%s n=%s q=%s user=%s err=%s",
                            room.match_id, n, q_index, user_id, e)
                correct = False

            elapsed_ms = 0
            if room.question_t0 is not None:
                elapsed_ms = max(0, int((time.perf_counter() - room.question_t0) * 1000))

            duels_answers_total.labels(correct="true" if correct else "false").inc()

            # --- Asegura la fila de rounds para el FK (idempotente) ---
            db = SessionLocal()
            try:
                db.execute(text("""
                    INSERT INTO rounds (match_id, n, started_at)
                    VALUES (:m, :n, NOW())
                    ON CONFLICT (match_id, n) DO NOTHING
                """), {"m": room.match_id, "n": n})
                db.commit()
            except Exception:
                db.rollback()
            finally:
                db.close()

            # Persistir respuesta (+ payload/raw_payload/exercise_id si existen)
            db = SessionLocal()
            try:
                a = Answer(
                    match_id=room.match_id,
                    n=n,
                    q_index=q_index,
                    student_id=user_id,      # ⬅️ UUID/string del sub
                    correct=bool(correct),
                    time_ms=elapsed_ms,
                )
                with contextlib.suppress(Exception):
                    if hasattr(a, "payload"):
                        setattr(a, "payload", answer_obj)
                    if hasattr(a, "raw_payload"):
                        setattr(a, "raw_payload", raw_answer)
                    if hasattr(a, "exercise_id") and exid_for_eval:
                        setattr(a, "exercise_id", exid_for_eval)

                db.add(a)
                db.commit()
                log.info("ANSWER_SAVED match=%s n=%s q=%s user=%s correct=%s",
                         room.match_id, n, q_index, user_id, bool(correct))
            except IntegrityError:
                db.rollback()
                log.info("ANSWER_DUPLICATE match=%s n=%s q=%s user=%s",
                         room.match_id, n, q_index, user_id)
            except Exception as e:
                db.rollback()
                log.exception("Persistiendo answer falló: match=%s n=%s q=%s user=%s err=%s",
                              room.match_id, n, q_index, user_id, e)
            finally:
                db.close()

            # Registrar progreso (Redis si hay, si no DB)
            try:
                await _progress_register_answer(room, n, q_index, user_id)
            except Exception:
                pass

            # Telemetría X/Y (+ cola)
            try:
                await _broadcast_progress(room, n, q_index)
            except Exception:
                log.exception("answer_progress broadcast failed match=%s n=%s q=%s",
                              room.match_id, n, q_index)

# -------------------------------------------------------------------
# Helpers de fallo amable
# -------------------------------------------------------------------
async def _fail_and_close(room: Room, message: str):
    log.warning("MATCH_FAIL match=%s reason=%s", room.match_id, message)
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
    async with ROOMS_LOCK:
        ROOMS.pop(room.match_id, None)

# -------------------------------------------------------------------
# Orquestador con sub-preguntas por ronda
# -------------------------------------------------------------------
async def _orchestrator(room: Room):
    # Espera jugadores y registra MatchPlayer
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

    # Lobby: todos listos (mín: 2)
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

        rows = list(db.scalars(select(MatchPlayer).where(MatchPlayer.match_id == room.match_id)))
        participants = {r.user_id for r in rows} or set(room.members.keys())

        inferred_objective = getattr(m, "objective_id", None)
        inferred_difficulty = getattr(m, "difficulty", None)

        rc_rows = db.query(RoundConfig).filter_by(match_id=room.match_id).all()
        rc_map: Dict[int, RoundConfig] = {int(rc.n): rc for rc in rc_rows}

        room.questions_per_round = max(1, int(getattr(m, "questions_per_round", 1) or 1))

        # Cargar ejercicios ya usados (para evitar repetidos)
        used_ids: Set[str] = set()
        try:
            already = db.query(RoundPick.exercise_id).filter_by(match_id=room.match_id).all()
            used_ids.update({str(x[0]) for x in already if x and x[0]})
            legacy = db.query(Round.exercise_id).filter_by(match_id=room.match_id).all()
            used_ids.update({str(x[0]) for x in legacy if x and x[0]})
        except Exception:
            pass
    finally:
        db.close()

    score: Dict[str, int] = {uid: 0 for uid in participants}
    by_round: list[dict] = []
    winner_id: Optional[str] = None

    room.participants_total = len(score)

    log.info(
        "ORCH init match=%s best_of=%s mode=%s participants=%s qpr=%s used_seed=%d",
        room.match_id,
        best_of,
        mode,
        sorted(participants),
        room.questions_per_round,
        len(used_ids),
    )

    def _decide_round_winner(stats: Dict[str, Tuple[int, int, int, int]]) -> Tuple[Optional[str], bool]:
        """
        stats[user] = (correct_count, total_time, best_time, attempts)
        Retorna (winnerId|None, noParticipation: bool)
        """
        if not stats:
            return None, True
        total_attempts = sum(v[3] for v in stats.values())
        if total_attempts == 0:
            return None, True

        ordered = sorted(
            stats.items(),
            key=lambda kv: (
                -kv[1][0],            # correctas
                -kv[1][3],            # intentos
                kv[1][1],             # tiempo total
                kv[1][2] if kv[1][2] > 0 else 1_000_000_000
            )
        )

        if len(ordered) == 1:
            return ordered[0][0], False

        a, b = ordered[0][1], ordered[1][1]
        if (a[0], a[3], a[1], a[2]) != (b[0], b[3], b[1], b[2]):
            return ordered[0][0], False

        # Earliest answer (created_at) entre empatados
        db2 = SessionLocal()
        try:
            users = [ordered[0][0], ordered[1][0]]
            earliest: List[Tuple[str, datetime]] = list(
                db2.execute(
                    select(Answer.student_id, func.min(Answer.created_at))
                    .where(
                        Answer.match_id == room.match_id,
                        Answer.n == room.round_no,
                        Answer.student_id.in_(users)
                    )
                    .group_by(Answer.student_id)
                )
            )
            if earliest:
                earliest.sort(key=lambda x: x[1] or datetime.max.replace(tzinfo=timezone.utc))
                return earliest[0][0], False
        except Exception:
            pass
        finally:
            db2.close()

        return None, False

    rounds_to_play = best_of if mode in ("bestOf", "timePerQuestion") else 10

    n = 1
    while n <= rounds_to_play:
        if room.closed:
            return

        rc = rc_map.get(n)
        q_total = int(rc.questions) if rc else room.questions_per_round
        diff_for_round = rc.difficulty if (rc and rc.difficulty) else inferred_difficulty

        room.round_no = n
        room.q_total = max(1, q_total)
        room.round_t0 = time.perf_counter()

        log.info(
            "ORCH start round n=%s q_total=%s participants=%s",
            n,
            room.q_total,
            sorted(score.keys()),
        )

        # ------ INICIO RONDA: upsert rounds (garantiza fila para FK) ------
        db_up = SessionLocal()
        try:
            db_up.execute(text("""
                INSERT INTO rounds (match_id, n, started_at)
                VALUES (:m, :n, NOW())
                ON CONFLICT (match_id, n) DO NOTHING
            """), {"m": room.match_id, "n": n})
            db_up.commit()
        except Exception:
            db_up.rollback()
        finally:
            db_up.close()

        # ------ sub-preguntas de la ronda ------
        for q in range(1, room.q_total + 1):
            if room.closed:
                return

            # Obtener ejercicio para (n, q)
            db = SessionLocal()
            try:
                exercise_id: Optional[str] = None

                rp = db.query(RoundPick).filter_by(match_id=room.match_id, n=n, q_index=q).one_or_none()
                if rp:
                    exercise_id = rp.exercise_id
                else:
                    if q == 1:
                        r: Round | None = db.query(Round).filter_by(match_id=room.match_id, n=n).one_or_none()
                        if r:
                            exercise_id = r.exercise_id

                    # Seleccionar evitando repetidos
                    if not exercise_id:
                        if not inferred_objective:
                            await _fail_and_close(room, f"no exercises available (objective={inferred_objective}, qIndex={q})")
                            return
                        candidate_last: Optional[str] = None
                        picked_unique: Optional[str] = None
                        for attempt in range(max(1, PICK_RETRIES)):
                            try:
                                candidate = await pick_exercise_for_objective_async(
                                    str(inferred_objective), diff_for_round
                                )
                            except Exception:
                                candidate = None
                            if not candidate:
                                break
                            candidate_last = candidate
                            if candidate not in used_ids:
                                picked_unique = candidate
                                break
                        if picked_unique:
                            exercise_id = picked_unique
                            log.info(
                                "PICK_AVOIDED_DUP match=%s n=%s q=%s ex=%s attempts<=%s",
                                room.match_id, n, q, exercise_id, PICK_RETRIES
                            )
                        else:
                            exercise_id = candidate_last
                            log.info(
                                "PICK_FORCED_DUP match=%s n=%s q=%s ex=%s used_count=%d",
                                room.match_id, n, q, exercise_id, len(used_ids)
                            )

                # Persistir RoundPick si no existía
                if exercise_id:
                    rp2 = db.query(RoundPick).filter_by(match_id=room.match_id, n=n, q_index=q).one_or_none()
                    if not rp2:
                        db.add(RoundPick(match_id=room.match_id, n=n, q_index=q, exercise_id=exercise_id))
                        db.commit()
                        log.info("PICK_PERSISTED match=%s n=%s q=%s ex=%s", room.match_id, n, q, exercise_id)
            finally:
                db.close()

            if not exercise_id:
                await _fail_and_close(room, f"no exercises available (objective={inferred_objective}, qIndex={q})")
                return

            used_ids.add(exercise_id)

            room.current_exercise_id = exercise_id
            room.q_index = q
            room.question_t0 = time.perf_counter()

            qtime_ms = room.question_time_ms or ROUND_MS_DEFAULT
            deadline_ms = int(time.time() * 1000) + qtime_ms

            log.info(
                "ROUND start match=%s n=%s q=%s deadline_ms=%s exercise_id=%s",
                room.match_id,
                n,
                q,
                deadline_ms,
                exercise_id,
            )

            await _progress_clear(room, n, q)  # 🧹 reset progreso (Redis + cache)
            await _broadcast(room, {
                "type": "round_start",
                "round": n,
                "exercise": {"id": exercise_id},
                "deadline": deadline_ms,
                "qIndex": q,
                "qTotal": room.q_total,
            })
            # Enviar progreso inicial vacío (0/total, cola=[])
            await _broadcast_progress(room, n, q)

            deadline = time.perf_counter() + (qtime_ms / 1000.0)

            # Espera: todos contesten o timeout
            last_seen = -1
            while time.perf_counter() < deadline:
                if room.closed:
                    return
                # Si hay Redis no hace falta ir a DB cada 100 ms; sólo se compara responded para cortar
                responded_now = None
                if redis_client is not None:
                    try:
                        kset = _r_key_set(room.match_id, n, q)
                        responded_now = await redis_client.scard(kset)  # type: ignore
                    except Exception:
                        responded_now = None

                if responded_now is None:
                    # Fallback DB para saber si todos ya respondieron
                    db = SessionLocal()
                    try:
                        a_rows = db.query(Answer).filter_by(match_id=room.match_id, n=n, q_index=q).all()
                        got = {str(a.student_id) for a in a_rows}
                        if len(got) != last_seen:
                            last_seen = len(got)
                            log.debug(
                                "ANSWERS match=%s n=%s q=%s received=%s of %s",
                                room.match_id,
                                n,
                                q,
                                last_seen,
                                len(score),
                            )
                        if got.issuperset(set(score.keys())):
                            log.info("Q_DONE_ALL match=%s n=%s q=%s total=%s", room.match_id, n, q, len(got))
                            break
                    finally:
                        db.close()
                else:
                    # Con Redis: si responded_now == total -> cortar
                    total_need = len(score)
                    if responded_now != last_seen:
                        last_seen = responded_now
                        log.debug(
                            "ANSWERS(REDIS) match=%s n=%s q=%s received=%s of %s",
                            room.match_id, n, q, last_seen, total_need
                        )
                    if responded_now >= total_need:
                        log.info("Q_DONE_ALL(REDIS) match=%s n=%s q=%s total=%s", room.match_id, n, q, responded_now)
                        break

                await asyncio.sleep(0.1)

            await asyncio.sleep(0.15)

        # ===== Fin de ronda n: decidir ganador =====
        start_perf = room.round_t0 or time.perf_counter()
        db = SessionLocal()
        try:
            a_rows = db.query(Answer).filter_by(match_id=room.match_id, n=n).all()
            stats: Dict[str, Tuple[int, int, int, int]] = {}
            for uid in score.keys():
                user_ans = [a for a in a_rows if str(a.student_id) == uid]
                attempts = len(user_ans)
                correct_count = sum(1 for a in user_ans if a.correct)
                total_time = sum(int(a.time_ms or 0) for a in user_ans)
                best_time = min([int(a.time_ms or 0) for a in user_ans], default=0)
                stats[uid] = (correct_count, total_time, best_time, attempts)
        finally:
            db.close()

        log.info("ROUND_STATS match=%s n=%s attempts=%s", room.match_id, n, {uid: stats[uid][3] for uid in stats})
        duels_round_duration_seconds.observe(max(0.0, time.perf_counter() - start_perf))

        round_winner, no_participation = _decide_round_winner(stats)
        log.info("ROUND_DECIDE match=%s n=%s winner=%s no_part=%s", room.match_id, n, round_winner, no_participation)

        if no_participation and FAIL_ON_EMPTY_ROUND:
            await _fail_and_close(room, "round had no participation")
            return

        retried = False
        if no_participation:
            for _ in range(NO_PARTICIPATION_RETRY):
                retried = True
                await asyncio.sleep(0.6)
                break

        if retried and no_participation:
            continue

        by_round.append({"round": n, "winnerId": round_winner, "noParticipation": bool(no_participation)})

        if round_winner:
            score[round_winner] = score.get(round_winner, 0) + 1

        await _broadcast(room, {
            "type": "round_end",
            "round": n,
            "score": dict(score),
            "noParticipation": bool(no_participation),
            "winnerId": round_winner,
        })

        log.info(
            "ROUND_DECISION match=%s n=%s winner=%s score=%s no_participation=%s",
            room.match_id,
            n,
            round_winner,
            score,
            no_participation,
        )

        if room.mode == "bestOf" and needed is not None:
            if any(v >= needed for v in score.values()):
                winner_id = max(score.items(), key=lambda kv: kv[1])[0]
                break
        elif room.mode == "firstToAll":
            target = (room.win_target or 5)
            if any(v >= target for v in score.values()):
                winner_id = max(score.items(), key=lambda kv: kv[1])[0]
                break

        n += 1

    if winner_id is None:
        ordered = sorted(score.items(), key=lambda kv: kv[1], reverse=True)
        if len(ordered) >= 1:
            if len(ordered) == 1 or ordered[0][1] > ordered[1][1]:
                winner_id = ordered[0][0]
            else:
                winner_id = None  # empate real

    await _broadcast(room, {
        "type": "final",
        "winnerId": winner_id,
        "byRound": by_round,
        "score": dict(score),
        "playersInfo": _players_info(room),
    })

    log.info(
        "MATCH_DECISION match=%s best_of=%s mode=%s winner=%s score=%s",
        room.match_id,
        best_of,
        mode,
        winner_id,
        score,
    )

    db = SessionLocal()
    try:
        m = db.get(Match, room.match_id)
        if m and m.status != "FINISHED":
            m.status = "FINISHED"
            m.winner_id = winner_id
            m.finished_at = datetime.now(timezone.utc)
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
            "score": dict(score),
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

    db = SessionLocal()
    try:
        m: Match | None = db.get(Match, match_id)
        if not m:
            await ws.send_json({"type": "error", "message": "Match not found"}); await ws.close(code=1008); return

        if m.status == "RUNNING" and not _matchplayer_exists(db, match_id, user_id):
            await ws.send_json({"type": "error", "message": "match running"}); await ws.close(code=1008); return

        if m.status == "FINISHED":
            await ws.send_json({"type": "error", "message": "match finished"}); await ws.close(code=1000); return

        is_registered = _matchplayer_exists(db, match_id, user_id)
        if len(room.members) >= (m.max_players or DEFAULT_MAX_PLAYERS) and not (user_id in room.members or is_registered):
            await ws.send_json({"type": "error", "message": "room full"}); await ws.close(code=1008); return
    finally:
        db.close()

    display_name = (user_name or "").strip() or f"Jugador {user_id[:4]}"
    async with room.lock:
        room.members[user_id] = ws
        room.names[user_id] = display_name
        room.ready.discard(user_id)

    ka = asyncio.create_task(_keepalive(ws, user_id))
    async with room.lock:
        room.keepalive_tasks[user_id] = ka

    await _send_state(room)

    # Si ya hay una sub-pregunta activa, emite progreso actual al nuevo cliente
    if room.round_no > 0 and room.q_index > 0:
        try:
            await _broadcast_progress(room, room.round_no, room.q_index)
        except Exception:
            pass

    reader = asyncio.create_task(_reader_task(room, user_id, ws))

    async with room.lock:
        need_start = (not room.orchestrator_started) and (room.leader_id == user_id)
        if need_start:
            room.orchestrator_started = True
    if need_start:
        asyncio.create_task(_orchestrator(room))

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
