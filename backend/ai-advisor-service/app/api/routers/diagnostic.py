# app/api/routers/diagnostic.py
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Body, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel, Field

from app.api.deps import get_session
from app.security.authz import require_internal
from app.services.recommender import commit_student_level

router = APIRouter(prefix="/internal/diagnostic", tags=["internal"])

class CommitPayload(BaseModel):
    studentId: str
    phase: str = Field(default="INITIAL")  # INITIAL|MID|FINAL
    windowStart: Optional[datetime] = None
    windowEnd: Optional[datetime] = None
    force: bool = False

@router.post("/commit", status_code=status.HTTP_200_OK,
             dependencies=[Depends(require_internal("ROLE_INTERNAL"))])
def commit(payload: CommitPayload = Body(...), db: Session = Depends(get_session)):
    result = commit_student_level(
        db=db,
        student_id=payload.studentId,
        phase=payload.phase,
        window_start=payload.windowStart,
        window_end=payload.windowEnd,
        force=payload.force,
    )
    db.commit()
    return result

@router.get("/student-stats", dependencies=[Depends(require_internal("ROLE_INTERNAL"))])
def student_stats(studentId: str, db: Session = Depends(get_session)):
    rows = db.execute(text("""
      SELECT objective_id, attempts, corrects, avg_score, last_attempt_at, streak,
             attempts_easy, attempts_medium, attempts_hard,
             corrects_easy, corrects_medium, corrects_hard
      FROM student_objective_stats
      WHERE student_id = :sid
      ORDER BY last_attempt_at DESC NULLS LAST
      LIMIT 50
    """), {"sid": studentId}).mappings().all()
    return {"items": [dict(r) for r in rows]}
