from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional, List, Dict, Any, Tuple
from uuid import UUID

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.ml.features import build_diagnostic_features
from app.ml.model_registry import classify_level
from app.models.signals import StudentLevelHistory
from app.schemas.recommendations import RecommendationItem
from app.services.clients.curriculum_client import CurriculumClient


# ---------------- util tiempo ----------------
def _now_utc() -> datetime:
    return datetime.now(timezone.utc)

def _days_since(dt: Optional[datetime]) -> float:
    if not dt:
        return 365.0
    delta = _now_utc() - dt
    return max(delta.total_seconds() / 86_400.0, 0.0)


# ---------------- prioridad por objetivo ----------------
def _score_objective(attempts: int, corrects: int, last_attempt_at: Optional[datetime]) -> float:
    correct_rate = (corrects / attempts) if attempts > 0 else 0.0
    mastery_penalty = 1.0 - correct_rate
    age_norm = min(_days_since(last_attempt_at) / 14.0, 1.0)
    base = 0.7 * mastery_penalty + 0.3 * age_norm
    if attempts > 0:
        base = min(base + 0.05, 1.0)
    return base

def _difficulty_from_stats(attempts: int, corrects: int) -> str:
    if attempts <= 0:
        return "EASY"
    acc = (corrects / attempts) if attempts > 0 else 0.0
    if acc < 0.5:
        return "EASY"
    if acc < 0.8:
        return "MEDIUM"
    return "HARD"

def _reason_from_stats(attempts: int, corrects: int, last_attempt_at: Optional[datetime]) -> str:
    cr = (corrects / attempts) if attempts > 0 else 0.0
    if attempts == 0:
        return "Sin historial suficiente: proponemos iniciar con objetivos base."
    if cr < 0.5:
        return "Refuerzo recomendado por bajo índice de aciertos recientes."
    if _days_since(last_attempt_at) > 7:
        return "Reactivación espaciada: retomar este objetivo tras varios días."
    return "Oportunidad de consolidación según tu progreso."


# ---------------- ML para RAG (sin cambios) ----------------
def _rag_to_score(distance: Optional[float]) -> float:
    if distance is None:
        return 0.5
    d = float(distance)
    if d < 0:
        d = 0.0
    return 1.0 / (1.0 + d)

def rank_with_ml(
    db: Session,
    *,
    rag_items: List[Dict[str, Any]],
    student_id: Optional[str],
    weights: Dict[str, float] = None
) -> List[Dict[str, Any]]:
    if not rag_items:
        return []
    weights = weights or {"rag": 0.6, "ml": 0.4}

    level = None
    probs = None
    model_version = None
    if student_id:
        feats = build_diagnostic_features(db, student_id=student_id, window_start=None, window_end=None)
        lvl, pr, ver = classify_level(feats)
        level, probs, model_version = lvl, pr, ver

    out: List[Dict[str, Any]] = []
    for it in rag_items:
        rag_score = _rag_to_score(it.get("distance"))
        diff = (it.get("meta") or {}).get("difficulty", "MEDIUM")
        diff_u = str(diff).upper()

        ml_score = 0.5
        if level is not None:
            if level == 1:
                ml_score = 0.8 if diff_u == "EASY" else (0.5 if diff_u == "MEDIUM" else 0.2)
            elif level == 2:
                ml_score = 0.6 if diff_u == "MEDIUM" else (0.4 if diff_u == "EASY" else 0.5)
            else:
                ml_score = 0.75 if diff_u == "HARD" else (0.6 if diff_u == "MEDIUM" else 0.3)

        final = weights["rag"] * rag_score + weights["ml"] * ml_score
        reasons = []
        if level is not None:
            reasons.append(f"Nivel estimado: {level}.")
        reasons.append(f"Dificultad del recurso: {diff_u}.")
        reasons.append(f"RAG: {rag_score:.2f} • ML: {ml_score:.2f} • Final: {final:.2f}")

        out.append({
            **it,
            "ragScore": float(rag_score),
            "mlScore": float(ml_score),
            "finalScore": float(final),
            "reasons": reasons,
            "mlMeta": {"level": level, "probs": probs, "modelVersion": model_version} if level is not None else None
        })

    out.sort(key=lambda x: x["finalScore"], reverse=True)
    return out


# ---------------- dificultad combinada (stats + RF) ----------------
def _choose_difficulty(stats_diff: str, rf_level: Optional[int]) -> str:
    s = (stats_diff or "MEDIUM").upper()
    if s == "EASY":
        return "EASY"
    if rf_level is None:
        return s

    if s == "MEDIUM":
        if rf_level == 1:
            return "MEDIUM"
        if rf_level == 2:
            return "MEDIUM"
        return "HARD"  # nivel 3: subimos un poco
    # s == "HARD"
    if rf_level == 1:
        return "MEDIUM"  # bajamos
    if rf_level == 2:
        return "HARD"
    return "HARD"


