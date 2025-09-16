# app/api/routers/recommendations.py

from datetime import datetime, timezone
from typing import Optional, List
from uuid import UUID

from fastapi import APIRouter, Depends, Query, HTTPException, Path
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_redis, get_curriculum_client
from app.core.settings import settings
from app.security.authz import require_public_roles, AuthContext
from app.security.jwt import parse_principal_uuid_or_forbid
from app.schemas.recommendations import (
    RecommendationsResponse,
    Subject,
    RecommendationItem,
)
from app.services.recommender import recommend_for_student
from app.observability.metrics import advisor_reco_latency_seconds
from app.core.rate_limit import rate_limit

import json

router = APIRouter(prefix="/api/ai", tags=["recommendations"])


def _cache_key(
    student_id: UUID,
    limit: int,
    subject: Optional[str],
    objective_id: Optional[UUID],
) -> str:
    subj = (subject or "any").lower()
    obj = str(objective_id) if objective_id else "any"
    return f"reco:{student_id}:{subj}:{obj}:limit{limit}"


def _build_payload(items: List[RecommendationItem]) -> dict:
    return {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "items": [i.model_dump() for i in items],
    }


def _get_or_set_cache(rdb, key: str, compute_fn) -> dict:
    # Lectura
    if rdb:
        try:
            raw = rdb.get(key)
            if raw:
                data = json.loads(raw)
                if isinstance(data, dict) and "items" in data:
                    return data
        except Exception:
            # Cache miss o formato inválido: seguimos a compute_fn
            pass

    # Cálculo
    data = compute_fn()

    # Escritura
    if rdb:
        try:
            rdb.setex(key, settings.CACHE_TTL_SECONDS, json.dumps(data))
        except Exception:
            # No romper si Redis falla
            pass

    return data


# A) Recos para el estudiante autenticado
@router.get(
    "/recommendations/students/me",
    response_model=RecommendationsResponse,
    summary="Recomendaciones personalizadas para el estudiante autenticado",
)
@rate_limit("60/minute")
def recommend_me(
    ctx: AuthContext = Depends(require_public_roles("ROLE_STUDENT")),
    db: Session = Depends(get_db),
    rdb=Depends(get_redis),
    curriculum=Depends(get_curriculum_client),
    limit: int = Query(8, ge=1, le=20),
    subject: Optional[Subject] = Query(default=None),
    objectiveId: Optional[UUID] = Query(default=None),
    fresh: bool = Query(default=False, description="Ignora caché si es true"),
) -> RecommendationsResponse:
    student_uuid = parse_principal_uuid_or_forbid(ctx.principal)
    subject_str = (
        str(subject.value if hasattr(subject, "value") else subject) if subject else None
    )

    def _compute():
        with advisor_reco_latency_seconds.time():
            items = recommend_for_student(
                db,
                student_id=student_uuid,
                limit=limit,
                subject=subject_str,
                objective_id=objectiveId,
                curriculum_client=curriculum,
            )
        return _build_payload(items)

    if rdb and not fresh:
        payload = _get_or_set_cache(
            rdb, _cache_key(student_uuid, limit, subject_str, objectiveId), _compute
        )
    else:
        payload = _compute()

    return RecommendationsResponse(**payload)


# B) Variante con query param (útil para docentes/soporte)
@router.get(
    "/recommendations",
    response_model=RecommendationsResponse,
    summary="Recomendaciones por studentId (docente/soporte). Devuelve mismo contrato que 'students/me'",
)
@rate_limit("60/minute")
def recommend_for_student_qp(
    studentId: UUID = Query(..., description="ID del estudiante"),
    limit: int = Query(8, ge=1, le=30),
    subject: Optional[Subject] = Query(default=None),
    objectiveId: Optional[UUID] = Query(default=None),
    ctx: AuthContext = Depends(require_public_roles("ROLE_STUDENT", "ROLE_TEACHER")),
    db: Session = Depends(get_db),
    rdb=Depends(get_redis),
    curriculum=Depends(get_curriculum_client),
    fresh: bool = Query(default=False),
) -> RecommendationsResponse:
    subject_str = (
        str(subject.value if hasattr(subject, "value") else subject) if subject else None
    )

    def _compute():
        with advisor_reco_latency_seconds.time():
            items = recommend_for_student(
                db,
                student_id=studentId,
                limit=limit,
                subject=subject_str,
                objective_id=objectiveId,
                curriculum_client=curriculum,
            )
        return _build_payload(items)

    if rdb and not fresh:
        payload = _get_or_set_cache(
            rdb, _cache_key(studentId, limit, subject_str, objectiveId), _compute
        )
    else:
        payload = _compute()

    return RecommendationsResponse(**payload)


# C) Variante path param (la que probabas)
@router.get(
    "/recommendations/students/{studentId}",
    response_model=RecommendationsResponse,
    summary="Recomendaciones por studentId (path param). Mismo contrato.",
)
@rate_limit("60/minute")
def recommend_for_student_path(
    studentId: UUID = Path(..., description="ID del estudiante"),
    limit: int = Query(8, ge=1, le=30),
    subject: Optional[Subject] = Query(default=None),
    objectiveId: Optional[UUID] = Query(default=None),
    ctx: AuthContext = Depends(require_public_roles("ROLE_STUDENT", "ROLE_TEACHER")),
    db: Session = Depends(get_db),
    rdb=Depends(get_redis),
    curriculum=Depends(get_curriculum_client),
    fresh: bool = Query(default=False),
) -> RecommendationsResponse:
    subject_str = (
        str(subject.value if hasattr(subject, "value") else subject) if subject else None
    )

    def _compute():
        with advisor_reco_latency_seconds.time():
            items = recommend_for_student(
                db,
                student_id=studentId,
                limit=limit,
                subject=subject_str,
                objective_id=objectiveId,
                curriculum_client=curriculum,
            )
        return _build_payload(items)

    if rdb and not fresh:
        payload = _get_or_set_cache(
            rdb, _cache_key(studentId, limit, subject_str, objectiveId), _compute
        )
    else:
        payload = _compute()

    return RecommendationsResponse(**payload)
