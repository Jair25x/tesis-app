# app/api/routers/emb_debug.py
from fastapi import APIRouter, Depends, HTTPException
from app.security.authz import require_internal
from app.services.rag.embeddings import get_query_embedding

router = APIRouter(prefix="/_debug/emb", tags=["debug"])

@router.get("/ping", dependencies=[Depends(require_internal("ROLE_INTERNAL"))])
def ping(q: str = "hola"):
    try:
        v = get_query_embedding(q)
        return {"ok": True, "dim": len(v)}
    except Exception as e:
        raise HTTPException(status_code=504, detail=str(e))
