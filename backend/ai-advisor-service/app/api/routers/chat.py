import time, re, json, logging
from typing import Optional, Iterable, List, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, status, Header
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.settings import settings
from app.security.authz import require_public_roles, AuthContext
from app.schemas.chat import ChatRequest, ChatResponse
from app.schemas.recommendations import Citation
from app.services.rag.embeddings import get_query_embedding
from app.services.rag.retriever import search_chunks
from app.observability.metrics import (
    advisor_chat_latency_seconds,
    advisor_rag_hits_total,
    advisor_rag_misses_total,
)
from app.core.rate_limit import rate_limit

# LLM opcional
USE_LLM = getattr(settings, "CHAT_USE_LLM", False)
if USE_LLM:
    # Debe respetar settings.LLM_REQUEST_TIMEOUT internamente
    from app.services.llm.openai_text import generate_with_rag

logger = logging.getLogger("advisor.chat")
router = APIRouter(prefix="/api/ai", tags=["chat"])


def _summarize_snippet(txt: str, max_chars: int = 320) -> str:
    if not txt:
        return ""
    t = re.sub(r"\s+", " ", txt).strip()
    if len(t) <= max_chars:
        return t
    cut = t[:max_chars]
    m = re.search(r"([.!?])(?=[^.!?]*$)", cut)
    if m:
        return cut[: m.end()]
    return cut + "…"


def _norm_subject(s: Optional[str]) -> Optional[str]:
    if not s:
        return None
    x = re.sub(r"\s+", " ", s).strip().lower()
    if x in {"math", "mate", "matematica", "matemática", "mat", "m"}:
        return "math"
    if x in {"lang", "language", "lengua", "comunicacion", "comunicación", "l"}:
        return "lang"
    return None


def _norm_grade(g: Optional[str]) -> Optional[str]:
    if not g:
        return None
    m = re.search(r"(\d+)", g)
    return m.group(1) if m else None


def _sse(data: dict) -> bytes:
    return f"data: {json.dumps(data, ensure_ascii=False)}\n\n".encode("utf-8")


def _chunk_text(text: str, size: int = 60) -> Iterable[str]:
    text = text or ""
    for i in range(0, len(text), size):
        yield text[i : i + size]


def _build_ranking_meta(results) -> List[Dict[str, Any]]:
    out: List[Dict[str, Any]] = []
    for idx, r in enumerate(results):
        dist = None
        try:
            dist = float(getattr(r, "distance", None)) if getattr(r, "distance", None) is not None else None
        except Exception:
            dist = None
        score = None
        if dist is not None:
            try:
                score = max(0.0, min(1.0, 1.0 - dist))
            except Exception:
                score = None
        out.append({
            "rank": idx + 1,
            "docId": str(r.doc_id),
            "title": r.title or None,
            "score": score,
            "distance": dist,
        })
    return out


def _dbg(msg: str, **kv):
    if settings.ENV != "prod":
        logger.info("[chat] %s | %s", msg, kv)


