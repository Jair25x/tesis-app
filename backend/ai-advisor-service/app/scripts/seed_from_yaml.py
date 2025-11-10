# app/scripts/seed_from_yaml.py
import os, uuid, datetime as dt
from typing import Dict, Any, List
import psycopg
from psycopg.rows import dict_row
import yaml

from app.core.settings import settings
from app.services.rag.embeddings import get_query_embedding

DB_URL = os.getenv("DATABASE_URL") or getattr(settings, "DATABASE_URL", None)
MANIFEST_PATH = os.getenv("SEED_MANIFEST", "app/scripts/grade4_math_manifest.yml")

def vec_literal(vec: List[float]) -> str:
    return "[" + ",".join(f"{x:.6f}" for x in vec) + "]"

def load_manifest(path: str) -> Dict[str, Any]:
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)

def upsert_documents_and_chunks(manifest: Dict[str, Any]):
    subject = manifest.get("subject", "math")
    grade = manifest.get("grade", "4")
    units = manifest.get("units", [])
    now = dt.datetime.utcnow()

    with psycopg.connect(DB_URL, autocommit=True, row_factory=dict_row) as conn:
        with conn.cursor() as cur:
            for unit in units:
                unit_code = unit["unit"]
                doc_title = unit["document_title"]
                doc_id = str(uuid.uuid4())

                # Inserta document
                cur.execute(
                    """
                    INSERT INTO documents (id, title, subject, grade, unit, created_at, updated_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO NOTHING
                    """,
                    (doc_id, doc_title, subject, grade, unit_code, now, now),
                )

                for ch in unit.get("chunks", []):
                    chunk_id = str(uuid.uuid4())
                    ch_title = ch["title"]
                    ch_body  = ch["body"].strip()

                    # Genera embedding
                    emb = get_query_embedding(ch_body)
                    emb_lit = vec_literal(emb)

                    cur.execute(
                        f"""
                        INSERT INTO doc_chunks
                          (id, doc_id, title, chunk_text, subject, grade, unit, created_at, updated_at, embedding)
                        VALUES
                          (%s, %s, %s, %s, %s, %s, %s, %s, %s, {emb_lit}::vector)
                        ON CONFLICT (id) DO NOTHING
                        """,
                        (chunk_id, doc_id, ch_title, ch_body, subject, grade, unit_code, now, now),
                    )

def main():
    if not DB_URL:
        raise SystemExit("DATABASE_URL no configurado")

    mf = load_manifest(MANIFEST_PATH)
    upsert_documents_and_chunks(mf)
    print("✅ Seed cargado desde", MANIFEST_PATH)

if __name__ == "__main__":
    main()
