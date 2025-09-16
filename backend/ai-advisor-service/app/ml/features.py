from __future__ import annotations
from datetime import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text

# Lee advisor_events y compone features por ventana temporal
def build_diagnostic_features(db: Session, student_id: str,
                              window_start: Optional[datetime],
                              window_end: Optional[datetime]) -> Dict[str, Any]:
    # Filtros de fecha dinámicos
    conds = ["(payload->>'studentId') = :student_id"]
    params = {"student_id": str(student_id)}
    if window_start:
        conds.append("(payload->>'answeredAt')::timestamptz >= :ws")
        params["ws"] = window_start
    if window_end:
        conds.append("(payload->>'answeredAt')::timestamptz <= :we")
        params["we"] = window_end

    where = " AND ".join(conds)

    # accuracy global
    q_acc = text(f"""
        SELECT
          COUNT(*)::int AS attempts,
          SUM(CASE WHEN (payload->>'correct')::boolean IS TRUE THEN 1 ELSE 0 END)::int AS corrects,
          AVG( (payload->>'score')::float )::float AS avg_score
        FROM advisor_events
        WHERE {where}
    """)
    acc = db.execute(q_acc, params).mappings().one()
    attempts = acc["attempts"] or 0
    corrects = acc["corrects"] or 0
    avg_score = acc["avg_score"] if acc["avg_score"] is not None else None
    accuracy = (corrects / attempts) if attempts > 0 else 0.0

    # por dificultad (requiere que “difficulty” llegue en payload, si no, queda null)
    def agg_by_diff(diff: str) -> Dict[str, Any]:
        q = text(f"""
            SELECT
              COUNT(*)::int AS attempts,
              SUM(CASE WHEN (payload->>'correct')::boolean IS TRUE THEN 1 ELSE 0 END)::int AS corrects,
              AVG( (payload->>'score')::float )::float AS avg_score
            FROM advisor_events
            WHERE {where} AND UPPER(payload->>'difficulty') = :diff
        """)
        m = db.execute(q, {**params, "diff": diff}).mappings().one()
        at = m["attempts"] or 0
        co = m["corrects"] or 0
        sc = m["avg_score"] if m["avg_score"] is not None else None
        return {
            "attempts": at,
            "accuracy": (co / at) if at > 0 else 0.0,
            "avg_score": sc
        }

    f_easy = agg_by_diff("EASY")
    f_med = agg_by_diff("MEDIUM")
    f_hard = agg_by_diff("HARD")

    # pistas y tiempos si los envías en metadata
    q_meta = text(f"""
        SELECT
          AVG( NULLIF( (payload->'metadata'->>'timeSec')::float, 0 ) )::float AS avg_time_sec,
          AVG( (payload->'metadata'->>'hintsUsed')::float )::float AS avg_hints_used
        FROM advisor_events
        WHERE {where}
    """)
    mm = db.execute(q_meta, params).mappings().one()
    avg_time_sec = mm["avg_time_sec"] if mm["avg_time_sec"] is not None else None
    avg_hints_used = mm["avg_hints_used"] if mm["avg_hints_used"] is not None else None

    return {
        "global": {
            "attempts": attempts,
            "accuracy": accuracy,
            "avg_score": avg_score
        },
        "by_difficulty": {
            "EASY": f_easy,
            "MEDIUM": f_med,
            "HARD": f_hard
        },
        "signals": {
            "avg_time_sec": avg_time_sec,
            "avg_hints_used": avg_hints_used
        }
    }
