# app/api/routers/llm_debug.py
import time
from fastapi import APIRouter, Depends, Query
from app.security.authz import require_internal
from app.services.llm.openai_text import generate_with_rag

router = APIRouter(prefix="/_debug/llm", tags=["debug"])

@router.get("/ping", dependencies=[Depends(require_internal("ROLE_INTERNAL"))])
def llm_ping(text: str = Query("Di una frase corta.")):
    t0 = time.time()
    out = generate_with_rag(
        question=text,
        rag_items=[{"title": "Ping", "chunk": "Texto mínimo para probar conectividad."}],
        grade="6",
        subject="math",
    )
    ms = int((time.time() - t0) * 1000)
    return {"ok": True, "ms": ms, "len": len(out.get("text") or "")}
