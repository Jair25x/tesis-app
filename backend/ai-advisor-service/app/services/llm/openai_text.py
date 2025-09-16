# app/services/llm/openai_text.py
from __future__ import annotations

import re
from typing import List, Dict, Any

from app.core.settings import settings

_client = None

def _client_lazy():
    global _client
    if _client is None:
        from openai import OpenAI
        # Respeta timeout duro desde settings
        _client = OpenAI(timeout=getattr(settings, "LLM_REQUEST_TIMEOUT", 12))
    return _client

def _trim(s: str, max_len: int) -> str:
    s = (s or "").strip()
    if len(s) <= max_len:
        return s
    return s[: max_len - 1] + "…"

def _mk_prompt(question: str, rag_items: List[Dict[str, str]], grade: str | None, subject: str | None) -> str:
    """
    Prompt compacto: solo lo necesario, con referencias [1], [2], …
    """
    grade = (grade or "6")
    subject = (subject or "math")
    # Recorta items (máx 3) y limita texto total ~1200 chars
    MAX_ITEMS = 3
    MAX_TOTAL = 1200
    picked = rag_items[:MAX_ITEMS]

    # Une títulos + trozos con [n]
    chunks = []
    total = 0
    for i, it in enumerate(picked, start=1):
        title = (it.get("title") or "").strip() or f"Fuente {i}"
        txt   = re.sub(r"\s+", " ", (it.get("chunk") or "").strip())
        # recorta para no pasar MAX_TOTAL global
        left = max(0, MAX_TOTAL - total)
        if left <= 0:
            break
        frag = _trim(txt, min(left, 600))
        total += len(frag)
        chunks.append(f"[{i}] {title}\n{frag}")

    context = "\n\n".join(chunks) if chunks else "No hay contexto disponible."
    q = _trim(question or "Explica el concepto.", 400)

    system = (
        "Eres un profesor de primaria. Respondes en español claro para 6º grado de primaria, "
        "paso a paso, con ejemplos sencillos y sin tecnicismos innecesarios. "
        "Usa SOLO la información del contexto, y si algo no aparece, dilo, todo lo relacionado a matematicas nada de otros temas si hay algo asi indica que no estas configurado para ello"
    )
    user = (
        f"Grado: {grade} • Asignatura: {subject}\n\n"
        f"Pregunta del alumno:\n{q}\n\n"
        f"Contexto (cita con [n]):\n{context}\n\n"
        "Instrucciones:\n"
        "- Explica en 1–3 párrafos breves.\n"
        "- Incluye un ejemplo con números pequeños cuando aplique.\n"
        "- Cita las partes usadas con [n] (p.ej., “según [1]…”).\n"
        "- Si el contexto no cubre algo clave, dilo explícitamente."
    )
    # Para el endpoint `responses.create`, usaremos un input único concatenado
    return f"SYSTEM:\n{system}\n\nUSER:\n{user}"

def generate_with_rag(
    *,
    question: str,
    rag_items: List[Dict[str, str]],
    grade: str | None,
    subject: str | None,
) -> Dict[str, Any]:
    """
    Devuelve {"text": "..."} o levanta RuntimeError("LLM_TIMEOUT_OR_ERROR: ...") si algo falla/tarda.
    """
    if not settings.OPENAI_API_KEY:
        # Sin API key activada: devolvemos stub breve para no romper flujos
        txt = "No hay modelo LLM configurado. Usa el fragmento del currículo como guía."
        return {"text": txt}

    client = _client_lazy()
    prompt = _mk_prompt(question, rag_items, grade, subject)

    try:
        # Nuevo endpoint Responses
        resp = client.responses.create(
            model=settings.CHAT_LLM_MODEL,
            input=prompt,
            max_output_tokens=getattr(settings, "LLM_MAX_TOKENS", 320),
            temperature=getattr(settings, "LLM_TEMPERATURE", 0.3),
        )
        text = (getattr(resp, "output_text", None) or "").strip()
        return {"text": text}
    except Exception as e:
        # Lo captura chat.py y lo traduce a HTTP 504
        raise RuntimeError(f"LLM_TIMEOUT_OR_ERROR: {e}") from e
