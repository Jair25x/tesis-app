# app/services/rag/ingestion.py
from __future__ import annotations
from typing import Iterable, List, Optional, Dict
from uuid import UUID, uuid4, uuid5, NAMESPACE_URL
from sqlalchemy import text
from sqlalchemy.orm import Session
import re

from app.services.rag.embeddings import get_query_embedding

# ---------- helpers de normalización ----------
def grade_norm(g: Optional[str]) -> Optional[str]:
    if not g:
        return None
    s = g.strip().lower()
    # quita símbolos y sufijos comunes: 6°, 6to, 6º, 6.º
    s = s.replace("º", "").replace("°", "").replace(".º", "").replace("to", "").strip()
    # quedarnos con dígitos principales
    m = re.search(r"\d+", s)
    return m.group(0) if m else s or None

def subject_norm(s: Optional[str]) -> Optional[str]:
    if not s:
        return None
    x = s.strip().lower()
    mapping = {
        "matemática": "math",
        "matematica": "math",
        "mat": "math",
        "mathematics": "math",
        "lengua": "language",
        "comunicación": "language",
        "comunicacion": "language",
        "science": "science",
        "ciencia": "science",
    }
    return mapping.get(x, x)

def simple_chunk(text: str, max_tokens: int = 700, overlap_tokens: int = 120) -> List[str]:
    if not text:
        return []
    max_chars = max_tokens * 4
    ov_chars = overlap_tokens * 4
    res = []
    i = 0
    n = len(text)
    while i < n:
        j = min(i + max_chars, n)
        chunk = text[i:j]
        res.append(chunk)
        i = j - ov_chars if j < n else n
    return res

def md_cleanup(md: str) -> str:
    if not md:
        return ""
    txt = md
    txt = re.sub(r"```.*?```", " ", txt, flags=re.S)                   # bloques code
    txt = re.sub(r"`([^`]*)`", r"\1", txt)                            # inline code
    txt = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", txt)                # links
    txt = re.sub(r"!\[[^\]]*\]\([^)]+\)", " ", txt)                   # imágenes
    txt = re.sub(r"[*_#>]+", " ", txt)                                # marcas
    txt = re.sub(r"\s+", " ", txt).strip()                            # espacios
    return txt

# ---------- upserts ----------
def upsert_document(
    db: Session,
    *,
    doc_id: Optional[UUID],
    title: str,
    grade: Optional[str],
    subject: Optional[str],
    objective_id: Optional[UUID],
    source: Optional[str],
    version: Optional[str],
) -> UUID:
    """
    Si no pasas doc_id, generamos uno determinístico con uuid5(NAMESPACE_URL, <clave>).
    Evita duplicados si reingestas el mismo doc (source/title/objective/version).
    """
    if doc_id:
        did = str(doc_id)
    else:
        key = f"{source or ''}::{version or ''}::{objective_id or ''}::{title or ''}"
        did = str(uuid5(NAMESPACE_URL, key))

    db.execute(
        text(
            """
            INSERT INTO documents (id, title, grade, subject, objective_id, source, version)
            VALUES (:id, :title, :grade, :subject, :objective_id, :source, :version)
            ON CONFLICT (id) DO NOTHING
            """
        ),
        {
            "id": did,
            "title": title,
            "grade": grade_norm(grade),
            "subject": subject_norm(subject),
            "objective_id": str(objective_id) if objective_id else None,
            "source": source,
            "version": version,
        },
    )
    return UUID(did)

def upsert_chunks(
    db: Session,
    *,
    doc_id: UUID,
    raw_texts: Iterable[str],
    replace_existing: bool = True,   # <<— evita duplicados en reingesta
):
    if replace_existing:
        db.execute(text("DELETE FROM doc_chunks WHERE doc_id = :doc"), {"doc": str(doc_id)})

    idx = 0
    for t in raw_texts:
        t = (t or "").strip()
        if not t:
            continue
        emb = get_query_embedding(t)
        db.execute(
            text(
                """
                INSERT INTO doc_chunks (id, doc_id, chunk_index, text, tokens, embedding)
                VALUES (:id, :doc, :idx, :text, NULL, :emb)
                """
            ),
            {
                "id": str(uuid4()),
                "doc": str(doc_id),
                "idx": int(idx),
                "text": t,
                "emb": list(emb),
            },
        )
        idx += 1

def build_text_from_detail(detail: Dict) -> str:
    parts: List[str] = []
    st = (detail.get("statement") or "").strip()
    if st:
        parts.append(st)
    hints = detail.get("hints") or []
    if hints and isinstance(hints, list):
        # soporta [{hintText:..}] o lista de strings
        hh = []
        for h in hints:
            if isinstance(h, dict):
                v = (h.get("hintText") or "").strip()
                if v: hh.append(v)
            elif isinstance(h, str) and h.strip():
                hh.append(h.strip())
        if hh:
            parts.append("Pistas: " + " ".join(hh))
    steps = detail.get("solutionSteps") or []
    if steps and isinstance(steps, list):
        ss = []
        for s in steps:
            if isinstance(s, dict):
                v = (s.get("explanation") or "").strip()
                if v: ss.append(v)
            elif isinstance(s, str) and s.strip():
                ss.append(s.strip())
        if ss:
            parts.append("Pasos de solución: " + " ".join(ss))
    return " ".join(p for p in parts if p).strip()

def ingest_md_documents(
    db: Session,
    *,
    docs: List[Dict],
    client_resolve,  # function(code:str) -> objective_meta|None
    default_subject: Optional[str] = "math",
    default_version: Optional[str] = "v1",
    source: str = "md-knowledge",
) -> Dict:
    inserted_docs = 0
    inserted_chunks = 0

    for d in docs:
        title = (d.get("title") or "").strip()
        content = (d.get("content") or "").strip()
        if not title or not content:
            continue

        obj_id = d.get("objectiveId")
        if not obj_id:
            code = (d.get("objectiveCode") or "").strip()
            if code:
                obj_meta = client_resolve(code)
                if obj_meta and obj_meta.get("id"):
                    obj_id = obj_meta["id"]

        grade = grade_norm(d.get("grade"))
        subject = subject_norm(d.get("subject") or default_subject)
        version = d.get("version") or default_version

        doc_id = upsert_document(
            db,
            doc_id=None,
            title=title,
            grade=grade,
            subject=subject,
            objective_id=UUID(obj_id) if obj_id else None,
            source=source,
            version=version,
        )
        text = md_cleanup(content)
        chunks = simple_chunk(text, max_tokens=700, overlap_tokens=120)
        upsert_chunks(db, doc_id=doc_id, raw_texts=chunks, replace_existing=True)

        inserted_docs += 1
        inserted_chunks += len(chunks)

    return {"insertedDocs": inserted_docs, "insertedChunks": inserted_chunks}
