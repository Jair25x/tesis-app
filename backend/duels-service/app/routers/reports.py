# app/routers/reports.py
from __future__ import annotations
from typing import Optional, List, Dict, Tuple, Iterable
from datetime import datetime, timezone, timedelta
import os
import logging

from fastapi import APIRouter, Depends, Query, Path
from sqlalchemy.orm import Session
from sqlalchemy import select, func, and_, exists, cast, Float

from ..deps import SessionLocal, current_actor, require_roles
from ..models import Match, MatchPlayer, DuelRating, Answer, Round  # Round incluido

# ── HTTP client para perfilar nombres
try:
    import requests  # simple, síncrono y suficiente para este caso
except Exception:  # pragma: no cover
    requests = None  # si no está, devolvemos sin nombres

log = logging.getLogger(__name__)

router = APIRouter(prefix="/api/duels/reports", tags=["duels-reports"])

# ===== DB session =====
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ===== Time helpers =====
def _parse_iso_utc(s: Optional[str]) -> Optional[datetime]:
    if not s:
        return None
    try:
        dt = datetime.fromisoformat(s.replace("Z", "+00:00"))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc)
    except Exception:
        return None

def _window_defaults(dt_from: Optional[datetime], dt_to: Optional[datetime]) -> Tuple[datetime, datetime]:
    now = datetime.now(timezone.utc)
    if dt_to is None:
        dt_to = now
    if dt_from is None:
        dt_from = dt_to - timedelta(days=30)
    if dt_from >= dt_to:
        dt_from = dt_to - timedelta(days=1)
    return dt_from, dt_to

def _group_trunc_expr(field, group_by: str):
    gb = (group_by or "day").lower()
    if gb not in ("day", "week", "month"):
        gb = "day"
    return func.date_trunc(gb, field)

# ===== Answer mapping (explícito a tu modelo) =====
HAS_ANSWER = True
A = Answer
A_CREATED_AT = A.created_at
A_USER_ID    = A.student_id
A_MATCH_ID   = A.match_id
A_IS_CORRECT = A.correct
A_TIME_MS    = A.time_ms

# ====== Perfiles públicos (auth-service) con caché simple ======
_AUTH_BASE = os.getenv("AUTH_BASE_URL", "http://auth-service:8081/api/auth")
# timeout corto + caché en proceso (diccionario) con invalidación naïve por tamaño
_PROFILES_CACHE: Dict[str, str] = {}
_MAX_CACHE = 5000

def _profiles_lookup(uids: Iterable[str]) -> Dict[str, str]:
    """
    Devuelve {userId: displayName} usando /api/auth/profiles (S2S headers).
    Si requests no está disponible o hay error, retorna {}.
    """
    if not requests:
        return {}

    need: List[str] = []
    out: Dict[str, str] = {}
    for uid in set(uids):
        if not uid:
            continue
        if uid in _PROFILES_CACHE:
            out[uid] = _PROFILES_CACHE[uid]
        else:
            need.append(uid)

    if not need:
        return out

    try:
        # ✅ Bearer S2S + marcas internas
        from ..clients.s2s import mint_internal_jwt
        headers = {
            "Authorization": f"Bearer {mint_internal_jwt()}",
            "X-Internal-Call": "duels-service",
            "X-Auth-Roles": "ROLE_INTERNAL",
            "X-Auth-Username": "duels-service",
        }
        params = {"ids": ",".join(need)}
        resp = requests.get(f"{_AUTH_BASE}/profiles", headers=headers, params=params, timeout=3.0)
        resp.raise_for_status()
        data = resp.json() or []
        for it in data:
            uid = str(it.get("id") or it.get("userId") or "")
            name = str(it.get("displayName") or it.get("fullName") or "").strip()
            if uid:
                if name:
                    out[uid] = name
                    _PROFILES_CACHE[uid] = name
                else:
                    out.setdefault(uid, "")
        if len(_PROFILES_CACHE) > _MAX_CACHE:
            _PROFILES_CACHE.clear()
    except Exception as e:
        log.warning("profiles lookup failed: %s", e)

    return out

