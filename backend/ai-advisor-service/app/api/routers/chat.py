# app/api/routers/chat.py
import time, re, json, logging
from typing import Optional, Iterable, List, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, status, Header, Request
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

# ============================================================
#  LLM opcional + política de fallback cuando no hay fuentes
# ============================================================
USE_LLM = bool(getattr(settings, "CHAT_USE_LLM", False))

# Modo de fallback si NO hay resultados RAG:
#   "none"    => NUNCA inventar: responde mensaje amable (stream: evento error)
#   "llm"     => usar LLM sin RAG (si USE_LLM=True); si falla, mensaje amable
#   "snippet" => construir texto genérico guía (sin LLM)
FALLBACK_MODE = str(getattr(settings, "CHAT_FALLBACK_MODE", "none")).lower()
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
    w = cut.rfind(" ")
    return (cut[:w].rstrip() if w > 40 else cut).rstrip() + "…"


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


def _chunk_text(text: str, size: int = 120) -> Iterable[str]:
    text = text or ""
    for i in range(0, len(text), size):
        yield text[i : i + size]


def _build_ranking_meta(results) -> List[Dict[str, Any]]:
    out: List[Dict[str, Any]] = []
    for idx, r in enumerate(results):
        dist = None
        try:
            dist_attr = getattr(r, "distance", None)
            dist = float(dist_attr) if dist_attr is not None else None
        except Exception:
            dist = None
        score = None
        if dist is not None:
            try:
                score = max(0.0, min(1.0, 1.0 - dist))
            except Exception:
                score = None
        out.append(
            {
                "rank": idx + 1,
                "docId": str(getattr(r, "doc_id", "")),
                "title": getattr(r, "title", None) or None,
                "score": score,
                "distance": dist,
            }
        )
    return out


def _dbg(msg: str, **kv):
    if settings.ENV != "prod":
        logger.info("[chat] %s | %s", msg, kv)


def _friendly_no_sources_text() -> str:
    return (
        "Por ahora no encuentro material del currículo para responder con seguridad. "
        "Intenta precisar el tema (p. ej., 'Tabla de frecuencia simple para 4.º grado') "
        "o vuelve a intentarlo cuando el banco de contenidos esté cargado."
    )


def _generic_hint_for_math(question: str, grade: Optional[str]) -> str:
    # Guía genérica muy breve para no dejar al estudiante sin nada.
    prefix = "Veamos una idea clave para empezar:\n"
    if grade == "4":
        return prefix + (
            "- Identifica qué te pide el problema y los datos que tienes.\n"
            "- Si hay multiplicación por 10/100/1000, agrega ceros o mueve la coma (si hay decimales).\n"
            "- Verifica tu respuesta estimando primero (aproximación) y luego calculando exacto.\n"
        )
    return prefix + (
        "- Subraya lo que te piden, lista los datos, elige la operación y resuelve paso a paso.\n"
        "- Comprueba si tu resultado tiene sentido (estimación rápida).\n"
    )


