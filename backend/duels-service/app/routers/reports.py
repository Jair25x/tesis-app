# app/routers/reports.py
from __future__ import annotations
from typing import Optional, List, Dict, Tuple
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends, Query, Path
from sqlalchemy.orm import Session
from sqlalchemy import select, func, and_, exists, text

from ..deps import SessionLocal, current_actor, require_roles
from ..models import Match, MatchPlayer, DuelRating
from ..clients.classrooms import students_for_teacher

# Optional Answer model (fallback si no existe)
try:
    from ..models import Answer  # campos esperados: match_id,user_id,is_correct,time_ms,created_at
    HAS_ANSWER = True
except Exception:
    HAS_ANSWER = False

router = APIRouter(prefix="/api/duels/reports", tags=["duels-reports"])

def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

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
        stu = students_for_teacher(user_id, classroom_id=classroomId)
        if not stu:
            return {
                "range": {"from": dt_from.isoformat(), "to": dt_to.isoformat(), "groupBy": groupBy, "curriculumId": curriculumId, "classroomId": classroomId},
                "totals": {"matches": 0, "rounds": 0, "answers": 0, "players": 0},
                "performance": {"winRate": 0.0, "avgRoundTimeSec": 0.0, "correctRate": 0.0},
                "timeline": [],
                "topPlayers": [],
            }
        students_filter = list(stu)

    # Base filters
    filters_created = [Match.created_at >= dt_from, Match.created_at < dt_to]
    filters_finished = [Match.finished_at.is_not(None), Match.finished_at >= dt_from, Match.finished_at < dt_to]
    if curriculumId:
        filters_created.append(Match.curriculum_id == curriculumId)
        filters_finished.append(Match.curriculum_id == curriculumId)

    if students_filter is not None:
        exists_student = exists().where(and_(MatchPlayer.match_id == Match.id, MatchPlayer.user_id.in_(students_filter)))
        filters_created.append(exists_student)
        filters_finished.append(exists_student)

    # Totales
    total_matches = db.scalar(select(func.count()).select_from(Match).where(*filters_created)) or 0

    # Players únicos (en matches del rango)
    players_unique = 0
    try:
        q_players = select(func.count(func.distinct(MatchPlayer.user_id))).select_from(MatchPlayer).where(
            exists().where(and_(
                MatchPlayer.match_id == Match.id,
                Match.created_at >= dt_from, Match.created_at < dt_to,
                *( [Match.curriculum_id == curriculumId] if curriculumId else [] )
            ))
        )
        if students_filter is not None:
            q_players = q_players.where(MatchPlayer.user_id.in_(students_filter))
        players_unique = db.scalar(q_players) or 0
    except Exception:
        players_unique = 0

    # Rounds/Answers totales: si no tienes tablas específicas, déjalo en 0
    total_rounds = 0
    total_answers = 0

    # KPIs performance
    # WINS de alumnos del universo
    wins = db.scalar(
        select(func.count())
        .select_from(Match)
        .where(
            Match.status == "FINISHED",
            Match.finished_at >= dt_from,
            Match.finished_at < dt_to,
            *( [Match.curriculum_id == curriculumId] if curriculumId else [] ),
            exists().where(and_(MatchPlayer.match_id == Match.id, MatchPlayer.user_id.in_(students_filter))) if students_filter else text("1=1"),
            Match.winner_id.is_not(None),
            Match.winner_id.in_(students_filter) if students_filter else text("1=1"),
        )
    ) or 0

    played_by_students = db.scalar(
        select(func.count())
        .select_from(Match)
        .where(
            Match.status == "FINISHED",
            Match.finished_at >= dt_from,
            Match.finished_at < dt_to,
            *( [Match.curriculum_id == curriculumId] if curriculumId else [] ),
            exists().where(and_(MatchPlayer.match_id == Match.id, MatchPlayer.user_id.in_(students_filter))) if students_filter else text("1=1"),
        )
    ) or 0

    losses = int(played_by_students) - int(wins)
    win_rate = float(wins) / float(wins + losses) if (wins + losses) > 0 else 0.0

    # correctRate y avgRoundTimeSec si existe Answer
    correct_rate = 0.0
    avg_round_time_sec = 0.0

    if HAS_ANSWER:
        # total answers y correct
        q_ans_base = select(func.count()).select_from(Answer).where(
            Answer.created_at >= dt_from,
            Answer.created_at < dt_to,
        )
        q_corr_base = select(func.count()).select_from(Answer).where(
            Answer.created_at >= dt_from,
            Answer.created_at < dt_to,
            Answer.is_correct == True,  # noqa: E712
        )
        q_time_base = select(func.avg(Answer.time_ms).cast(func.FLOAT)).where(
            Answer.created_at >= dt_from,
            Answer.created_at < dt_to,
        )

        if students_filter is not None:
            q_ans_base = q_ans_base.where(Answer.user_id.in_(students_filter))
            q_corr_base = q_corr_base.where(Answer.user_id.in_(students_filter))
            q_time_base = q_time_base.where(Answer.user_id.in_(students_filter))

        # Si quieres filtrar por curriculumId, hay que join con Match (si Answer tiene match_id)
        if curriculumId:
            try:
                # Join semántico: Answer.match_id == Match.id
                q_join = select(func.count()).select_from(Answer).join(Match, Answer.match_id == Match.id).where(
                    Answer.created_at >= dt_from, Answer.created_at < dt_to, Match.curriculum_id == curriculumId
                )
                if students_filter is not None:
                    q_join = q_join.where(Answer.user_id.in_(students_filter))
                total_answers = db.scalar(q_join) or 0

                q_join_corr = select(func.count()).select_from(Answer).join(Match, Answer.match_id == Match.id).where(
                    Answer.created_at >= dt_from, Answer.created_at < dt_to, Match.curriculum_id == curriculumId, Answer.is_correct == True  # noqa: E712
                )
                if students_filter is not None:
                    q_join_corr = q_join_corr.where(Answer.user_id.in_(students_filter))
                correct = db.scalar(q_join_corr) or 0

                q_join_time = select(func.avg(Answer.time_ms).cast(func.FLOAT)).select_from(Answer).join(Match, Answer.match_id == Match.id).where(
                    Answer.created_at >= dt_from, Answer.created_at < dt_to, Match.curriculum_id == curriculumId
                )
                if students_filter is not None:
                    q_join_time = q_join_time.where(Answer.user_id.in_(students_filter))
                avg_ms = db.scalar(q_join_time)
            except Exception:
                total_answers = db.scalar(q_ans_base) or 0
                correct = db.scalar(q_corr_base) or 0
                avg_ms = db.scalar(q_time_base)
        else:
            total_answers = db.scalar(q_ans_base) or 0
            correct = db.scalar(q_corr_base) or 0
            avg_ms = db.scalar(q_time_base)

        correct_rate = float(correct) / float(total_answers) if total_answers > 0 else 0.0
        avg_round_time_sec = float(avg_ms) / 1000.0 if avg_ms is not None else 0.0

    # Timeline
    trunc_created = _group_trunc_expr(Match.created_at, groupBy)
    trunc_finished = _group_trunc_expr(Match.finished_at, groupBy)

    rows_created = list(
        db.execute(
            select(trunc_created.label("bucket"), func.count())
            .where(*filters_created)
            .group_by(text("bucket"))
            .order_by(text("bucket").asc())
        )
    )
    rows_finished = list(
        db.execute(
            select(trunc_finished.label("bucket"), func.count())
            .where(*filters_finished)
            .group_by(text("bucket"))
            .order_by(text("bucket").asc())
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

    timeline = [
        {"bucket": k, "matches": v.get("finished", 0)}  # FE consume .matches (acabadas)
        for k, v in sorted(buckets.items(), key=lambda kv: kv[0])
    ]

    # Top players (limitados a universo si teacher)
    rating_rows = list(
        db.execute(
            select(DuelRating.user_id, DuelRating.rating).order_by(DuelRating.rating.desc()).limit(50)
        )
    )
    top_players = []
    for (uid, rating) in rating_rows:
        if students_filter is None or uid in students_filter:
            top_players.append({"userId": uid, "rating": int(rating)})
        if len(top_players) >= 10:
            break

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
            "rounds": int(total_rounds),
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

    items = []
    for m in rows:
        items.append({
            "matchId": m.id,
            "status": m.status,
            "createdAt": m.created_at.isoformat() if m.created_at else None,
            "finishedAt": m.finished_at.isoformat() if m.finished_at else None,
            "winnerId": m.winner_id,
            "bestOf": m.best_of,
            "questionsPerRound": m.questions_per_round,
            "difficulty": m.difficulty,
            "shortCode": m.short_code,
            "mode": m.mode,
            "maxPlayers": m.max_players,
        })

    return {"total": int(total), "limit": int(limit), "offset": int(offset), "items": items}

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
    finished = db.scalar(select(func.count()).select_from(Match).where(*filters_finished)) or 0
    open_waiting = db.scalar(
        select(func.count()).select_from(Match).where(Match.status == "WAITING", *filters_created)
    ) or 0

    avg_q = db.scalar(
        select(func.avg((Match.best_of * Match.questions_per_round).cast(func.FLOAT))).where(*filters_created)
    )
    avg_questions = round(float(avg_q), 2) if avg_q is not None else 0.0

    trunc_created = _group_trunc_expr(Match.created_at, groupBy)
    trunc_finished = _group_trunc_expr(Match.finished_at, groupBy)

    rows_created = list(
        db.execute(
            select(trunc_created.label("bucket"), func.count())
            .where(*filters_created)
            .group_by(text("bucket"))
            .order_by(text("bucket").asc())
        )
    )
    rows_finished = list(
        db.execute(
            select(trunc_finished.label("bucket"), func.count())
            .where(*filters_finished)
            .group_by(text("bucket"))
            .order_by(text("bucket").asc())
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

    timeline = [{"bucket": k, "matches": v.get("finished", 0)} for k, v in sorted(buckets.items(), key=lambda kv: kv[0])]

    top_players = [
        {"userId": uid, "rating": int(r)}
        for (uid, r) in db.execute(
            select(DuelRating.user_id, DuelRating.rating).order_by(DuelRating.rating.desc()).limit(10)
        )
    ]

    return {
        "range": {
            "from": dt_from.isoformat(),
            "to": dt_to.isoformat(),
            "groupBy": groupBy,
            "curriculumId": curriculumId,
        },
        "totals": {"matches": int(total), "rounds": 0, "answers": 0, "players": 0},
        "performance": {"winRate": 0.0, "avgRoundTimeSec": 0.0, "correctRate": 0.0},
        "timeline": timeline,
        "topPlayers": top_players,
    }

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
