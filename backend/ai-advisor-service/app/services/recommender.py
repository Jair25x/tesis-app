# app/services/recommender.py
from __future__ import annotations

from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any, Tuple
from uuid import UUID

from sqlalchemy import text
from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import insert as pg_insert

from app.ml.features import build_diagnostic_features
from app.ml.model_registry import classify_level
from app.models.signals import StudentLevelHistory
from app.schemas.recommendations import RecommendationItem
from app.services.clients.curriculum_client import CurriculumClient
from app.services.clients.progress_client import ProgressClient
from app.core.settings import settings
from app.observability.metrics import (
    advisor_progress_batch_seconds,
    advisor_reason_enrich_total,
    advisor_reco_recent_skips_total,
)

# ---------------- util tiempo ----------------
def _now_utc() -> datetime:
    return datetime.now(timezone.utc)

def _days_since(dt: Optional[datetime]) -> float:
    if not dt:
        return 365.0
    delta = _now_utc() - dt
    return max(delta.total_seconds() / 86_400.0, 0.0)

def _parse_iso8601(value: Optional[str]) -> Optional[datetime]:
    if not value:
        return None
    try:
        s = str(value).strip()
        if s.endswith("Z"):
            s = s[:-1] + "+00:00"
        return datetime.fromisoformat(s)
    except Exception:
        return None

def _fmt_pct(p: float) -> str:
    if p <= 0:
        return "0%"
    if p >= 1:
        return "100%"
    num = p * 100.0
    return f"{num:.0f}%" if abs(num - round(num)) < 0.05 else f"{num:.1f}%"


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


# ---------------- fase del estudiante ----------------
def _latest_phase(db: Session, student_id: str) -> Optional[str]:
    """
    Devuelve la fase más reciente registrada (INITIAL|MID|FINAL).
    """
    row = db.execute(
        text("""
            SELECT phase
            FROM student_level_history
            WHERE student_id = :sid
            ORDER BY snapshot_at DESC
            LIMIT 1
        """),
        {"sid": student_id},
    ).mappings().first()
    if not row:
        return None
    p = str(row["phase"] or "").upper()
    return p if p in {"INITIAL", "MID", "FINAL"} else None


def _phase_aware_difficulty(stats_diff: str,
                            rf_level: Optional[int],
                            phase: Optional[str],
                            attempts: int,
                            corrects: int) -> str:
    """
    Mezcla por fase:
      - INITIAL: 70% EASY, 30% MEDIUM
      - MID:     20% EASY, 60% MEDIUM, 20% HARD (HARD si acc >= 0.8 y algo de racha)
      - FINAL:   10% EASY, 40% MEDIUM, 50% HARD (evita HARD si acc < 0.3)
    """
    # base: combinación RF + stats
    base = _choose_difficulty(stats_diff, rf_level)
    acc = (corrects / attempts) if attempts > 0 else 0.0

    phase = (phase or "").upper()
    if phase == "INITIAL":
        # No forzar HARD en inicial; privilegia EASY/MEDIUM
        if base == "HARD":
            return "MEDIUM"
        return "EASY" if base == "EASY" else "MEDIUM"

    if phase == "MID":
        # Permite HARD solo si ya muestra buen desempeño
        if base == "HARD" and acc >= 0.8:
            return "HARD"
        if base == "EASY" and acc >= 0.7:
            return "MEDIUM"
        return base

    if phase == "FINAL":
        # Empuja a HARD salvo que la accuracy sea muy baja
        if acc < 0.3 and base == "HARD":
            return "MEDIUM"
        # Si base <= MEDIUM y acc >= 0.7, eleva a HARD
        if base != "HARD" and acc >= 0.7:
            return "HARD"
        return base

    # Sin fase -> comportamiento actual
    return base


# ---------------- ML para RAG (sin cambios funcionales) ----------------
def _rag_to_score(distance: Optional[float]) -> float:
    if distance is None:
        return 0.5
    d = float(distance)
    if d < 0:
        d = 0.0
    return 1.0 / (1.0 + d)

# (rank_with_ml sin cambios; lo omitimos por brevedad de parche)


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
        return "HARD"
    # s == "HARD"
    if rf_level == 1:
        return "MEDIUM"
    if rf_level == 2:
        return "HARD"
    return "HARD"


# ---------------- “recientes” helpers (exclusión) ----------------
def _is_recent(rdb, student_id: UUID, exercise_id: UUID) -> bool:
    """
    Devuelve True si el exercise fue abierto en la ventana de exclusión.
    """
    if not rdb:
        return False
    try:
        zkey = f"reco:recent:{student_id}"
        # score es epoch secs
        score = rdb.zscore(zkey, str(exercise_id))
        if score is None:
            return False
        # dentro de las últimas RECENT_EXCLUDE_HOURS horas
        age_secs = max(0, int(datetime.now(timezone.utc).timestamp()) - int(score))
        return age_secs < settings.RECENT_EXCLUDE_HOURS * 3600
    except Exception:
        return False