@router.post("/chat", response_model=ChatResponse, summary="Chat con grounding (RAG)")
@rate_limit("20/minute")
def chat(
    req: ChatRequest,
    request: Request,  # para IP en rate-limit y trazas
    ctx: AuthContext = Depends(require_public_roles("ROLE_STUDENT", "ROLE_TEACHER")),
    db: Session = Depends(get_db),
    x_bypass_llm: Optional[str] = Header(default=None, alias="X-Bypass-LLM"),
):
    prompt = (req.question or "").strip()
    if not prompt:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Mensaje vacío")

    # Anti prompt-bomb
    if len(prompt) > 4000:
        raise HTTPException(status_code=400, detail="Pregunta demasiado larga (máximo 4000 caracteres)")

    grade = _norm_grade(req.grade)
    subject = _norm_subject(req.subject)
    objective_id = req.objectiveId

    sc = getattr(req, "studentContext", None)
    if sc and (not grade or not subject or not objective_id):
        try:
            grade = grade or _norm_grade(sc.get("grade"))
            subject = subject or _norm_subject(sc.get("subject"))
            objective_id = objective_id or sc.get("lastObjectiveId")
        except Exception:
            pass

    bypass_llm = bool(x_bypass_llm) and str(x_bypass_llm).strip() not in {"0", "false", "False"}

    _dbg(
        "ctx",
        grade=grade,
        subject=subject,
        objective_id=str(objective_id) if objective_id else None,
        bypass=bypass_llm,
        user=getattr(ctx, "sub", None),
        ip=request.client.host if request.client else None,
    )

    with advisor_chat_latency_seconds.time():
        # --- EMBEDDINGS ---
        t0 = time.time()
        try:
            emb = get_query_embedding(prompt)
        except RuntimeError as e:
            _dbg("embed_error", err=str(e))
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

    # -------------------------------------------------------------
    # Normalizamos resultados / citas desde aquí para simplificar
    # -------------------------------------------------------------
    safe_results = (results or [])[: settings.RAG_TOP_K]
    citations = [
        Citation(docId=str(getattr(r, "doc_id", "")), title=(getattr(r, "title", None) or None), url=None)
        for r in safe_results
    ]
    ranking_meta = _build_ranking_meta(safe_results)

    # -------------------------------------------------------------
    # Fallback policy si NO hay resultados RAG
    #   - stream: NUNCA 4xx → SSE con error + end
    #   - no-stream: 200 con mensaje o LLM (según modo)
    # -------------------------------------------------------------
    if not results:
        advisor_rag_misses_total.inc()

        # ¿Usamos LLM sin RAG?
        use_llm_no_rag = (FALLBACK_MODE == "llm") and USE_LLM and (not bypass_llm)

        if req.stream:
            if use_llm_no_rag:
                # Intento 1: LLM sin RAG (rag_items vacío)
                def gen_llm_no_rag():
                    yield _sse({
                        "event": "start",
                        "model": settings.CHAT_LLM_MODEL if USE_LLM else "stub-mvp",
                        "citations": [],
                        "meta": {"ranking": []},
                    })
                    answer_text = None
                    try:
                        llm = generate_with_rag(
                            question=prompt,
                            rag_items=[],   # sin grounding
                            grade=grade,
                            subject=subject,
                        )
                        answer_text = (llm.get("text") or "").strip()
                    except Exception as e:
                        _dbg("llm_no_rag_error", err=str(e))
                        answer_text = _generic_hint_for_math(prompt, grade)

                    for part in _chunk_text(answer_text, size=120):
                        yield _sse({"delta": part})

                    yield _sse({
                        "event": "end",
                        "citations": [],
                        "meta": {"ranking": []},
                        "tokens": {"prompt": 0, "completion": 0},
                    })

                return StreamingResponse(
                    gen_llm_no_rag(),
                    media_type="text/event-stream",
                    headers={
                        "Cache-Control": "no-store",
                        "Connection": "keep-alive",
                        "X-Accel-Buffering": "no",
                    },
                )

            # Modo conservador/snippet: no inventar → evento error + end
            def gen_no_sources():
                yield _sse({
                    "event": "start",
                    "model": "stub-mvp",
                    "citations": [],
                    "meta": {"ranking": []},
                })
                yield _sse({
                    "event": "error",
                    "code": "no_sources",
                    "message": "No hay fuentes del currículo para este tema todavía.",
                })
                yield _sse({
                    "event": "end",
                    "citations": [],
                    "meta": {"ranking": []},
                    "tokens": {"prompt": 0, "completion": 0},
                })

            return StreamingResponse(
                gen_no_sources(),
                media_type="text/event-stream",
                headers={
                    "Cache-Control": "no-store",
                    "Connection": "keep-alive",
                    "X-Accel-Buffering": "no",
                },
            )

        # no-stream
        if use_llm_no_rag:
            try:
                llm = generate_with_rag(
                    question=prompt,
                    rag_items=[],
                    grade=grade,
                    subject=subject,
                )
                text = (llm.get("text") or "").strip() or _generic_hint_for_math(prompt, grade)
            except Exception as e:
                _dbg("llm_no_rag_error_nonstream", err=str(e))
                text = _generic_hint_for_math(prompt, grade)

            return ChatResponse(
                answer=text,
                citations=[],
                tokens={"prompt": 0, "completion": 0},
                model=(settings.CHAT_LLM_MODEL if USE_LLM else "stub-mvp"),
            )

        # Modo conservador/snippet
        return ChatResponse(
            answer=_friendly_no_sources_text(),
            citations=[],
            tokens={"prompt": 0, "completion": 0},
            model="stub-mvp",
        )

    # Hay RAG
    advisor_rag_hits_total.inc()

    def _fallback_from_top() -> str:
        top = results[0]
        snippet = _summarize_snippet(getattr(top, "chunk_text", "") or "")
        return "Con base en el material citado, estos son los pasos clave:\n" + snippet

    use_llm_now = (USE_LLM and not bypass_llm)
    if use_llm_now:
        rag_items = [
            {"title": getattr(r, "title", "") or "", "chunk": getattr(r, "chunk_text", "") or ""}
            for r in safe_results
        ]
        try:
            llm = generate_with_rag(
                question=prompt,
                rag_items=rag_items,
                grade=grade,
                subject=subject,
            )
            answer = (llm.get("text") or "").strip()
            if not answer:
                answer = _fallback_from_top()
        except Exception as e:
            msg = str(e)
            if "LLM_TIMEOUT_OR_ERROR" in msg or "timeout" in msg.lower():
                _dbg("llm_timeout", err=msg)
                raise HTTPException(status_code=status.HTTP_504_GATEWAY_TIMEOUT, detail=msg)
            _dbg("llm_error_nonfatal", err=msg)
            answer = _fallback_from_top()
    else:
        answer = _fallback_from_top()

    if req.stream:
        def gen():
            yield _sse({
                "event": "start",
                "model": settings.CHAT_LLM_MODEL if use_llm_now else "stub-mvp",
                "citations": [c.model_dump() for c in citations],
                "meta": {"ranking": ranking_meta},
            })
            try:
                for part in _chunk_text(answer, size=120):
                    yield _sse({"delta": part})
            except Exception as e:
                _dbg("sse_client_disconnected", err=str(e))
            yield _sse({
                "event": "end",
                "citations": [c.model_dump() for c in citations],
                "meta": {"ranking": ranking_meta},
                "tokens": {"prompt": 0, "completion": 0},
            })

        return StreamingResponse(
            gen(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-store",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )

    return ChatResponse(
        answer=answer,
        citations=citations,
        tokens={"prompt": 0, "completion": 0},
        model=(settings.CHAT_LLM_MODEL if use_llm_now else "stub-mvp"),
    )