# =====================================================================================
# 1) OVERVIEW (Teacher)  — KPIs + timeline con fallback + topPlayers
# =====================================================================================
@router.get("/teacher/overview")
def teacher_overview(
    from_: Optional[str] = Query(None, alias="from"),
    to_: Optional[str] = Query(None, alias="to"),
    groupBy: str = Query("day", pattern="^(day|week|month)$"),
    curriculumId: Optional[str] = Query(None),
    classroomId: Optional[str] = Query(None),
    _actor = Depends(current_actor),
    db: Session = Depends(db_session),
):
    user_id, roles = _actor
    require_roles(roles, ["ROLE_TEACHER", "ROLE_ADMIN"])

    dt_from = _parse_iso_utc(from_)
    dt_to   = _parse_iso_utc(to_)
    dt_from, dt_to = _window_defaults(dt_from, dt_to)

    # Universo del docente
    students_filter: Optional[List[str]] = None
    is_admin = "ROLE_ADMIN" in roles
    if not is_admin:
        from ..clients.classrooms import students_for_teacher
        stu = students_for_teacher(user_id, classroom_id=classroomId)
        if not stu:
            return {
                "range": {
                    "from": dt_from.isoformat(), "to": dt_to.isoformat(),
                    "groupBy": groupBy, "curriculumId": curriculumId, "classroomId": classroomId
                },
                "totals": {"matches": 0, "rounds": 0, "answers": 0, "players": 0},
                "performance": {"winRate": 0.0, "avgRoundTimeSec": 0.0, "correctRate": 0.0},
                "timeline": [],
                "topPlayers": [],
            }
        students_filter = list(stu)

    # Filtros base
    filters_created = [Match.created_at >= dt_from, Match.created_at < dt_to]
    filters_finished = [Match.finished_at.is_not(None), Match.finished_at >= dt_from, Match.finished_at < dt_to]
    if curriculumId:
        filters_created.append(Match.curriculum_id == curriculumId)
        filters_finished.append(Match.curriculum_id == curriculumId)

    if students_filter is not None:
        filters_created.append(
            exists().where(and_(MatchPlayer.match_id == Match.id, MatchPlayer.user_id.in_(students_filter)))
        )
        filters_finished.append(
            exists().where(and_(MatchPlayer.match_id == Match.id, MatchPlayer.user_id.in_(students_filter)))
        )

    # Totales básicos
    total_matches = db.scalar(select(func.count()).select_from(Match).where(*filters_created)) or 0

    # Players únicos
    players_unique = 0
    try:
        q_players = (
            select(func.count(func.distinct(MatchPlayer.user_id)))
            .select_from(MatchPlayer)
            .where(
                exists().where(and_(
                    MatchPlayer.match_id == Match.id,
                    Match.created_at >= dt_from,
                    Match.created_at < dt_to,
                    *( [Match.curriculum_id == curriculumId] if curriculumId else [] )
                ))
            )
        )
        if students_filter is not None:
            q_players = q_players.where(MatchPlayer.user_id.in_(students_filter))
        players_unique = db.scalar(q_players) or 0
    except Exception:
        players_unique = 0

    # Win rate del universo docente (FINISHED)
    base_finished_filters: List = [
        Match.status == "FINISHED",
        Match.finished_at >= dt_from,
        Match.finished_at < dt_to,
    ]
    if curriculumId:
        base_finished_filters.append(Match.curriculum_id == curriculumId)

    if students_filter is not None:
        played_by_students = db.scalar(
            select(func.count())
            .select_from(Match)
            .where(
                *base_finished_filters,
                exists().where(and_(MatchPlayer.match_id == Match.id, MatchPlayer.user_id.in_(students_filter))),
            )
        ) or 0

        wins = db.scalar(
            select(func.count())
            .select_from(Match)
            .where(
                *base_finished_filters,
                Match.winner_id.is_not(None),
                Match.winner_id.in_(students_filter),
            )
        ) or 0
    else:
        played_by_students = db.scalar(select(func.count()).select_from(Match).where(*base_finished_filters)) or 0
        wins = db.scalar(select(func.count()).select_from(Match).where(*base_finished_filters, Match.winner_id.is_not(None))) or 0

    losses = int(played_by_students) - int(wins)
    win_rate = float(wins) / float(max(1, wins + losses)) if (wins + losses) > 0 else 0.0

    # KPIs Answer
    correct_rate = 0.0
    avg_round_time_sec = 0.0
    total_answers = 0

    if HAS_ANSWER:
        try:
            q_ans = select(func.count()).select_from(A).where(A_CREATED_AT >= dt_from, A_CREATED_AT < dt_to)
            q_corr = select(func.count()).select_from(A).where(
                A_CREATED_AT >= dt_from, A_CREATED_AT < dt_to, A_IS_CORRECT.is_(True)
            )
            q_time = select(func.avg(cast(A_TIME_MS, Float))).where(A_CREATED_AT >= dt_from, A_CREATED_AT < dt_to)

            if students_filter is not None:
                q_ans = q_ans.where(A_USER_ID.in_(students_filter))
                q_corr = q_corr.where(A_USER_ID.in_(students_filter))
                q_time = q_time.where(A_USER_ID.in_(students_filter))

            if curriculumId and A_MATCH_ID is not None:
                q_ans = (
                    select(func.count())
                    .select_from(A)
                    .join(Match, A_MATCH_ID == Match.id)
                    .where(A_CREATED_AT >= dt_from, A_CREATED_AT < dt_to, Match.curriculum_id == curriculumId)
                )
                if students_filter is not None:
                    q_ans = q_ans.where(A_USER_ID.in_(students_filter))

                q_corr = (
                    select(func.count())
                    .select_from(A)
                    .join(Match, A_MATCH_ID == Match.id)
                    .where(
                        A_CREATED_AT >= dt_from, A_CREATED_AT < dt_to,
                        Match.curriculum_id == curriculumId, A_IS_CORRECT.is_(True)
                    )
                )
                if students_filter is not None:
                    q_corr = q_corr.where(A_USER_ID.in_(students_filter))

                q_time = (
                    select(func.avg(cast(A_TIME_MS, Float)))
                    .select_from(A)
                    .join(Match, A_MATCH_ID == Match.id)
                    .where(A_CREATED_AT >= dt_from, A_CREATED_AT < dt_to, Match.curriculum_id == curriculumId)
                )
                if students_filter is not None:
                    q_time = q_time.where(A_USER_ID.in_(students_filter))

            total_answers = db.scalar(q_ans) or 0
            correct = db.scalar(q_corr) or 0
            avg_ms = db.scalar(q_time)
            correct_rate = float(correct) / float(total_answers) if total_answers > 0 else 0.0
            avg_round_time_sec = (float(avg_ms) / 1000.0) if (avg_ms is not None) else 0.0

        except Exception:
            total_answers = 0
            correct_rate = 0.0
            avg_round_time_sec = 0.0

    # Timeline (creadas vs finalizadas) con fallback
    trunc_created = _group_trunc_expr(Match.created_at, groupBy)
    trunc_finished = _group_trunc_expr(Match.finished_at, groupBy)

    rows_created = list(
        db.execute(
            select(trunc_created.label("bucket"), func.count())
            .where(*filters_created)
            .group_by(trunc_created)
            .order_by(trunc_created.asc())
        )
    )
    rows_finished = list(
        db.execute(
            select(trunc_finished.label("bucket"), func.count())
            .where(*filters_finished)
            .group_by(trunc_finished)
            .order_by(trunc_finished.asc())
        )
    )

    buckets: Dict[str, Dict[str, int]] = {}
    for b, c in rows_created:
        key = (b or dt_from).isoformat()
        buckets.setdefault(key, {"created": 0, "finished": 0})
        buckets[key]["created"] = int(c or 0)
    for b, c in rows_finished:
        key = (b or dt_from).isoformat()
        buckets.setdefault(key, {"created": 0, "finished": 0})
        buckets[key]["finished"] = int(c or 0)

    # actividad = finished; si suman 0, usa created
    finished_total = sum(v.get("finished", 0) for v in buckets.values())
    metric_key = "finished" if finished_total > 0 else "created"
    timeline = [
        {"bucket": k, "matches": v.get(metric_key, 0)}
        for k, v in sorted(buckets.items(), key=lambda kv: kv[0])
    ]

    # Top players (FINISHED)
    q_played = (
        select(MatchPlayer.user_id, func.count().label("played"))
        .select_from(MatchPlayer)
        .join(Match, MatchPlayer.match_id == Match.id)
        .where(*base_finished_filters)
        .group_by(MatchPlayer.user_id)
    )
    if students_filter is not None:
        q_played = q_played.where(MatchPlayer.user_id.in_(students_filter))
    played_rows = list(db.execute(q_played))

    q_wins = (
        select(Match.winner_id.label("user_id"), func.count().label("wins"))
        .select_from(Match)
        .where(*base_finished_filters, Match.winner_id.is_not(None))
        .group_by(Match.winner_id)
    )
    if students_filter is not None:
        q_wins = q_wins.where(Match.winner_id.in_(students_filter))
    wins_rows = list(db.execute(q_wins))

    played_map: Dict[str, int] = {u: int(n or 0) for (u, n) in played_rows}
    wins_map: Dict[str, int] = {u: int(n or 0) for (u, n) in wins_rows}

    candidate_ids: Iterable[str] = played_map.keys() | wins_map.keys()
    candidate_ids = list(candidate_ids)

    rating_map: Dict[str, int] = {}
    if candidate_ids:
        for (uid, rating) in db.execute(
            select(DuelRating.user_id, DuelRating.rating).where(DuelRating.user_id.in_(candidate_ids))
        ):
            rating_map[uid] = int(rating)

    def mk_player(uid: str) -> Dict:
        p = played_map.get(uid, 0)
        w = wins_map.get(uid, 0)
        wr = (float(w) / float(p)) if p > 0 else 0.0
        return {"userId": uid, "played": p, "wins": w, "winRate": wr, "rating": rating_map.get(uid)}

    top_players_all = [mk_player(uid) for uid in candidate_ids]
    top_players_all.sort(key=lambda x: (x.get("rating") or 0, x["winRate"], x["played"]), reverse=True)
    top_players = top_players_all[:10]

    # 🔤 enriquecer con nombres (auth-service)
    try:
        name_map = _profiles_lookup([p["userId"] for p in top_players])
        for p in top_players:
            nm = name_map.get(p["userId"])
            if nm:
                p["name"] = nm
    except Exception as e:
        log.warning("profiles lookup topPlayers failed: %s", e)

    return {
        "range": {
            "from": dt_from.isoformat(),
            "to": dt_to.isoformat(),
            "groupBy": groupBy,
            "curriculumId": curriculumId,
            "classroomId": classroomId,
        },
        "totals": {
            "matches": int(total_matches),
            "rounds": 0,
            "answers": int(total_answers),
            "players": int(players_unique),
        },
        "performance": {
            "winRate": float(win_rate),
            "avgRoundTimeSec": float(avg_round_time_sec),
            "correctRate": float(correct_rate),
        },
        "timeline": timeline,
        "topPlayers": top_players,
    }