def _pick_exercise_candidate_for_objective(
    db: Session,
    client: CurriculumClient,
    objective_id: UUID,
    desired_diff: Optional[str],
    *,
    rdb=None,
    student_id: Optional[UUID] = None,
) -> Optional[UUID]:
    """
    Pide un pequeño batch y filtra el primero que no esté en “recientes”.
    """
    # 1) intenta con dificultad pedida
    for attempt in (("with_diff", desired_diff), ("fallback", None)):
        try:
            diff = attempt[1]
            items = client.get_exercises_for_objective(
                objective_id=str(objective_id),
                limit=5,           # ✅ pedimos algunos para poder filtrar
                random=False,
                active=True,
                difficulty=diff,
                order="desc",
            ) or []
            arr = items if isinstance(items, list) else (items.get("items") or [])
            # convierte a lista de UUIDs
            candidates: List[UUID] = []
            for it in arr:
                exid = it.get("exerciseId") or it.get("id")
                if exid:
                    try:
                        candidates.append(UUID(str(exid)))
                    except Exception:
                        continue

            # filtra por “recientes”
            for ex in candidates:
                if student_id and _is_recent(rdb, student_id, ex):
                    advisor_reco_recent_skips_total.inc()
                    continue
                return ex
        except Exception:
            continue

    return None


# ---------------- builder de reason enriquecido ----------------
def _build_reason(
    *,
    attempts_total: int,
    corrects_total: int,
    last_attempt_at: Optional[datetime],
    desired_diff: str,
    enriched: Optional[Dict[str, Any]] = None
) -> str:
    parts: List[str] = []

    if enriched:
        try:
            att7 = int(enriched.get("attempts7d") or 0)
            cor7 = int(enriched.get("correct7d") or 0)
            wr7 = float(enriched.get("winRate7d") or 0.0)
        except Exception:
            att7, cor7, wr7 = 0, 0, 0.0

        if att7 > 0:
            parts.append(f"Últimos 7 días: {cor7}/{att7} aciertos ({_fmt_pct(wr7)}).")

        last_str = enriched.get("lastAttemptAt")
        last = _parse_iso8601(str(last_str)) if last_str else last_attempt_at
        if last:
            d = _days_since(last)
            if d < 0.5:
                parts.append("Último intento: hoy.")
            elif d < 1.5:
                parts.append("Último intento: hace 1 día.")
            else:
                parts.append(f"Último intento: hace {int(round(d))} días.")

    if not parts:
        if attempts_total <= 0:
            parts.append("Sin historial reciente: empecemos por la base.")
        else:
            rate = (corrects_total / attempts_total) if attempts_total > 0 else 0.0
            parts.append(f"Histórico: {corrects_total}/{attempts_total} ({_fmt_pct(rate)}).")
            if rate < 0.5:
                parts.append("Refuerzo recomendado (baja precisión).")
            else:
                parts.append("Oportunidad de consolidación.")

    parts.append(f"Sugerencia: nivel {str(desired_diff).upper()}.")
    return " ".join(parts)


