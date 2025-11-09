# app/services/stats_repo.py
from __future__ import annotations

from datetime import datetime
from typing import Optional, Iterable
from decimal import Decimal, ROUND_HALF_UP

from sqlalchemy import text
from sqlalchemy.orm import Session


# ---- util ----

def _norm_diff(d: Optional[str]) -> Optional[str]:
    """
    Normaliza etiquetas de dificultad a EASY|MEDIUM|HARD.
    Acepta equivalencias BASIC→EASY, INTERMEDIATE→MEDIUM, ADVANCED→HARD.
    """
    if not d:
        return None
    x = str(d).strip().upper()
    if x in {"EASY", "MEDIUM", "HARD"}:
        return x
    if x == "BASIC":
        return "EASY"
    if x == "INTERMEDIATE":
        return "MEDIUM"
    if x == "ADVANCED":
        return "HARD"
    return None


def _q3(x: Optional[float]) -> Optional[float]:
    """
    Cuantiza a 3 decimales con HALF_UP antes de pasar a SQL.
    Evita ruido binario de float; devuelve None si x es None.
    """
    if x is None:
        return None
    return float(Decimal(x).quantize(Decimal("0.001"), rounding=ROUND_HALF_UP))


# ---- create/ensure ----

def ensure_stats_row(db: Session, *, student_id: str, objective_id: str) -> None:
    """
    Idempotente: crea el registro (con defaults) si no existe.
    Concurrencia segura vía ON CONFLICT DO NOTHING.
    """
    db.execute(
        text("""
        INSERT INTO student_objective_stats
          (student_id, objective_id, attempts, corrects, avg_score, last_attempt_at, streak,
           attempts_easy, attempts_medium, attempts_hard,
           corrects_easy, corrects_medium, corrects_hard)
        VALUES
          (:sid, :oid, 0, 0, NULL, NULL, 0,
           0, 0, 0,
           0, 0, 0)
        ON CONFLICT (student_id, objective_id) DO NOTHING
        """),
        {"sid": student_id, "oid": objective_id},
    )


def ensure_stats_rows(db: Session, pairs: Iterable[tuple[str, str]]) -> None:
    """
    Versión batch. Inserta faltantes para varios (student_id, objective_id).
    """
    for sid, oid in pairs:
        ensure_stats_row(db, student_id=sid, objective_id=oid)


# ---- read helpers ----

def get_stats(db: Session, *, student_id: str, objective_id: str) -> Optional[dict]:
    row = db.execute(
        text("""
        SELECT student_id, objective_id, attempts, corrects, avg_score, last_attempt_at, streak,
               attempts_easy, attempts_medium, attempts_hard,
               corrects_easy, corrects_medium, corrects_hard, efactor
        FROM student_objective_stats
        WHERE student_id = :sid AND objective_id = :oid
        """),
        {"sid": student_id, "oid": objective_id},
    ).mappings().first()
    return dict(row) if row else None


# ---- write/update from events ----

def register_attempt(
    db: Session,
    *,
    student_id: str,
    objective_id: str,
    difficulty: Optional[str],   # EASY|MEDIUM|HARD (o BASIC/INTERMEDIATE/ADVANCED)
    correct: bool,
    score: Optional[float],      # 0..1 o None
    now: datetime,
) -> None:
    """
    Actualiza acumuladores globales y por dificultad.
    Asume que ya llamaste a ensure_stats_row(...).
    'score' llega en 0..1. Se aplica blindaje Decimal a 3 decimales antes de SQL.
    """
    d = _norm_diff(difficulty)

    db.execute(
        text("""
        UPDATE student_objective_stats
        SET
          -- globales
          attempts = attempts + 1,
          corrects = corrects + CASE WHEN :correct THEN 1 ELSE 0 END,

          -- por dificultad (solo incrementa el bucket elegido)
          attempts_easy   = attempts_easy   + CASE WHEN :d = 'EASY'   THEN 1 ELSE 0 END,
          attempts_medium = attempts_medium + CASE WHEN :d = 'MEDIUM' THEN 1 ELSE 0 END,
          attempts_hard   = attempts_hard   + CASE WHEN :d = 'HARD'   THEN 1 ELSE 0 END,

          corrects_easy   = corrects_easy   + CASE WHEN :d = 'EASY'   AND :correct THEN 1 ELSE 0 END,
          corrects_medium = corrects_medium + CASE WHEN :d = 'MEDIUM' AND :correct THEN 1 ELSE 0 END,
          corrects_hard   = corrects_hard   + CASE WHEN :d = 'HARD'   AND :correct THEN 1 ELSE 0 END,

          -- promedio incremental (cuidando NULL)
          avg_score = CASE
                        WHEN :score IS NULL THEN avg_score
                        WHEN avg_score IS NULL THEN :score
                        ELSE ROUND((avg_score * attempts + :score)::numeric / (attempts + 1), 3)
                      END,

          -- última vez y racha simple
          last_attempt_at = :now,
          streak = CASE WHEN :correct THEN COALESCE(streak, 0) + 1 ELSE 0 END
        WHERE student_id = :sid AND objective_id = :oid
        """),
        {
            "sid": student_id,
            "oid": objective_id,
            "d": d,
            "correct": bool(correct),
            "score": _q3(score),
            "now": now,
        },
    )
