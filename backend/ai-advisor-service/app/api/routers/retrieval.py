# app/api/routers/retrieval.py
from typing import Optional, List, Dict
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Body, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.api.deps import get_session
from app.security.authz import require_internal
from app.core.settings import settings
from app.services.clients.curriculum_client import CurriculumClient
from app.services.clients.s2s import mint_s2s_jwt
from app.services.rag.ingestion import (
    upsert_document,
    upsert_chunks,
    simple_chunk,
    build_text_from_detail,
    ingest_md_documents,
)

import httpx

# Debug RAG directo
from app.services.rag.embeddings import get_query_embedding
from app.services.rag.retriever import search_chunks

router = APIRouter(prefix="/internal/rag", tags=["internal"])

def _client() -> CurriculumClient:
    return CurriculumClient(
        settings.CURRICULUM_BASE_URL,
        s2s_token_provider=lambda: mint_s2s_jwt(["INTERNAL", "ROLE_INTERNAL"]),
    )

@router.post(
    "/ingest",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(require_internal("ROLE_INTERNAL"))],
)
def rag_ingest(payload: dict = Body(...), db: Session = Depends(get_session)):
    objective_ids = [x for x in (payload.get("objectiveIds") or []) if x]
    if not objective_ids:
        raise HTTPException(status_code=400, detail="Proporciona objectiveIds")

    grade: Optional[str] = payload.get("grade")
    subject: Optional[str] = payload.get("subject")
    source: Optional[str] = payload.get("source") or "curriculum-service"
    version: Optional[str] = payload.get("version") or "v1"
    per_obj: int = int(payload.get("perObjective") or 1)
    per_obj = max(1, min(per_obj, 5))

    client = _client()
    total_docs = 0
    total_chunks = 0

    for oid in objective_ids:
        items = client.get_exercises_for_objective(
            objective_id=oid, limit=per_obj, random=True, active=True, difficulty=None, order="desc"
        )
        for it in items:
            ex_id = str(it.get("exerciseId") or "")
            if not ex_id:
                continue

            detail = client.get_exercise_detail(ex_id)
            if not detail:
                title = it.get("title") or "Ejercicio"
                doc_id = upsert_document(
                    db, doc_id=None, title=title, grade=grade, subject=subject,
                    objective_id=UUID(oid), source=source, version=version,
                )
                upsert_chunks(db, doc_id=doc_id, raw_texts=[title])
                total_docs += 1
                total_chunks += 1
                continue

            title = detail.get("title") or it.get("title") or "Ejercicio"
            doc_id = upsert_document(
                db, doc_id=None, title=title, grade=grade, subject=subject,
                objective_id=UUID(oid), source=source, version=version,
            )
            text_body = build_text_from_detail(detail)
            chunks = simple_chunk(text_body, max_tokens=700, overlap_tokens=120)
            upsert_chunks(db, doc_id=doc_id, raw_texts=chunks)

            total_docs += 1
            total_chunks += len(chunks)

    db.commit()
    return {"insertedDocs": total_docs, "insertedChunks": total_chunks}

@router.post(
    "/ingest-md",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(require_internal("ROLE_INTERNAL"))],
)
def rag_ingest_md(payload: dict = Body(...), db: Session = Depends(get_session)):
    """
    body:
    {
      "documents": [
        {
          "objectiveId": "uuid" | null,
          "objectiveCode": "LO.2.1.1" | null,
          "grade": "6",
          "subject": "math",
          "title": "Moda y tablas de frecuencia",
          "version": "v1",
          "content": "# Definición ... (markdown o texto)"
        }
      ]
    }
    """
    docs: List[Dict] = payload.get("documents") or payload.get("docs") or []
    if not docs:
        raise HTTPException(status_code=400, detail="Proporciona 'documents'")

    client = _client()

    def _resolve(code: str) -> Optional[Dict]:
        if not code:
            return None
        return client.get_objective_by_code(code)

    result = ingest_md_documents(db, docs=docs, client_resolve=_resolve, source="md-knowledge")
    db.commit()
    return result

@router.get(
    "/stats",
    dependencies=[Depends(require_internal("ROLE_INTERNAL"))],
)
def rag_stats(db: Session = Depends(get_session)):
    row = db.execute(text("""
        SELECT
          (SELECT COUNT(*) FROM documents) AS documents,
          (SELECT COUNT(*) FROM doc_chunks) AS chunks
    """)).mappings().first()
    return {"documents": int(row["documents"]), "chunks": int(row["chunks"])}