# ---------------- recomendaciones por objetivo ----------------
def recommend_for_student(
    db: Session,
    *,
    student_id: UUID,
    limit: int = 8,
    subject: Optional[str] = None,
    objective_id: Optional[UUID] = None,
    curriculum_client: Optional[CurriculumClient] = None,
    progress_client: Optional[ProgressClient] = None,
    rdb=None,
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

    # nivel RF (global)
    level: Optional[int] = None
    try:
        feats = build_diagnostic_features(db, student_id=str(student_id), window_start=None, window_end=None)
        lvl, _pr, _ver = classify_level(feats)
        level = int(lvl)
    except Exception:
        level = None

    # fase actual (INITIAL | MID | FINAL)
    phase = _latest_phase(db, str(student_id))

    candidates: List[Tuple[UUID, float, int, int, Optional[datetime]]] = []
    for r in rows:
        obj = r["objective_id"]
        attempts = int(r["attempts"] or 0)
        corrects = int(r["corrects"] or 0)
        last_at = r["last_attempt_at"]
        score = _score_objective(attempts, corrects, last_at)
        candidates.append((obj, score, attempts, corrects, last_at))

    candidates.sort(key=lambda x: x[1], reverse=True)

    # Enriquecer top candidatos con Progress (batch)
    stats_by_obj: Dict[str, Dict[str, Any]] = {}
    if progress_client and candidates:
        top_ids = [str(c[0]) for c in candidates[: max(limit * 3, limit)]]
        try:
            with advisor_progress_batch_seconds.time():
                arr = progress_client.get_objective_stats_batch(str(student_id), top_ids) or []
            for item in arr:
                oid = str(item.get("objectiveId"))
                if oid:
                    stats_by_obj[oid] = item
            advisor_reason_enrich_total.labels(result="hit" if stats_by_obj else "miss").inc()
        except Exception:
            advisor_reason_enrich_total.labels(result="error").inc()
            stats_by_obj = {}

    picked: List[RecommendationItem] = []
    client = curriculum_client
    for obj, base_score, attempts, corrects, last_at in candidates:
        if len(picked) >= limit:
            break

        stats_diff = _difficulty_from_stats(attempts, corrects)
        desired_diff = _phase_aware_difficulty(stats_diff, level, phase, attempts, corrects)

        ex_id = None
        if client:
            ex_id = _pick_exercise_candidate_for_objective(
                db, client, obj, desired_diff, rdb=rdb, student_id=student_id
            )
        if not ex_id:
            continue

        enr = stats_by_obj.get(str(obj))
        reason = _build_reason(
            attempts_total=attempts,
            corrects_total=corrects,
            last_attempt_at=last_at,
            desired_diff=desired_diff,
            enriched=enr,
        )

        picked.append(
            RecommendationItem(
                objectiveId=obj,
                exerciseId=ex_id,
                score=round(float(base_score), 4),
                confidence=None,
                reason=reason,
                source="HEURISTIC",
                difficulty=desired_diff,
                citations=[],
            )
        )

    return picked

def _normalize_phase(phase: Optional[str]) -> str:
    p = (phase or "").strip().upper()
    if p not in {"INITIAL", "MID", "FINAL"}:
        raise ValueError(f"phase inválido: {phase!r} (esperado: INITIAL|MID|FINAL)")
    return p

def _upsert_student_level(
    db: Session,
    *,
    student_id: str,
    phase: str,
    level: int,
    probs: Optional[Dict[str, float]] = None,
    features: Optional[Dict[str, Any]] = None,
    model_version: Optional[str] = None,
) -> None:
    """
    UPSERT en student_level_history por (student_id, phase).
    Actualiza: level, probs, features, model_version, snapshot_at=now().
    """
    tbl = StudentLevelHistory.__table__
    stmt = pg_insert(tbl).values(
        student_id=student_id,
        phase=phase,
        level=level,
        probs=probs or {},
        features=features or {},
        model_version=model_version,
        # snapshot_at se setea en el UPDATE para todas las actualizaciones
    )
    stmt = stmt.on_conflict_do_update(
        index_elements=["student_id", "phase"],
        set_={
            "level": stmt.excluded.level,
            "probs": stmt.excluded.probs,
            "features": stmt.excluded.features,
            "model_version": stmt.excluded.model_version,
            "snapshot_at": text("now() at time zone 'utc'"),
        },
    )
    db.execute(stmt)

def commit_student_level(
    db: Session,
    *,
    student_id: str,
    phase: str,
    window_start: Optional[datetime] = None,
    window_end: Optional[datetime] = None,
    force: bool = False,
) -> Dict[str, Any]:
    """
    Calcula nivel RF + probabilidades a partir de features (ventana opcional),
    y hace UPSERT en student_level_history para la fase dada.

    Devuelve un resumen útil para la API.
    """
    phase_norm = _normalize_phase(phase)

    # 1) Construye features en la ventana (si se provee)
    #    build_diagnostic_features admite window_start/window_end=None (todo histórico)
    feats = build_diagnostic_features(
        db,
        student_id=str(student_id),
        window_start=window_start,
        window_end=window_end,
    )

    # 2) Clasifica nivel con tu RF
    #    Nota: según tu uso previo, classify_level(feats) devuelve (lvl, probs, version)
    lvl, probs, model_ver = None, None, None
    try:
        lvl, probs, model_ver = classify_level(feats)
        lvl = int(lvl)
        # Normaliza probs a dict[str,float]
        if isinstance(probs, dict):
            # ok
            pass
        elif probs is not None:
            # intenta convertir listas/tuplas tipo [p1,p2,p3] -> {"1":..., "2":..., "3":...}
            try:
                probs = {str(i + 1): float(p) for i, p in enumerate(probs)}
            except Exception:
                probs = None
    except Exception:
        # En caso extremo, fija baseline.
        lvl, probs, model_ver = 1, {"1": 1.0, "2": 0.0, "3": 0.0}, "rf-baseline"

    # 3) UPSERT del snapshot para esa fase
    _upsert_student_level(
        db,
        student_id=str(student_id),
        phase=phase_norm,
        level=int(lvl),
        probs=probs or {},
        features=feats or {},
        model_version=str(model_ver) if model_ver is not None else None,
    )

    # 4) No commiteamos aquí si lo hará el router;
    #    tu router ya hace db.commit(), pero si lo llamas desde otro lado, conviene proteger:
    if force:
        try:
            db.commit()
        except Exception:
            db.rollback()
            raise

    # 5) Devuelve payload consistente para el router
    return {
        "studentId": str(student_id),
        "phase": phase_norm,
        "level": int(lvl),
        "probs": probs or {},
        "modelVersion": model_ver,
        "snapshotAt": datetime.now(timezone.utc).isoformat(),
        "featuresSize": (len(feats) if isinstance(feats, dict) else None),
        "windowStart": (window_start.isoformat() if window_start else None),
        "windowEnd": (window_end.isoformat() if window_end else None),
    }