def _pick_exercise_candidate_for_objective(
    db: Session,
    client: CurriculumClient,
    objective_id: UUID,
    desired_diff: Optional[str]
) -> Optional[UUID]:
    """
    1) Intenta con difficulty = desired_diff
    2) Si no hay, intenta sin difficulty (fallback)
    Devuelve exerciseId o None.
    """
    # primer intento: con filtro de dificultad
    try:
        if desired_diff:
            items = client.get_exercises_for_objective(
                objective_id=str(objective_id),   # <-- asegura str
                limit=1,
                random=False,
                active=True,
                difficulty=desired_diff,          # EASY|MEDIUM|HARD
                order="desc",
            ) or []
            arr = items if isinstance(items, list) else (items.get("items") or [])
            if arr and arr[0].get("exerciseId"):
                return UUID(str(arr[0]["exerciseId"]))
    except Exception:
        pass

    # fallback: sin filtro
    try:
        items = client.get_exercises_for_objective(
            objective_id=str(objective_id),       # <-- asegura str
            limit=1,
            random=False,
            active=True,
            difficulty=None,
            order="desc",
        ) or []
        arr = items if isinstance(items, list) else (items.get("items") or [])
        if arr and arr[0].get("exerciseId"):
            return UUID(str(arr[0]["exerciseId"]))
    except Exception:
        pass

    return None


# ---------------- recomendaciones por objetivo ----------------
def recommend_for_student(
    db: Session,
    *,
    student_id: UUID,
    limit: int = 8,
    subject: Optional[str] = None,       # reservado para futuro
    objective_id: Optional[UUID] = None, # limita a un objetivo concreto (opcional)
    curriculum_client: Optional[CurriculumClient] = None,
) -> List[RecommendationItem]:
    params = {"sid": str(student_id)}
    where = "WHERE student_id = :sid"
    if objective_id:
        where += " AND objective_id = :oid"
        params["oid"] = str(objective_id)

    rows = db.execute(
        text(f"""
            SELECT objective_id, attempts, corrects, avg_score, last_attempt_at, streak
            FROM student_objective_stats
            {where}
        """),
        params,
    ).mappings().all()

    # nivel RF (global) para modular dificultad
    level = None
    try:
        feats = build_diagnostic_features(db, student_id=str(student_id), window_start=None, window_end=None)
        lvl, _pr, _ver = classify_level(feats)
        level = int(lvl)
    except Exception:
        level = None

    candidates: List[Tuple[UUID, float, int, int, Optional[datetime]]] = []
    for r in rows:
        obj = r["objective_id"]
        attempts = int(r["attempts"] or 0)
        corrects = int(r["corrects"] or 0)
        last_at = r["last_attempt_at"]
        score = _score_objective(attempts, corrects, last_at)
        candidates.append((obj, score, attempts, corrects, last_at))

    candidates.sort(key=lambda x: x[1], reverse=True)

    picked: List[RecommendationItem] = []
    client = curriculum_client
    for obj, score, attempts, corrects, last_at in candidates:
        if len(picked) >= limit:
            break

        stats_diff = _difficulty_from_stats(attempts, corrects)
        desired_diff = _choose_difficulty(stats_diff, level)

        ex_id = None
        if client:
            ex_id = _pick_exercise_candidate_for_objective(db, client, obj, desired_diff)
        if not ex_id:
            continue

        picked.append(
            RecommendationItem(
                objectiveId=obj,
                exerciseId=ex_id,
                score=round(float(score), 4),
                confidence=None,
                reason=_reason_from_stats(attempts, corrects, last_at),
                source="HEURISTIC",
                difficulty=desired_diff,  # <-- lo que mostramos: combinación stats + RF
                citations=[],
            )
        )

    return picked


# ---------------- persistencia nivel ----------------
def commit_student_level(db: Session, student_id: str, phase: str,
                         window_start: datetime | None,
                         window_end: datetime | None,
                         force: bool = False) -> dict:
    phase = (phase or "INITIAL").upper()
    if phase not in {"INITIAL", "MID", "FINAL"}:
        raise ValueError("phase debe ser INITIAL|MID|FINAL")

    exist = db.query(StudentLevelHistory).filter_by(student_id=student_id, phase=phase).one_or_none()
    if exist and not force:
        return {
            "studentId": student_id,
            "phase": phase,
            "level": exist.level,
            "modelVersion": exist.model_version,
            "alreadyExisted": True
        }

    feats = build_diagnostic_features(db, student_id, window_start, window_end)
    level, probs, model_version = classify_level(feats)

    now = datetime.now(timezone.utc)
    if exist:
        exist.level = level
        exist.probs = probs
        exist.features = feats
        exist.model_version = model_version
        exist.snapshot_at = now
    else:
        rec = StudentLevelHistory(
            student_id=student_id,
            phase=phase,
            snapshot_at=now,
            level=level,
            probs=probs,
            features=feats,
            model_version=model_version,
            created_at=now,
        )
        db.add(rec)

    db.flush()
    return {
        "studentId": student_id,
        "phase": phase,
        "level": level,
        "probs": probs,
        "modelVersion": model_version,
        "alreadyExisted": bool(exist)
    }
