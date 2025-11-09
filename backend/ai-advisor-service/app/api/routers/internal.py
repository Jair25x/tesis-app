# app/api/routers/internal.py
import json
import logging
import hashlib
from datetime import datetime, timezone
from typing import Any, Optional
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, Response, status, HTTPException, Body
from pydantic import ValidationError
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.deps import get_session
from app.schemas.internal_events import AdvisorAttemptEvent
from app.security.authz import require_internal
from app.observability.metrics import observe_latency, advisor_reco_latency_seconds

router = APIRouter(tags=["internal"])
log = logging.getLogger("uvicorn.error")

UPSERT_EVENT_SQL = text(
    """
    INSERT INTO advisor_events (id, submission_item_id, payload)
    VALUES (:id, :submission_item_id, CAST(:payload AS JSONB))
    ON CONFLICT (submission_item_id) DO NOTHING
    """
)

UPSERT_STATS_SQL = text(
    """
    INSERT INTO student_objective_stats
        (student_id, objective_id,
         attempts, corrects, avg_score, last_attempt_at, streak,
         attempts_easy, attempts_medium, attempts_hard,
         corrects_easy, corrects_medium, corrects_hard)
    VALUES
        (:student_id, :objective_id,
         1, :correct_inc, :score, now(), :streak_init,
         CASE WHEN :diff = 'EASY'   THEN 1 ELSE 0 END,
         CASE WHEN :diff = 'MEDIUM' THEN 1 ELSE 0 END,
         CASE WHEN :diff = 'HARD'   THEN 1 ELSE 0 END,
         CASE WHEN :diff = 'EASY'   THEN :correct_inc ELSE 0 END,
         CASE WHEN :diff = 'MEDIUM' THEN :correct_inc ELSE 0 END,
         CASE WHEN :diff = 'HARD'   THEN :correct_inc ELSE 0 END)
    ON CONFLICT (student_id, objective_id)
    DO UPDATE SET
        attempts = student_objective_stats.attempts + 1,
        corrects = student_objective_stats.corrects + EXCLUDED.corrects,
        avg_score = CASE
            WHEN EXCLUDED.avg_score IS NULL THEN student_objective_stats.avg_score
            WHEN student_objective_stats.avg_score IS NULL THEN EXCLUDED.avg_score
            ELSE ROUND( (student_objective_stats.avg_score * student_objective_stats.attempts + EXCLUDED.avg_score)
                        / (student_objective_stats.attempts + 1), 3 )
        END,
        last_attempt_at = now(),
        streak = CASE
            WHEN EXCLUDED.corrects = 1 THEN student_objective_stats.streak + 1
            ELSE 0
        END,
        attempts_easy   = student_objective_stats.attempts_easy   + EXCLUDED.attempts_easy,
        attempts_medium = student_objective_stats.attempts_medium + EXCLUDED.attempts_medium,
        attempts_hard   = student_objective_stats.attempts_hard   + EXCLUDED.attempts_hard,
        corrects_easy   = student_objective_stats.corrects_easy   + EXCLUDED.corrects_easy,
        corrects_medium = student_objective_stats.corrects_medium + EXCLUDED.corrects_medium,
        corrects_hard   = student_objective_stats.corrects_hard   + EXCLUDED.corrects_hard
    """
)

def _parse_answered_at(s: Optional[str]) -> str:
    if not s or not str(s).strip():
        return datetime.now(timezone.utc).isoformat()
    try:
        return datetime.fromisoformat(str(s).replace("Z", "+00:00")).astimezone(timezone.utc).isoformat()
    except Exception:
        return datetime.now(timezone.utc).isoformat()

def _deterministic_uuid_like_java_nameuuidfrombytes(name: str) -> str:
    md5 = hashlib.md5(name.encode("utf-8")).digest()
    b = bytearray(md5)
    b[6] = (b[6] & 0x0F) | 0x30  # version 3
    b[8] = (b[8] & 0x3F) | 0x80  # IETF variant
    return str(UUID(bytes=bytes(b)))

def _get_assignment_id(evt: AdvisorAttemptEvent) -> Optional[str]:
    if evt.assignmentId:
        return str(evt.assignmentId)
    if evt.metadata and evt.metadata.get("assignmentId"):
        return str(evt.metadata["assignmentId"])
    return None

def _extract_difficulty(evt: AdvisorAttemptEvent) -> Optional[str]:
    raw = None
    if hasattr(evt, "difficulty") and evt.difficulty:
        raw = str(evt.difficulty)
    elif evt.metadata and evt.metadata.get("difficulty"):
        raw = str(evt.metadata["difficulty"])
    if not raw:
        return None
    x = raw.strip().upper()
    if x in {"EASY", "MEDIUM", "HARD"}:
        return x
    if x in {"E", "EASY_PEASY"}:
        return "EASY"
    if x in {"M", "MID", "NORMAL"}:
        return "MEDIUM"
    if x in {"H", "DIFICIL", "HARDCORE"}:
        return "HARD"
    return None

