# app/api/routers/reco_debug.py
from typing import Optional, List, Tuple
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.api.deps import get_db, get_curriculum_client
from app.security.authz import require_internal
from app.services.clients.curriculum_client import CurriculumClient
from app.services.recommender import _score_objective as score_fn  # reutilizamos

router = APIRouter(prefix="/internal/reco", tags=["internal-reco"])

@router.get("/why-empty", dependencies=[Depends(require_internal("ROLE_INTERNAL"))])
def why_empty(
    studentId: UUID = Query(...),
    limit: int = Query(8, ge=1, le=20),
    db: Session = Depends(get_db),
    curriculum: CurriculumClient = Depends(get_curriculum_client),
):
    rows = db.execute(text("""
        SELECT objective_id, attempts, corrects, last_attempt_at
          FROM student_objective_stats
         WHERE student_id = :sid
    """), {"sid": str(studentId)}).mappings().all()

    if not rows:
        return {"hasStats": False, "message": "No hay filas en student_objective_stats para ese alumno."}

    # rank local
    cand: List[Tuple[str, float, int, int]] = []
    for r in rows:
        sc = score_fn(int(r["attempts"] or 0), int(r["corrects"] or 0), r["last_attempt_at"])
        cand.append((str(r["objective_id"]), float(sc), int(r["attempts"] or 0), int(r["corrects"] or 0)))
    cand.sort(key=lambda x: x[1], reverse=True)

    out = []
    for oid, sc, att, cor in cand[:limit]:
        try:
            items = curriculum.get_exercises_for_objective(
                objective_id=oid, limit=1, active=True, random=False, difficulty=None, order="desc"
            )
            ok = bool(items)
        except Exception:
            ok = False
            items = None
        out.append({
            "objectiveId": oid,
            "score": round(float(sc), 3),
            "attempts": att, "corrects": cor,
            "curriculumHasExercise": ok,
            "sample": items[:1] if items else None
        })
    return {"hasStats": True, "candidates": out}
