# app/api/routers/curriculum_debug.py
from typing import Optional, List
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from app.security.authz import require_internal
from app.api.deps import get_curriculum_client
from app.services.clients.curriculum_client import CurriculumClient

router = APIRouter(prefix="/internal/curriculum", tags=["internal"])

@router.get(
    "/objectives/{objectiveId}/exercises/check",
    dependencies=[Depends(require_internal("ROLE_INTERNAL"))],
    summary="Chequea ejercicios para un objetivo (usa CurriculumClient)"
)
def check_objective_exercises(
    objectiveId: UUID,
    limit: int = Query(3, ge=1, le=20),
    active: bool = Query(True),
    difficulty: Optional[str] = Query(None, pattern="^(EASY|MEDIUM|HARD)?$"),
    random: bool = Query(True),
    order: str = Query("desc"),
    curriculum: CurriculumClient = Depends(get_curriculum_client),
):
    items = curriculum.get_exercises_for_objective(
        objective_id=str(objectiveId),
        limit=limit,
        random=random,
        active=active,
        difficulty=difficulty,
        order=order
    )
    arr = items if isinstance(items, list) else (items.get("items") or [])
    sample = [
        {
            "exerciseId": str(it.get("exerciseId")),
            "objectiveId": str(it.get("objectiveId")),
            "difficulty": it.get("difficulty"),
            "title": (it.get("title") or "")[:120]
        }
        for it in arr[:limit]
    ]
    return {"count": len(arr), "sample": sample}

@router.post(
    "/objectives/check-batch",
    dependencies=[Depends(require_internal("ROLE_INTERNAL"))],
    summary="Chequea varios objetivos y devuelve cuántos ejercicios hay por cada uno"
)
def check_objectives_batch(
    body: dict,
    curriculum: CurriculumClient = Depends(get_curriculum_client),
):
    ids: List[str] = [str(x) for x in (body.get("objectiveIds") or []) if x]
    if not ids:
        return {"objectives": []}
    out = []
    for oid in ids:
        items = curriculum.get_exercises_for_objective(
            objective_id=oid, limit=5, random=True, active=True, difficulty=None, order="desc"
        )
        arr = items if isinstance(items, list) else (items.get("items") or [])
        out.append({"objectiveId": oid, "count": len(arr)})
    return {"objectives": out}

@router.get(
    "/next/check",
    dependencies=[Depends(require_internal("ROLE_INTERNAL"))],
    summary="Siguiente objetivo (orden programático) — puente a curriculum"
)
def next_check(
    grade: str = Query(...),
    subject: str = Query(...),
    after: Optional[str] = Query(None),
    curriculum: CurriculumClient = Depends(get_curriculum_client),
):
    return curriculum.get_next_objective(grade=grade, subject=subject, after=after)
