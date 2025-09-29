# app/routers/http.py
from __future__ import annotations
import os, time
from collections import deque
from typing import Deque, Dict

from fastapi import APIRouter, Depends, HTTPException, status, Query, Path
from sqlalchemy.orm import Session

from ..deps import SessionLocal, current_user
from ..models import Match
from ..schemas import (
    CreateMatchRequest, CreateMatchResponse, OpenMatch, ResolveResponse,
)
from ..services.duel_manager import create_match as svc_create_match, list_open_matches, resolve_short_code

# Rate limit (Redis opcional)
REDIS_URL = os.getenv("RATE_LIMIT_REDIS_URL", "").strip()
MATCHES_PER_MIN = int(os.getenv("RATE_LIMIT_MATCHES_PER_MIN", "10"))

try:
    import redis  # type: ignore
    _r = redis.from_url(REDIS_URL) if REDIS_URL else None
except Exception:
    _r = None

# Fallback in-memory (para dev / single worker)
_inmem_bucket: Dict[str, Deque[float]] = {}

def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def rate_limit_create_match(user_id: str):
    now = time.time()
    window = 60
    if _r:
        key = f"rl:duels:matches:{user_id}:{int(now//window)}"
        cnt = _r.incr(key)
        if cnt == 1:
            _r.expire(key, window + 5)
        if cnt > MATCHES_PER_MIN:
            raise HTTPException(status_code=429, detail="Too many match creations")
    else:
        dq = _inmem_bucket.setdefault(user_id, deque())
        # purge
        while dq and now - dq[0] > window:
            dq.popleft()
        if len(dq) >= MATCHES_PER_MIN:
            raise HTTPException(status_code=429, detail="Too many match creations")
        dq.append(now)

router = APIRouter(prefix="/api/duels", tags=["duels"])

@router.post("/matches", response_model=CreateMatchResponse, status_code=201)
def create_match(
    req: CreateMatchRequest,
    user_id: str = Depends(current_user),
    db: Session = Depends(db_session),
):
    rate_limit_create_match(user_id)

    if not req.exerciseIds and not req.objectiveId:
        raise HTTPException(status_code=400, detail="Provide exerciseIds[] or objectiveId")

    m = svc_create_match(db, creator_id=user_id, req=req)
    db.commit()
    return CreateMatchResponse(matchId=m.id, shortCode=m.short_code or "")

@router.get("/open", response_model=list[OpenMatch])
def list_open(
    curriculumId: str | None = Query(None),
    user_id: str = Depends(current_user),
    db: Session = Depends(db_session),
):
    items = list_open_matches(db, curriculum_id=curriculumId)
    out: list[OpenMatch] = []
    for m in items:
        out.append(OpenMatch(
            matchId=m.id,
            shortCode=m.short_code or "",
            bestOf=m.best_of,
            createdAt=m.created_at.isoformat() if m.created_at else "",
            createdBy=m.creator_id,
            maxPlayers=m.max_players or 2,
        ))
    return out

@router.get("/resolve/{code}", response_model=ResolveResponse)
def resolve_code(
    code: str,
    user_id: str = Depends(current_user),
    db: Session = Depends(db_session),
):
    mid = resolve_short_code(db, code)
    if not mid:
        raise HTTPException(status_code=404, detail="Code not found")
    return ResolveResponse(matchId=mid)

# === NUEVO ===
@router.get("/matches/{match_id}")
def get_match(
    match_id: str = Path(..., description="Match UUID"),
    user_id: str = Depends(current_user),
    db: Session = Depends(db_session),
):
    m = db.get(Match, match_id)
    if not m:
        raise HTTPException(status_code=404, detail="Not found")

    # Autorización básica: creador, oponente, o público en WAITING
    if (user_id not in (m.creator_id, m.opponent_id)) and (not m.is_public):
        raise HTTPException(status_code=403, detail="Forbidden")

    return {
        "matchId": m.id,
        "shortCode": m.short_code or "",
        "bestOf": m.best_of,
        "status": m.status,
    }