@router.post("/chat", response_model=ChatResponse, summary="Chat con grounding (RAG)")
@rate_limit("20/minute")
def chat(
    req: ChatRequest,
    ctx: AuthContext = Depends(require_public_roles("ROLE_STUDENT", "ROLE_TEACHER")),
    db: Session = Depends(get_db),
    x_bypass_llm: Optional[str] = Header(default=None, alias="X-Bypass-LLM"),
):
    prompt = (req.question or "").strip()
    if not prompt:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Mensaje vacío")

    # ✅ Límite de tamaño anti “prompt-bomb”
    if len(prompt) > 4000:
        raise HTTPException(status_code=400, detail="Pregunta demasiado larga (máximo 4000 caracteres)")

    grade = _norm_grade(req.grade)
    subject = _norm_subject(req.subject)
    objective_id = req.objectiveId

    sc = getattr(req, "studentContext", None)
    if sc and (not grade or not subject or not objective_id):
        grade = grade or _norm_grade(sc.get("grade"))
        subject = subject or _norm_subject(sc.get("subject"))
        objective_id = objective_id or sc.get("lastObjectiveId")

    # Permitir bypass de LLM por header (para aislar problemas de modelo)
    bypass_llm = bool(x_bypass_llm) and str(x_bypass_llm).strip() not in {"0", "false", "False"}

    _dbg(
        "ctx",
        grade=grade,
        subject=subject,
        objective_id=str(objective_id) if objective_id else None,
        bypass=bypass_llm,
    )

    with advisor_chat_latency_seconds.time():
        # --- EMBEDDINGS ---
        t0 = time.time()
        try:
            emb = get_query_embedding(prompt)  # puede lanzar RuntimeError("EMBEDDINGS_...")
        except RuntimeError as e:
            _dbg("embed_error", err=str(e))
            # Upstream lento/caído: devolvemos 504 y cortamos en < EMB_REQUEST_TIMEOUT
            raise HTTPException(status_code=status.HTTP_504_GATEWAY_TIMEOUT, detail=str(e))
        except Exception as e:
            _dbg("embed_error_generic", err=str(e))
            raise HTTPException(status_code=status.HTTP_504_GATEWAY_TIMEOUT, detail="EMBEDDINGS_GENERIC_ERROR")
        t1 = time.time()
        _dbg("embed_ok", ms=int((t1 - t0) * 1000))

        # --- RETRIEVER ---
        try:
            results = search_chunks(
                db,
                query_text=prompt,
                query_embedding=emb,
                k=settings.RAG_TOP_K,
                grade=grade,
                subject=subject,
                objective_id=objective_id,
            )
        except Exception as e:
            _dbg("retriever_error", err=str(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="RAG search failed")

        t2 = time.time()
        _dbg("retriever_ok", ms=int((t2 - t1) * 1000), hits=len(results or []))

    if not results:
        advisor_rag_misses_total.inc()
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="No se encontraron fuentes del currículo para responder con seguridad.",
        )

    advisor_rag_hits_total.inc()

    # Citations & meta
    citations = [Citation(docId=str(r.doc_id), title=r.title or None, url=None) for r in results[: settings.RAG_TOP_K]]
    ranking_meta = _build_ranking_meta(results[: settings.RAG_TOP_K])

    # --- Construcción de respuesta ---
    use_llm_now = (USE_LLM and not bypass_llm)
    if use_llm_now:
        rag_items = [{"title": r.title or "", "chunk": r.chunk_text or ""} for r in results[: settings.RAG_TOP_K]]
        try:
            llm = generate_with_rag(
                question=prompt,
                rag_items=rag_items,
                grade=grade,
                subject=subject,
            )
            answer = (llm.get("text") or "").strip()
            if not answer:
                top = results[0]
                snippet = _summarize_snippet(top.chunk_text)
                answer = "Con base en el material citado, estos son los pasos clave:\n" + snippet
        except Exception as e:
            # LLM lento/caído -> 504 (no colgarnos 40s)
            msg = str(e)
            if "LLM_TIMEOUT_OR_ERROR" in msg or "timeout" in msg.lower():
                _dbg("llm_timeout", err=msg)
                raise HTTPException(status_code=status.HTTP_504_GATEWAY_TIMEOUT, detail=msg)
            # Cualquier otro error: log y fallback a snippet
            _dbg("llm_error_nonfatal", err=msg)
            top = results[0]
            snippet = _summarize_snippet(top.chunk_text)
            answer = "Con base en el material citado, estos son los pasos clave:\n" + snippet
    else:
        top = results[0]
        snippet = _summarize_snippet(top.chunk_text)
        answer = "Con base en el material citado, estos son los pasos clave:\n" + snippet

    if req.stream:
        def gen():
            yield _sse({
                "event": "start",
                "model": settings.CHAT_LLM_MODEL if use_llm_now else "stub-mvp",
                "citations": [c.model_dump() for c in citations],
                "meta": {"ranking": ranking_meta},
            })
            for part in _chunk_text(answer, size=60):
                yield _sse({"delta": part})
            yield _sse({
                "event": "end",
                "citations": [c.model_dump() for c in citations],
                "meta": {"ranking": ranking_meta},
                "tokens": {"prompt": 0, "completion": 0}
            })
        return StreamingResponse(gen(), media_type="text/event-stream")

    return ChatResponse(
        answer=answer,
        citations=citations,
        tokens={"prompt": 0, "completion": 0},
        model=(settings.CHAT_LLM_MODEL if use_llm_now else "stub-mvp"),
    )
