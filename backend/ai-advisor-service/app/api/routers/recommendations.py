# app/api/routers/recommendations.py
from datetime import datetime, timezone
from typing import Optional, List, Callable, Dict, Any
from uuid import UUID
import json
import logging
import time

from fastapi import APIRouter, Depends, Query, Path, Body, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_redis, get_curriculum_client, get_progress_client
from app.core.settings import settings
from app.security.authz import require_public_roles, require_internal, AuthContext
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
    advisor_reco_cache_total,
    advisor_reco_invalidate_total,
)
from app.core.rate_limit import rate_limit

router = APIRouter(prefix="/api/ai", tags=["recommendations"])
logger = logging.getLogger(__name__)


# ---------------- Claves de caché / índices / recientes ----------------

def _cache_key(
    student_id: UUID,
    limit: int,
    subject: Optional[str],
    objective_id: Optional[UUID],
) -> str:
    subj = (subject or "any").lower()
    obj = str(objective_id) if objective_id else "any"
    # Puedes versionar el contrato si cambias estructura
    return f"reco:v1:{student_id}:{subj}:{obj}:limit{limit}"


def _index_key(student_id: UUID) -> str:
    return f"reco:index:{student_id}"


def _recent_key(student_id: UUID) -> str:
    # ZSET con score = epoch seconds del OPEN
    return f"reco:recent:{student_id}"


def _build_payload(items: List[RecommendationItem]) -> dict:
    return {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "items": [i.model_dump() for i in items],
    }


def _update_reco_index(rdb, student_id: UUID, payload: Dict[str, Any]) -> None:
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
            rdb.hset(key, mapping=mapping)
            rdb.expire(key, int(getattr(settings, "RECO_CACHE_TTL_SECONDS", 300)))
    except Exception as e:
        logger.warning("No se pudo actualizar índice de recos en Redis: %s", e)


def _get_or_set_cache(
    rdb,
    key: str,
    compute_fn: Callable[[], Dict[str, Any]],
    *,

    student_id: Optional[UUID] = None,
) -> dict:
    if rdb:
        try:
            raw = rdb.get(key)
            if raw:
                data = json.loads(raw)
                if student_id:
                    _update_reco_index(rdb, student_id, data)
                if isinstance(data, dict) and "items" in data:
                    advisor_reco_cache_total.labels(result="hit").inc()
                    return data
        except Exception:
            advisor_reco_cache_total.labels(result="error").inc()

    data = compute_fn()

    if rdb:
        try:
            ttl = int(getattr(settings, "RECO_CACHE_TTL_SECONDS", 300))
            rdb.setex(key, ttl, json.dumps(data))
            advisor_reco_cache_total.labels(result="miss").inc()
        except Exception:
            advisor_reco_cache_total.labels(result="error").inc()
        if student_id:
            _update_reco_index(rdb, student_id, data)

    return data


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
                rdb=rdb,  # ✅ para exclusión de “recientes”
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
                rdb=rdb,
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
                rdb=rdb,
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


# ---------------- CTR / eventos / impresiones ----------------

@router.post(
    "/recommendations/events",
    status_code=204,
    summary="Ingesta de eventos de interacción con recomendaciones (CTR)",
)
def post_reco_event(
    evt: RecoEventIn = Body(...),
    ctx: AuthContext = Depends(require_public_roles("ROLE_STUDENT")),
    rdb=Depends(get_redis),
):
    student_uuid = parse_principal_uuid_or_forbid(ctx.principal)

    advisor_reco_events_total.labels(event=evt.event).inc()

    # Resolver dificultad desde índice si FE no la mandó
    difficulty = None
    if evt.difficulty:
        difficulty = str(evt.difficulty).upper().strip()
    else:
        try:
            d = rdb.hget(_index_key(student_uuid), str(evt.exerciseId)) if rdb else None
            if d:
                dd = str(d).upper().strip()
                difficulty = dd if dd in {"EASY", "MEDIUM", "HARD"} else "UNK"
        except Exception:
            difficulty = "UNK"

    # Contabilizamos CTR para OPEN y guardamos “reciente”
    if evt.event == "OPEN":
        advisor_reco_click_total.labels(difficulty=(difficulty or "UNK"), source="AI_RECO").inc()
        if rdb:
            try:
                now = int(time.time())
                rkey = _recent_key(student_uuid)
                rdb.zadd(rkey, {str(evt.exerciseId): now})
                # mantener ventana y tamaño máximos
                rdb.expire(rkey, 60 * 60 * max(24, settings.RECENT_EXCLUDE_HOURS * 2))
                # trimming aproximado (por si crece demasiado)
                rdb.zremrangebyrank(rkey, 0, -1 * (settings.RECENT_MAX + 1))
            except Exception as e:
                logger.warning("RECENT_ZSET_UPDATE_FAIL: %s", e)

    return


@router.post(
    "/recommendations/impressions",
    status_code=204,
    summary="[Opcional] Registrar impresiones de recos (para CTR real)",
)
def post_reco_impression(
    placement: str = Query("panel", description="panel|strip"),
    ctx: AuthContext = Depends(require_public_roles("ROLE_STUDENT")),
):
    advisor_reco_events_total.labels(event="IMPRESSION").inc()
    return


# ✅ Invalidación interna (para progress-service/diagnóstico)
@router.post(
    "/internal/recommendations/invalidate",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="[INTERNAL] Invalida caché de recos para un estudiante",
)
def invalidate_recommendations_internal(
    studentId: UUID = Query(..., alias="studentId"),
    ctx: AuthContext = Depends(require_internal("ROLE_INTERNAL")),
    rdb=Depends(get_redis),
):
    """
    Endpoint interno para invalidar el caché de recomendaciones de un estudiante.
    Lo llama progress-service cuando persiste un Attempt (AttemptPersistedEvent).
    """
    if not rdb:
        return

    try:
        pattern = f"reco:v1:{studentId}:*"
        cur = 0
        while True:
            cur, keys = rdb.scan(cur, match=pattern, count=100)
            if keys:
                rdb.delete(*keys)
            if cur == 0:
                break

        # índice también
        rdb.delete(_index_key(studentId))
        advisor_reco_invalidate_total.labels(source="progress").inc()

        logger.info(
            "RECO_CACHE_INVALIDATED studentId=%s by=%s roles=%s",
            str(studentId),
            ctx.principal,
            ctx.roles,
        )
    except Exception as e:
        logger.warning("RECO_INVALIDATE_FAIL: studentId=%s err=%s", str(studentId), e)

    return
