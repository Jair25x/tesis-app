# app/scripts/seed_from_yaml.py
from __future__ import annotations

import os
import uuid
import datetime as dt
from typing import Dict, Any, List, Optional

import psycopg
from psycopg.rows import dict_row
import yaml

from app.core.settings import settings
from app.services.rag.embeddings import get_query_embedding

# --- Config ---
DB_URL: Optional[str] = os.getenv("DATABASE_URL") or getattr(settings, "DATABASE_URL", None)
MANIFEST_PATH: str = os.getenv("SEED_MANIFEST", "app/scripts/grade4_math_manifest.yml")

# Namespace constante para IDs deterministas
NAMESPACE = uuid.UUID("00000000-0000-4000-8000-000000000001")

def vec_literal(vec: List[float]) -> str:
    # Embedding literal para pgvector
    return "[" + ",".join(f"{x:.6f}" for x in vec) + "]"

def load_manifest(path: str) -> Dict[str, Any]:
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)

def ensure_unique_index_on_doc_index(cur) -> None:
    """
    Garantiza un índice único (doc_id, chunk_index) para idempotencia.
    No falla si ya existe.
    """
    cur.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_indexes
                WHERE schemaname = 'public'
                  AND indexname = 'ux_doc_chunks_doc_idx'
            ) THEN
                BEGIN
                    CREATE UNIQUE INDEX ux_doc_chunks_doc_idx
                        ON doc_chunks (doc_id, chunk_index);
                EXCEPTION WHEN others THEN
                    -- Ignorar si otro worker lo creó en carrera
                    NULL;
                END;
            END IF;
        END
        $$;
    """)

def get_or_create_document(cur, subject: str, grade: str, unit_code: str, doc_title: str, now: dt.datetime) -> str:
    """
    Usa UUID determinista para cada documento por (subject, grade, unit).
    Si ya existe, no inserta; si no, inserta.
    """
    deterministic_id = uuid.uuid5(NAMESPACE, f"doc::{subject}::{grade}::{unit_code}")
    doc_id = str(deterministic_id)

    cur.execute(
        """
        INSERT INTO documents (id, title, subject, grade, unit, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (id) DO UPDATE
        SET title = EXCLUDED.title,
            updated_at = EXCLUDED.updated_at
        """,
        (doc_id, doc_title, subject, grade, unit_code, now, now),
    )
    return doc_id

def upsert_chunk(cur,
                 doc_id: str,
                 chunk_index: int,
                 ch_title: str,
                 ch_body: str,
                 subject: str,
                 grade: str,
                 unit_code: str,
                 emb_lit: str,
                 now: dt.datetime) -> None:
    """
    UPSERT por (doc_id, chunk_index). Si existe, actualiza; si no, inserta.
    Además, usa UUID determinista basado en (doc_id, chunk_index).
    - emb_lit llega como string: "[0.123,0.456,...]"  (¡SIN comillas! aquí lo pasamos como %s y casteamos ::vector)
    """
    chunk_uuid = str(uuid.uuid5(uuid.UUID(doc_id), f"chunk::{chunk_index}"))

    cur.execute(
        """
        INSERT INTO doc_chunks
          (id, doc_id, chunk_index, title, chunk_text, subject, grade, unit, created_at, updated_at, embedding)
        VALUES
          (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s::vector)
        ON CONFLICT (doc_id, chunk_index) DO UPDATE
          SET title      = EXCLUDED.title,
              chunk_text = EXCLUDED.chunk_text,
              subject    = EXCLUDED.subject,
              grade      = EXCLUDED.grade,
              unit       = EXCLUDED.unit,
              updated_at = EXCLUDED.updated_at,
              embedding  = EXCLUDED.embedding
        """,
        (
            chunk_uuid, doc_id, chunk_index, ch_title, ch_body,
            subject, grade, unit_code, now, now, emb_lit
        ),
    )

def upsert_documents_and_chunks(manifest: Dict[str, Any]) -> None:
    subject = str(manifest.get("subject", "math")).strip().lower()
    grade   = str(manifest.get("grade", "4")).strip()
    units   = manifest.get("units", []) or []
    now     = dt.datetime.utcnow()

    with psycopg.connect(DB_URL, autocommit=True, row_factory=dict_row) as conn:
        with conn.cursor() as cur:
            # Asegura índice único
            ensure_unique_index_on_doc_index(cur)

            for unit in units:
                unit_code  = str(unit["unit"]).strip()
                doc_title  = str(unit["document_title"]).strip()

                doc_id = get_or_create_document(cur, subject, grade, unit_code, doc_title, now)

                # Inserta/actualiza chunks con índice 0..n-1
                for idx, ch in enumerate(unit.get("chunks", [])):
                    ch_title = str(ch["title"]).strip()
                    ch_body  = str(ch["body"]).strip()

                    # Embedding (usa OpenAI si hay key; si no, stub determinístico)
                    emb_vec = get_query_embedding(ch_body)
                    emb_lit = vec_literal(emb_vec)

                    upsert_chunk(
                        cur=cur,
                        doc_id=doc_id,
                        chunk_index=idx,
                        ch_title=ch_title,
                        ch_body=ch_body,
                        subject=subject,
                        grade=grade,
                        unit_code=unit_code,
                        emb_lit=emb_lit,
                        now=now,
                    )

def main() -> None:
    if not DB_URL:
        raise SystemExit("DATABASE_URL no configurado")

    manifest = load_manifest(MANIFEST_PATH)
    upsert_documents_and_chunks(manifest)
    print(f"✅ Seed cargado/actualizado desde {MANIFEST_PATH}")

if __name__ == "__main__":
    main()
