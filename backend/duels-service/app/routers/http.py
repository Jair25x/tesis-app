from __future__ import annotations
import os, time
from collections import deque
from typing import Deque, Dict, Optional, Literal

from fastapi import APIRouter, Depends, HTTPException, Query, Path, Request
from sqlalchemy.orm import Session
from sqlalchemy import select, func, exists, and_

from ..deps import SessionLocal, current_user
from ..models import Match, MatchPlayer, DuelRating
from ..schemas import (
    CreateMatchRequest,
    CreateMatchResponse,
    OpenMatch,
    ResolveResponse,
    DuelSummaryResponse,
    DuelHistoryItem,
    ObjectiveAvailabilityResp,
    Difficulty,
)
from ..services.duel_manager import (
    create_match as svc_create_match,
    list_open_matches,
    resolve_short_code,
)
from ..services.exercise_picker import available_count_for_objective

# Rate limit (Redis opcional)
REDIS_URL = os.getenv("RATE_LIMIT_REDIS_URL", "").strip()
MATCHES_PER_MIN = int(os.getenv("RATE_LIMIT_MATCHES_PER_MIN", "10"))
RESOLVE_PER_MIN = int(os.getenv("RATE_LIMIT_RESOLVE_PER_MIN", "30"))

try:
    import redis  # type: ignore
    _r = redis.from_url(REDIS_URL) if REDIS_URL else None
except Exception:
    _r = None

# Fallback in-memory (para dev / single worker)
_inmem_bucket: Dict[str, Deque[float]] = {}
_inmem_bucket_resolve: Dict[str, Deque[float]] = {}

def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def _rate_limit(bucket: Dict[str, Deque[float]], key: str, limit_per_min: int):
    now = time.time()
    window = 60
    if _r:
        rkey = f"rl:{key}:{int(now//window)}"
        cnt = _r.incr(rkey)
        if cnt == 1:
            _r.expire(rkey, window + 5)
        if cnt > limit_per_min:
            raise HTTPException(status_code=429, detail="Too many requests")
    else:
        dq = bucket.setdefault(key, deque())
        while dq and now - dq[0] > window:
            dq.pop() if False else dq.popleft()
        if len(dq) >= limit_per_min:
            raise HTTPException(status_code=429, detail="Too many requests")
        dq.append(now)

def rate_limit_create_match(user_id: str):
    _rate_limit(_inmem_bucket, f"duels:matches:{user_id}", MATCHES_PER_MIN)

def rate_limit_resolve(user_id: str, ip: str):
    # por usuario e IP
    _rate_limit(_inmem_bucket_resolve, f"duels:resolve:user:{user_id}", RESOLVE_PER_MIN)
    _rate_limit(_inmem_bucket_resolve, f"duels:resolve:ip:{ip}", RESOLVE_PER_MIN)

router = APIRouter(prefix="/api/duels", tags=["duels"])

# ---------- Crear match ----------
@router.post("/matches", response_model=CreateMatchResponse, status_code=201)
def create_match(
    req: CreateMatchRequest,
    user_id: str = Depends(current_user),
    db: Session = Depends(db_session),
):
    rate_limit_create_match(user_id)

    # Validación amigable extra (además del validador de Pydantic)
    if not (
        (req.exerciseIds and len(req.exerciseIds) > 0)
        or req.objectiveId
        or (req.roundConfigs and len(req.roundConfigs) > 0)
        or (req.roundPicks and len(req.roundPicks) > 0)
        or (req.rounds and len(req.rounds) > 0)
    ):
        raise HTTPException(status_code=400, detail="Provide exerciseIds[]/roundConfigs[]/roundPicks[]/rounds[] or objectiveId")

    m = svc_create_match(db, creator_id=user_id, req=req)
    db.commit()
    return CreateMatchResponse(matchId=m.id, shortCode=m.short_code or "")

# ---------- Partidas públicas en WAITING ----------
@router.get("/open", response_model=list[OpenMatch])
def list_open(
    curriculumId: str | None = Query(None),
    user_id: str = Depends(current_user),
    db: Session = Depends(db_session),
):
    items = list_open_matches(db, curriculum_id=curriculumId)
    out: list[OpenMatch] = []
    for m in items:
        out.append(
            OpenMatch(
                matchId=m.id,
                shortCode=m.short_code or "",
                bestOf=m.best_of,
                createdAt=m.created_at.isoformat() if m.created_at else "",
                createdBy=m.creator_id,
                maxPlayers=m.max_players or 2,
            )
        )
    return out

# ---------- Resolver código corto ----------
@router.get("/resolve/{code}", response_model=ResolveResponse)
def resolve_code(
    request: Request,
    code: str,
    user_id: str = Depends(current_user),
    db: Session = Depends(db_session),
):
    client_ip = request.client.host if request and request.client else "0.0.0.0"
    rate_limit_resolve(user_id, client_ip)

    mid = resolve_short_code(db, code)
    if not mid:
        raise HTTPException(status_code=404, detail="Code not found")
    return ResolveResponse(matchId=mid)