def _get_or_make_submission_item_id(evt: AdvisorAttemptEvent) -> str:
    if evt.submissionItemId:
        return str(evt.submissionItemId)
    if evt.metadata and evt.metadata.get("submissionItemId"):
        sid_val = str(evt.metadata["submissionItemId"]).strip()
        if sid_val:
            return sid_val
    key = "|".join([
        _get_assignment_id(evt) or "",
        str(evt.studentId or ""),
        str(evt.exerciseId or ""),
        str(evt.objectiveId or ""),
    ])
    return _deterministic_uuid_like_java_nameuuidfrombytes("advisor-sid:" + key)

def _record_event(conn: Session, submission_item_id: str, payload: dict[str, Any]) -> bool:
    r = conn.execute(
        UPSERT_EVENT_SQL,
        {"id": str(uuid4()), "submission_item_id": submission_item_id, "payload": json.dumps(payload)},
    )
    return (r.rowcount or 0) > 0

def _upsert_stats(conn: Session, evt: AdvisorAttemptEvent) -> None:
    correct_inc = 1 if (evt.correct is True) else 0
    score_val = float(evt.score) if (evt.score is not None) else None
    streak_init = 1 if correct_inc == 1 else 0
    objective = str(evt.objectiveId or evt.curriculumId)
    diff = _extract_difficulty(evt)
    conn.execute(
        UPSERT_STATS_SQL,
        {
            "student_id": str(evt.studentId),
            "objective_id": objective,
            "correct_inc": correct_inc,
            "score": score_val,
            "streak_init": streak_init,
            "diff": diff,
        },
    )

def _handle_attempt_event(conn: Session, evt: AdvisorAttemptEvent) -> None:
    payload = evt.model_dump(mode="json")
    payload["answeredAt"] = _parse_answered_at(payload.get("answeredAt"))
    submission_item_id = _get_or_make_submission_item_id(evt)
    inserted = _record_event(conn, submission_item_id, payload=payload)
    if not inserted:
        log.info(
            "duplicate_submission_item_ignored",
            extra={
                "submission_item_id": submission_item_id,
                "student_id": str(evt.studentId) if evt.studentId else None,
                "exercise_id": str(evt.exerciseId) if evt.exerciseId else None,
                "objective_id": str(evt.objectiveId or evt.curriculumId) if (evt.objectiveId or evt.curriculumId) else None,
            },
        )
        return
    _upsert_stats(conn, evt)

@router.post(
    "/internal/advisor/attempts",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_internal("ROLE_INTERNAL"))],
)
def advisor_attempts(body: dict = Body(...), db: Session = Depends(get_session)) -> Response:
    with observe_latency(advisor_reco_latency_seconds):
        try:
            evt = AdvisorAttemptEvent.model_validate(body)
        except ValidationError as e:
            log.warning("bad_attempt_event: errors=%s body=%s", e.errors(), body)
            raise HTTPException(status_code=422, detail=e.errors())
        _handle_attempt_event(db, evt)
        db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.post(
    "/internal/advisor/graded",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_internal("ROLE_INTERNAL"))],
)
def advisor_graded(body: dict = Body(...), db: Session = Depends(get_session)) -> Response:
    return advisor_attempts(body, db)

@router.post(
    "/internal/ingest/assessments/attempts",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_internal("ROLE_INTERNAL"))],
)
def ingest_attempts_alias(body: dict = Body(...), db: Session = Depends(get_session)) -> Response:
    return advisor_attempts(body, db)

@router.post(
    "/internal/ingest/assessments/graded",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_internal("ROLE_INTERNAL"))],
)
def ingest_graded_alias(body: dict = Body(...), db: Session = Depends(get_session)) -> Response:
    with observe_latency(advisor_reco_latency_seconds):
        if isinstance(body, dict) and body.get("type") == "AssessmentGraded" and "payload" in body:
            payload = body["payload"] or {}
            common = {
                "assignmentId": payload.get("assignmentId"),
                "assignmentType": payload.get("assignmentType"),
                "studentId": payload.get("studentId"),
                "classroomId": payload.get("classroomId"),
                "curriculumId": payload.get("curriculumId"),
            }
            item_results = payload.get("itemResults") or []
            for it in item_results:
                merged = {**common, **it}
                try:
                    evt = AdvisorAttemptEvent.model_validate(merged)
                except ValidationError as e:
                    log.warning("bad_attempt_event_from_envelope: errors=%s item=%s", e.errors(), it)
                    raise HTTPException(status_code=422, detail=e.errors())
                _handle_attempt_event(db, evt)
            db.commit()
            return Response(status_code=status.HTTP_204_NO_CONTENT)

        try:
            evt = AdvisorAttemptEvent.model_validate(body)
        except ValidationError as e:
            log.warning("bad_attempt_event: errors=%s body=%s", e.errors(), body)
            raise HTTPException(status_code=422, detail=e.errors())

        _handle_attempt_event(db, evt)
        db.commit()
        return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.post(
    "/internal/events/ingest-batch",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(require_internal("ROLE_INTERNAL"))],
)
def ingest_events_batch(body: dict = Body(...), db: Session = Depends(get_session)):
    evs = body.get("events") or []
    if not isinstance(evs, list) or not evs:
        raise HTTPException(status_code=400, detail="Proporciona lista 'events'")
    inserted = 0
    for raw in evs:
        try:
            evt = AdvisorAttemptEvent.model_validate(raw)
        except ValidationError:
            continue
        _handle_attempt_event(db, evt)
        inserted += 1
    db.commit()
    return {"received": len(evs), "processed": inserted}