# =====================================================================================
# 2) MATCHES (Teacher) — players[], rounds, answers, createdAt/mode/maxPlayers + nombres
# =====================================================================================
@router.get("/teacher/matches")
def teacher_matches(
    from_: Optional[str] = Query(None, alias="from"),
    to_: Optional[str] = Query(None, alias="to"),
    curriculumId: Optional[str] = Query(None),
    classroomId: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=200),
    offset: int = Query(0, ge=0),
    _actor = Depends(current_actor),
    db: Session = Depends(db_session),
):
    user_id, roles = _actor
    require_roles(roles, ["ROLE_TEACHER", "ROLE_ADMIN"])

    dt_from = _parse_iso_utc(from_)
    dt_to   = _parse_iso_utc(to_)
    dt_from, dt_to = _window_defaults(dt_from, dt_to)

    filters = [Match.created_at >= dt_from, Match.created_at < dt_to]
    if curriculumId:
        filters.append(Match.curriculum_id == curriculumId)

    is_admin = "ROLE_ADMIN" in roles
    if not is_admin:
        from ..clients.classrooms import students_for_teacher
        stu = students_for_teacher(user_id, classroom_id=classroomId)
        if not stu:
            return {"total": 0, "limit": int(limit), "offset": int(offset), "items": []}
        filters.append(
            exists().where(and_(MatchPlayer.match_id == Match.id, MatchPlayer.user_id.in_(list(stu))))
        )

    total = db.scalar(select(func.count()).select_from(Match).where(*filters)) or 0

    rows = list(
        db.scalars(
            select(Match)
            .where(*filters)
            .order_by(func.coalesce(Match.finished_at, Match.created_at).desc())
            .limit(limit)
            .offset(offset)
        )
    )

    if not rows:
        return {"total": int(total), "limit": int(limit), "offset": int(offset), "items": []}

    match_ids = [m.id for m in rows]

    # Players por match
    players_map: Dict[str, List[Dict[str, str]]] = {mid: [] for mid in match_ids}
    for (mid, uid) in db.execute(
        select(MatchPlayer.match_id, MatchPlayer.user_id).where(MatchPlayer.match_id.in_(match_ids))
    ):
        players_map.setdefault(mid, []).append({"userId": uid})

    # Rounds (DISTINCT n)
    rounds_map: Dict[str, int] = {}
    for (mid, cnt) in db.execute(
        select(Round.match_id, func.count(func.distinct(Round.n))).where(Round.match_id.in_(match_ids)).group_by(Round.match_id)
    ):
        rounds_map[str(mid)] = int(cnt or 0)

    # Answers por match
    answers_map: Dict[str, int] = {}
    for (mid, cnt) in db.execute(
        select(A_MATCH_ID, func.count()).where(A_MATCH_ID.in_(match_ids)).group_by(A_MATCH_ID)
    ):
        answers_map[str(mid)] = int(cnt or 0)

    # ===== nombres (lookup en auth-service) =====
    all_uids: List[str] = []
    for m in rows:
        for p in players_map.get(m.id, []):
            all_uids.append(p["userId"])
        if m.winner_id:
            all_uids.append(m.winner_id)
    names_by_id = _profiles_lookup(all_uids) if all_uids else {}

    items = []
    for m in rows:
        mid = m.id
        rounds_count = rounds_map.get(mid)
        if rounds_count is None or rounds_count == 0:
            rounds_count = m.best_of or 0

        players = []
        for p in players_map.get(mid, []):
            uid = p["userId"]
            nm = names_by_id.get(uid) or None
            players.append({"userId": uid, "name": nm})

        winner_name = names_by_id.get(m.winner_id) if m.winner_id else None

        items.append({
            "matchId": mid,
            "status": m.status,
            "createdAt": m.created_at.isoformat() if m.created_at else None,
            "finishedAt": m.finished_at.isoformat() if m.finished_at else None,
            "winnerId": m.winner_id,
            "winnerName": winner_name,
            "bestOf": m.best_of,
            "questionsPerRound": m.questions_per_round,
            "difficulty": m.difficulty,
            "shortCode": m.short_code,
            "mode": m.mode,
            "maxPlayers": m.max_players,
            "players": players,
            "rounds": int(rounds_count),
            "answers": int(answers_map.get(mid, 0)),
        })

    return {"total": int(total), "limit": int(limit), "offset": int(offset), "items": items}