# ---------- Obtener match (básico) ----------
@router.get("/matches/{match_id}")
def get_match(
    match_id: str = Path(..., description="Match UUID"),
    user_id: str = Depends(current_user),
    db: Session = Depends(db_session),
):
    m = db.get(Match, match_id)
    if not m:
        raise HTTPException(status_code=404, detail="Not found")

    # Autorización básica: creador / participante o público y en WAITING
    is_participant = bool(db.scalar(
        select(func.count()).select_from(MatchPlayer)
        .where(MatchPlayer.match_id == m.id, MatchPlayer.user_id == user_id)
    ))
    if not is_participant and not (m.is_public and m.status == "WAITING"):
        # permitir creador explícitamente
        if user_id != m.creator_id:
            raise HTTPException(status_code=403, detail="Forbidden")

    return {
        "matchId": m.id,
        "shortCode": m.short_code or "",
        "bestOf": m.best_of,
        "status": m.status,
    }

# ---------- Resumen W/L + rating ----------
@router.get("/me/summary", response_model=DuelSummaryResponse)
def my_summary(
    user_id: str = Depends(current_user),
    db: Session = Depends(db_session),
):
    played = db.scalar(
        select(func.count())
        .select_from(Match)
        .where(
            Match.status == "FINISHED",
            exists().where(and_(MatchPlayer.match_id == Match.id, MatchPlayer.user_id == user_id)),
        )
    ) or 0

    wins = db.scalar(
        select(func.count())
        .select_from(Match)
        .where(Match.status == "FINISHED", Match.winner_id == user_id)
    ) or 0

    losses = db.scalar(
        select(func.count())
        .select_from(Match)
        .where(
            Match.status == "FINISHED",
            Match.winner_id.isnot(None),
            Match.winner_id != user_id,
            exists().where(and_(MatchPlayer.match_id == Match.id, MatchPlayer.user_id == user_id)),
        )
    ) or 0

    r = db.get(DuelRating, user_id)
    rating = int(r.rating) if r else 1000

    last = db.scalar(
        select(func.max(Match.created_at)).where(
            Match.status == "FINISHED",
            exists().where(and_(MatchPlayer.match_id == Match.id, MatchPlayer.user_id == user_id)),
        )
    )

    return DuelSummaryResponse(
        played=int(played),
        wins=int(wins),
        losses=int(losses),
        rating=rating,
        lastPlayedAt=last.isoformat() if last else None,
    )

# ---------- Historial ----------
@router.get("/me/history", response_model=list[DuelHistoryItem])
def my_history(
    limit: int = Query(20, ge=1, le=100),
    user_id: str = Depends(current_user),
    db: Session = Depends(db_session),
):
    rows = list(
        db.scalars(
            select(Match)
            .where(
                Match.status == "FINISHED",
                exists().where(and_(MatchPlayer.match_id == Match.id, MatchPlayer.user_id == user_id)),
            )
            .order_by(Match.created_at.desc())
            .limit(limit)
        )
    )

    out: list[DuelHistoryItem] = []
    for m in rows:
        out.append(
            DuelHistoryItem(
                matchId=m.id,
                finishedAt=m.created_at.isoformat() if m.created_at else None,
                bestOf=m.best_of,
                winnerId=m.winner_id,
                shortCode=m.short_code,
            )
        )
    return out

# ---------- Availability por objetivo (source real) ----------
def _norm_difficulty(d: Optional[str]) -> Optional[Difficulty]:
    if not d:
        return None
    up = d.strip().upper()
    if up in ("EASY", "MEDIUM", "HARD"):
        return up  # type: ignore[return-value]
    mapping: Dict[str, Difficulty] = {"BASIC": "EASY", "INTERMEDIATE": "MEDIUM", "ADVANCED": "HARD"}
    if up in mapping:
        return mapping[up]
    return None

@router.get(
    "/objectives/{objective_id}/availability",
    response_model=ObjectiveAvailabilityResp
)
def get_objective_availability(
    objective_id: str = Path(..., description="UUID del objetivo"),
    difficulty: Optional[str] = Query(None, description="EASY|MEDIUM|HARD"),
    min_required: int = Query(1, ge=1, le=10),
    max_allowed: int = Query(10, ge=1, le=50),
    user_id: str = Depends(current_user),
):
    """
    Devuelve cuántos ejercicios activos hay para un OA,
    opcionalmente filtrando por dificultad. Se alinea con la validación del POST /matches.
    """
    diff_norm = _norm_difficulty(difficulty)
    k = max_allowed

    try:
        count, source = available_count_for_objective(objective_id, k, diff_norm or None)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"availability unavailable: {e}")

    return ObjectiveAvailabilityResp(
        objectiveId=objective_id,
        difficulty=diff_norm,
        available=max(0, int(count)),
        minRequired=int(min_required),
        maxAllowed=int(max_allowed),
        source=source,
    )
