# app/api/routers/recommendations.py
from datetime import datetime, timezone
from typing import Optional, List, Callable, Dict, Any
from uuid import UUID
import json
import logging

from fastapi import APIRouter, Depends, Query, Path, Body
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_redis, get_curriculum_client, get_progress_client
from app.core.settings import settings
from app.security.authz import require_public_roles, AuthContext
from app.security.jwt import parse_principal_uuid_or_forbid
from app.schemas.recommendations import (
    RecommendationsResponse,
    Subject,
    RecommendationItem,
)
from app.schemas.reco_events import RecoEventIn
from app.services.recommender import recommend_for_student
from app.observability.metrics import (
    advisor_reco_latency_seconds,
    advisor_reco_events_total,
    advisor_reco_click_total,
)
from app.core.rate_limit import rate_limit

router = APIRouter(prefix="/api/ai", tags=["recommendations"])
logger = logging.getLogger(__name__)


# ---------------- Claves de caché e índice ----------------

def _cache_key(
    student_id: UUID,
    limit: int,
    subject: Optional[str],
    objective_id: Optional[UUID],
) -> str:
    subj = (subject or "any").lower()
    obj = str(objective_id) if objective_id else "any"
    return f"reco:{student_id}:{subj}:{obj}:limit{limit}"

def _index_key(student_id: UUID) -> str:
    # Hash con pares exerciseId -> difficulty (EASY|MEDIUM|HARD)
    return f"reco:index:{student_id}"


def _build_payload(items: List[RecommendationItem]) -> dict:
    return {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "items": [i.model_dump() for i in items],
    }


def _update_reco_index(rdb, student_id: UUID, payload: Dict[str, Any]) -> None:
    """Construye/actualiza el índice O(1) exercise->difficulty para el estudiante."""
    if not rdb:
        return
    try:
        items = (payload or {}).get("items") or []
        if not items:
            return
        mapping: Dict[str, str] = {}
        for it in items:
            ex = str(it.get("exerciseId") or "").strip()
            diff = str(it.get("difficulty") or "").upper().strip()
            if ex and diff in {"EASY", "MEDIUM", "HARD"}:
                mapping[ex] = diff
        if mapping:
            key = _index_key(student_id)
            # HSET con múltiples campos; refrescamos expiración acorde al caché
            rdb.hset(key, mapping=mapping)
            rdb.expire(key, int(getattr(settings, "CACHE_TTL_SECONDS", 1800)))
    except Exception as e:
        logger.warning("No se pudo actualizar índice de recos en Redis: %s", e)


def _get_or_set_cache(
    rdb,
    key: str,
    compute_fn: Callable[[], Dict[str, Any]],
    *,
    student_id: Optional[UUID] = None,
) -> dict:
    # Lectura
    if rdb:
        try:
            raw = rdb.get(key)
            if raw:
                data = json.loads(raw)
                # opcional: rehidratar índice (por si se perdió expiración)
                if student_id:
                    _update_reco_index(rdb, student_id, data)
                if isinstance(data, dict) and "items" in data:
                    return data
        except Exception:
            pass

    # Cálculo
    data = compute_fn()

    # Escritura + índice
    if rdb:
        try:
            rdb.setex(key, settings.CACHE_TTL_SECONDS, json.dumps(data))
        except Exception:
            pass
        if student_id:
            _update_reco_index(rdb, student_id, data)

    return data


def _find_difficulty_fast(rdb, student_id: UUID, exercise_id: str) -> Optional[str]:
    """Lectura O(1) desde hash reco:index:{studentId}."""
    if not rdb:
        return None
    try:
        d = rdb.hget(_index_key(student_id), exercise_id)
        if not d:
            return None
        d = str(d).upper().strip()
        return d if d in {"EASY", "MEDIUM", "HARD"} else None
    except Exception as e:
        logger.warning("No se pudo leer difficulty desde índice Redis: %s", e)
        return None


# ---------------- Endpoints de recomendaciones ----------------

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
    progress=Depends(get_progress_client),
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
                progress_client=progress,
            )
        return _build_payload(items)

    if rdb and not fresh:
        payload = _get_or_set_cache(
            rdb,
            _cache_key(student_uuid, limit, subject_str, objectiveId),
            _compute,
            student_id=student_uuid,
        )
    else:
        payload = _compute()
        # si pediste fresh, actualizamos índice igual
        _update_reco_index(rdb, student_uuid, payload)

    return RecommendationsResponse(**payload)


@router.get(
    "/recommendations",
    response_model=RecommendationsResponse,
    summary="Recomendaciones por studentId (docente/soporte). Mismo contrato que 'students/me'",
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
    progress=Depends(get_progress_client),
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
                progress_client=progress,
            )
        return _build_payload(items)

    if rdb and not fresh:
        payload = _get_or_set_cache(
            rdb,
            _cache_key(studentId, limit, subject_str, objectiveId),
            _compute,
            student_id=studentId,
        )
    else:
        payload = _compute()
        _update_reco_index(rdb, studentId, payload)

    return RecommendationsResponse(**payload)


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
    progress=Depends(get_progress_client),
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
                progress_client=progress,
            )
        return _build_payload(items)

    if rdb and not fresh:
        payload = _get_or_set_cache(
            rdb,
            _cache_key(studentId, limit, subject_str, objectiveId),
            _compute,
            student_id=studentId,
        )
    else:
        payload = _compute()
        _update_reco_index(rdb, studentId, payload)

    return RecommendationsResponse(**payload)


# ---------------- CTR / eventos de recomendaciones ----------------

@router.post(
    "/recommendations/events",
    status_code=204,
    summary="Ingesta de eventos de interacción con recomendaciones (CTR)",
)
def post_reco_event(
    evt: RecoEventIn = Body(...),
    ctx: AuthContext = Depends(require_public_roles("ROLE_STUDENT")),
    rdb = Depends(get_redis),
):
    student_uuid = parse_principal_uuid_or_forbid(ctx.principal)

    # métrica general por tipo
    advisor_reco_events_total.labels(event=evt.event).inc()

    # dificultad (si FE no la mandó, resolvemos vía índice O(1))
    difficulty = (evt.difficulty or "").upper().strip() if evt.difficulty else None
    if not difficulty:
        difficulty = _find_difficulty_fast(rdb, student_uuid, str(evt.exerciseId)) or "UNK"

    # Para CTR contamos sólo OPEN
    if evt.event == "OPEN":
        advisor_reco_click_total.labels(difficulty=difficulty, source="AI_RECO").inc()

    # MVP: log-only (si luego quieres DB, aquí insert)
    logger.info(
        "RECO_EVENT sid=%s evt=%s ex=%s obj=%s diff=%s ref=%s ts=%s",
        student_uuid, evt.event, evt.exerciseId, evt.objectiveId,
        difficulty, evt.sourceRefId, (evt.ts.isoformat() if evt.ts else None),
    )
    return
