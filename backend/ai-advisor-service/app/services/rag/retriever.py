# app/services/rag/retriever.py
from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional, Sequence, Any
from uuid import UUID
from sqlalchemy import text
from sqlalchemy.orm import Session


@dataclass
class RetrievedChunk:
    doc_id: UUID
    title: str
    chunk_text: str
    distance: float  # menor = más similar


def _filters_sql(
    grade: Optional[str],
    subject: Optional[str],
    objective_id: Optional[UUID],
) -> tuple[str, dict]:
    conds: list[str] = []
    params: dict[str, Any] = {}

    if grade:
        conds.append("d.grade = :grade")
        params["grade"] = str(grade)
    if subject:
        conds.append("d.subject = :subject")
        params["subject"] = str(subject)
    if objective_id:
        conds.append("d.objective_id = :objective_id")
        params["objective_id"] = str(objective_id)

    where = ("WHERE " + " AND ".join(conds)) if conds else ""
    return where, params


def _to_pgvector_literal(v: Sequence[float]) -> str:
    # '[0.123456, -0.000001, ...]'
    return "[" + ", ".join(f"{float(x):.6f}" for x in v) + "]"


def search_chunks(
    db: Session,
    *,
    query_text: str,
    query_embedding: Optional[Sequence[float]],
    k: int,
    grade: Optional[str],
    subject: Optional[str],
    objective_id: Optional[UUID],
) -> List[RetrievedChunk]:
    """
    1) Vector search (pgvector) si hay embedding
    2) Fallback textual por ILIKE
    3) Fallback por objective_id (último recurso)
    """
    where, params = _filters_sql(grade, subject, objective_id)
    limit = max(1, int(k))

    # 1) Vector search (solo chunk_text, sin referencias a c.text)
    if query_embedding:
        try:
            emb_lit = _to_pgvector_literal(query_embedding)
            rows = db.execute(
                text(
                    f"""
                    SELECT
                        d.id AS doc_id,
                        d.title AS title,
                        c.chunk_text AS chunk_text,
                        (c.embedding <-> CAST(:emb_vec AS vector)) AS distance
                    FROM doc_chunks c
                    JOIN documents d ON d.id = c.doc_id
                    {where}
                    ORDER BY c.embedding <-> CAST(:emb_vec AS vector)
                    LIMIT :k
                    """
                ),
                dict(params, emb_vec=emb_lit, k=limit),
            ).mappings().all()

            out = [
                RetrievedChunk(
                    doc_id=r["doc_id"],
                    title=(r["title"] or ""),
                    chunk_text=(r["chunk_text"] or ""),
                    distance=float(r["distance"]),
                )
                for r in rows
                if r.get("chunk_text")
            ]
            if out:
                return out
        except Exception:
            try:
                db.rollback()
            except Exception:
                pass
            # caemos al textual

    # 2) Fallback textual (solo chunk_text)
    q = f"%{(query_text or '').strip()}%"
    rows = db.execute(
        text(
            f"""
            SELECT
                d.id AS doc_id,
                d.title AS title,
                c.chunk_text AS chunk_text,
                0.5 AS distance
            FROM doc_chunks c
            JOIN documents d ON d.id = c.doc_id
            {where} {"AND" if where else "WHERE"} c.chunk_text ILIKE :q
            ORDER BY c.created_at DESC
            LIMIT :k
            """
        ),
        dict(params, q=q, k=limit),
    ).mappings().all()

    out = [
        RetrievedChunk(
            doc_id=r["doc_id"],
            title=(r["title"] or ""),
            chunk_text=(r["chunk_text"] or ""),
            distance=float(r["distance"]),
        )
        for r in rows
        if r.get("chunk_text")
    ]
    if out:
        return out

    # 3) Fallback por objective_id, sin textual
    if objective_id:
        rows2 = db.execute(
            text(
                """
                SELECT
                    d.id AS doc_id,
                    d.title AS title,
                    c.chunk_text AS chunk_text,
                    0.9 AS distance
                FROM doc_chunks c
                JOIN documents d ON d.id = c.doc_id
                WHERE d.objective_id = :objective_id
                ORDER BY c.created_at DESC
                LIMIT :k
                """
            ),
            {"objective_id": str(objective_id), "k": limit},
        ).mappings().all()

        return [
            RetrievedChunk(
                doc_id=r["doc_id"],
                title=(r["title"] or ""),
                chunk_text=(r["chunk_text"] or ""),
                distance=float(r["distance"]),
            )
            for r in rows2
            if r.get("chunk_text")
        ]

    return []