@router.post(
    "/purge",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(require_internal("ROLE_INTERNAL"))],
)
def rag_purge(payload: dict = Body(...), db: Session = Depends(get_session)):
    """
    body:
    {
      "source": "md-knowledge",     // opcional
      "objectiveId": "uuid",        // opcional
      "titleContains": "moda",      // opcional (ILIKE)
      "dryRun": true                // por defecto true
    }
    """
    source = (payload.get("source") or "").strip() or None
    objective_id = (payload.get("objectiveId") or "").strip() or None
    title_contains = (payload.get("titleContains") or "").strip() or None
    dry_run = bool(payload.get("dryRun", True))

    conds: List[str] = []
    params: Dict[str, str] = {}
    if source:
        conds.append("source = :source")
        params["source"] = source
    if objective_id:
        conds.append("objective_id = :objective_id")
        params["objective_id"] = str(objective_id)
    if title_contains:
        conds.append("title ILIKE :title")
        params["title"] = f"%{title_contains}%"
    where = " AND ".join(conds) if conds else "TRUE"

    cnt_docs = db.execute(text(f"SELECT COUNT(*) FROM documents WHERE {where}"), params).scalar() or 0
    cnt_chunks = db.execute(text(f"""
        SELECT COUNT(*) FROM doc_chunks c
        JOIN documents d ON d.id = c.doc_id
        WHERE {where}
    """), params).scalar() or 0

    if dry_run:
        return {"dryRun": True, "matchedDocs": cnt_docs, "matchedChunks": cnt_chunks}

    db.execute(text(f"DELETE FROM documents WHERE {where}"), params)
    db.commit()
    return {"dryRun": False, "deletedDocs": cnt_docs, "deletedChunks": cnt_chunks}

# -----------------------
# Diagnóstico OpenAI
# -----------------------

@router.get("/embedding-mode", dependencies=[Depends(require_internal("ROLE_INTERNAL"))])
def embedding_mode():
    backend = "openai" if (settings.OPENAI_API_KEY or "").strip() else "stub"
    return {
        "backend": backend,
        "model": settings.OPENAI_EMBED_MODEL,
        "apiBase": settings.OPENAI_API_BASE or "https://api.openai.com",
        "apiKeyPresent": bool((settings.OPENAI_API_KEY or "").strip()),
    }

@router.get("/netcheck", dependencies=[Depends(require_internal("ROLE_INTERNAL"))])
def netcheck():
    url = (settings.OPENAI_API_BASE or "https://api.openai.com") + "/v1/models"
    headers: Dict[str, str] = {}
    if (settings.OPENAI_API_KEY or "").strip():
        headers["Authorization"] = f"Bearer {settings.OPENAI_API_KEY}"
    try:
        with httpx.Client(timeout=5.0) as client:
            r = client.get(url, headers=headers)
        return {"ok": r.status_code < 500, "status": r.status_code, "url": url}
    except Exception as e:
        return {"ok": False, "error": str(e), "url": url}

# -----------------------
# Debug RAG directo
# -----------------------

@router.get("/embed-test", dependencies=[Depends(require_internal("ROLE_INTERNAL"))])
def embed_test():
    try:
        vec = get_query_embedding("hola mundo")
        return {"ok": True, "dim": len(vec), "sample": list(map(float, vec[:8]))}
    except Exception as e:
        return {"ok": False, "error": str(e)}

@router.get("/search-debug", dependencies=[Depends(require_internal("ROLE_INTERNAL"))])
def search_debug(
    q: str = Query(..., description="texto a buscar"),
    grade: Optional[str] = None,
    subject: Optional[str] = None,
    objectiveId: Optional[UUID] = None,
    k: int = Query(3, ge=1, le=10),
    db: Session = Depends(get_session),
):
    emb = get_query_embedding(q.strip())
    res = search_chunks(
        db,
        query_text=q.strip(),
        query_embedding=emb,
        k=k,
        grade=grade,
        subject=subject,
        objective_id=objectiveId,
    )
    out: List[Dict[str, Optional[str]]] = []
    for r in res:
        txt = (r.chunk_text or "").strip().replace("\n", " ")
        out.append({
            "docId": str(r.doc_id),
            "title": r.title,
            "distance": float(r.distance) if r.distance is not None else None,
            "preview": (txt[:180] + "…") if len(txt) > 180 else txt
        })
    return {"results": out}