# =====================================================================================
# 3) OVERVIEW (Admin) — timeline con fallback a created
# =====================================================================================
@router.get("/admin/overview")
def admin_overview(
    from_: Optional[str] = Query(None, alias="from"),
    to_: Optional[str] = Query(None, alias="to"),
    groupBy: str = Query("day", pattern="^(day|week|month)$"),
    curriculumId: Optional[str] = Query(None),
    _actor = Depends(current_actor),
    db: Session = Depends(db_session),
):
    user_id, roles = _actor
    require_roles(roles, ["ROLE_ADMIN"])

    dt_from = _parse_iso_utc(from_)
    dt_to   = _parse_iso_utc(to_)
    dt_from, dt_to = _window_defaults(dt_from, dt_to)

    filters_created = [Match.created_at >= dt_from, Match.created_at < dt_to]
    filters_finished = [Match.finished_at.is_not(None), Match.finished_at >= dt_from, Match.finished_at < dt_to]
    if curriculumId:
        filters_created.append(Match.curriculum_id == curriculumId)
        filters_finished.append(Match.curriculum_id == curriculumId)

    total = db.scalar(select(func.count()).select_from(Match).where(*filters_created)) or 0

    trunc_created = _group_trunc_expr(Match.created_at, groupBy)
    trunc_finished = _group_trunc_expr(Match.finished_at, groupBy)

    rows_created = list(
        db.execute(
            select(trunc_created.label("bucket"), func.count())
            .where(*filters_created)
            .group_by(trunc_created)
            .order_by(trunc_created.asc())
        )
    )
    rows_finished = list(
        db.execute(
            select(trunc_finished.label("bucket"), func.count())
            .where(*filters_finished)
            .group_by(trunc_finished)
            .order_by(trunc_finished.asc())
        )
    )

    buckets: Dict[str, Dict[str, int]] = {}
    for b, c in rows_created:
        key = (b or dt_from).isoformat()
        buckets.setdefault(key, {"created": 0, "finished": 0})
        buckets[key]["created"] = int(c or 0)
    for b, c in rows_finished:
        key = (b or dt_from).isoformat()
        buckets.setdefault(key, {"created": 0, "finished": 0})
        buckets[key]["finished"] = int(c or 0)

    finished_total = sum(v.get("finished", 0) for v in buckets.values())
    metric_key = "finished" if finished_total > 0 else "created"
    timeline = [
        {"bucket": k, "matches": v.get(metric_key, 0)}
        for k, v in sorted(buckets.items(), key=lambda kv: kv[0])
    ]

    top_players = [
        {"userId": uid, "rating": int(r)}
        for (uid, r) in db.execute(
            select(DuelRating.user_id, DuelRating.rating).order_by(DuelRating.rating.desc()).limit(10)
        )
    ]

    return {
        "range": {"from": dt_from.isoformat(), "to": dt_to.isoformat(), "groupBy": groupBy, "curriculumId": curriculumId},
        "totals": {"matches": int(total), "rounds": 0, "answers": 0, "players": 0},
        "performance": {"winRate": 0.0, "avgRoundTimeSec": 0.0, "correctRate": 0.0},
        "timeline": timeline,
        "topPlayers": top_players,
    }

