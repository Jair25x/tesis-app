# app/api/routers/rag_debug.py
import time
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.security.authz import require_internal
from app.services.rag.embeddings import get_query_embedding
from app.services.rag.retriever import search_chunks
from app.core.settings import settings

router = APIRouter(prefix="/_debug/rag", tags=["debug"])

@router.get("/search")
def rag_search(
    q: str = Query(...),
    grade: Optional[str] = Query(None),
    subject: Optional[str] = Query(None),
    objectiveId: Optional[str] = Query(None),
    k: int = Query(3, ge=1, le=10),
    _=Depends(require_internal("ROLE_INTERNAL")),
    db: Session = Depends(get_db),
):
    t0 = time.time()
    emb = get_query_embedding(q)
    t1 = time.time()
    res = search_chunks(
        db,
        query_text=q,
        query_embedding=emb,
        k=min(k, settings.RAG_TOP_K or 3),
        grade=grade,
        subject=subject,
        objective_id=objectiveId,
    )
    t2 = time.time()
    hits = [{
        "docId": str(r.doc_id),
        "title": r.title,
        "distance": float(getattr(r, "distance", 0.0)) if getattr(r, "distance", None) is not None else None
    } for r in (res or [])]
    return {
        "embed_ms": int((t1 - t0)*1000),
        "search_ms": int((t2 - t1)*1000),
        "hits": hits,
    }
