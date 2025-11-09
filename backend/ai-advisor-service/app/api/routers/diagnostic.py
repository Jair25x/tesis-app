# app/api/routers/diagnostic.py
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Body, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel, Field

from app.api.deps import get_session, get_redis
from app.security.authz import require_internal
from app.services.recommender import commit_student_level
from app.observability.metrics import advisor_reco_invalidate_total

router = APIRouter(prefix="/internal/diagnostic", tags=["internal"])

class CommitPayload(BaseModel):
    studentId: str
    phase: str = Field(default="INITIAL")  # INITIAL|MID|FINAL
    windowStart: Optional[datetime] = None
    windowEnd: Optional[datetime] = None
    force: bool = False

@router.post("/commit", status_code=status.HTTP_200_OK,
             dependencies=[Depends(require_internal("ROLE_INTERNAL"))])
def commit(payload: CommitPayload = Body(...), db: Session = Depends(get_session), rdb=Depends(get_redis)):
    result = commit_student_level(
        db=db,
        student_id=payload.studentId,
        phase=payload.phase,
        window_start=payload.windowStart,
        window_end=payload.windowEnd,
        force=payload.force,
    )
    db.commit()

    # ✅ invalida cache de ese estudiante
    try:
        # mismas claves que en recommendations.py
        # como aquí no tenemos el limit/subject/objective, hacemos scan
        cur = 0
        pattern = f"reco:v1:{payload.studentId}:*"
        while True:
            cur, keys = rdb.scan(cur, match=pattern, count=100)
            if keys:
                rdb.delete(*keys)
            if cur == 0:
                break
        advisor_reco_invalidate_total.labels(source="diagnostic").inc()
    except Exception:
        pass

    return result