# =====================================================================================
# 4) USERS legacy
# =====================================================================================
@router.get("/users/{user_id}/history")
def user_history(
    user_id: str = Path(..., description="Alumno UUID"),
    days: int = Query(90, ge=1, le=365),
    limit: int = Query(50, ge=1, le=200),
    _actor=Depends(current_actor),
    db: Session = Depends(db_session),
):
    _uid, roles = _actor
    require_roles(roles, ["ROLE_ADMIN", "ROLE_TEACHER"])

    since = datetime.now(timezone.utc) - timedelta(days=days)
    rows = list(
        db.scalars(
            select(Match)
            .where(
                Match.created_at >= since,
                exists().where(and_(MatchPlayer.match_id == Match.id, MatchPlayer.user_id == user_id)),
            )
            .order_by(Match.created_at.desc())
            .limit(limit)
        )
    )
    out = []
    for m in rows:
        out.append({
            "matchId": m.id,
            "status": m.status,
            "createdAt": m.created_at.isoformat() if m.created_at else None,
            "finishedAt": m.finished_at.isoformat() if m.finished_at else None,
            "winnerId": m.winner_id,
            "bestOf": m.best_of,
            "questionsPerRound": m.questions_per_round,
            "difficulty": m.difficulty,
            "shortCode": m.short_code,
        })
    return out

@router.get("/users/{user_id}/summary")
def user_summary(
    user_id: str,
    days: int = Query(90, ge=1, le=365),
    _actor=Depends(current_actor),
    db: Session = Depends(db_session),
):
    _uid, roles = _actor
    require_roles(roles, ["ROLE_ADMIN", "ROLE_TEACHER"])

    since = datetime.now(timezone.utc) - timedelta(days=days)

    played = db.scalar(
        select(func.count())
        .select_from(Match)
        .where(
            Match.status == "FINISHED",
            Match.finished_at >= since,
            exists().where(and_(MatchPlayer.match_id == Match.id, MatchPlayer.user_id == user_id)),
        )
    ) or 0
    wins = db.scalar(
        select(func.count())
        .select_from(Match)
        .where(Match.status == "FINISHED", Match.finished_at >= since, Match.winner_id == user_id)
    ) or 0
    losses = int(played) - int(wins)

    rating_row = db.get(DuelRating, user_id)
    rating = int(rating_row.rating) if rating_row else 1000

    last = db.scalar(
        select(func.max(Match.finished_at))
        .where(
            Match.status == "FINISHED",
            exists().where(and_(MatchPlayer.match_id == Match.id, MatchPlayer.user_id == user_id)),
        )
    )

    return {
        "userId": user_id,
        "played": int(played),
        "wins": int(wins),
        "losses": int(losses),
        "rating": rating,
        "lastPlayedAt": last.isoformat() if last else None,
    }
