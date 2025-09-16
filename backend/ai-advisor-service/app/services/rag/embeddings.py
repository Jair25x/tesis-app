# app/services/rag/embeddings.py
from __future__ import annotations

import hashlib
import math
from typing import List

from app.core.settings import settings

# OpenAI client es lazy y opcional (solo si hay API key)
_openai_client = None

DIM = 1536  # coherente con text-embedding-3-small

def _stub_vector(text: str) -> List[float]:
    """
    Embedding determinístico de respaldo para entornos sin OPENAI_API_KEY.
    Útil en CI o offline; NO usar para ranking real en prod.
    """
    import hashlib as _hh, math as _mm
    h = _hh.sha256((text or ".").encode("utf-8")).digest()
    vals = [0.0] * DIM
    for i, b in enumerate(h):
        vals[i % DIM] += (b - 128) / 128.0
    norm = _mm.sqrt(sum(v * v for v in vals)) or 1.0
    return [v / norm for v in vals]

def _client_lazy():
    """
    Construye el cliente OpenAI con timeout corto.
    """
    global _openai_client
    if _openai_client is None:
        try:
            from openai import OpenAI
            # Timeout por request (segundos). Si se excede, lanzamos RuntimeError controlado.
            _openai_client = OpenAI(timeout=getattr(settings, "EMB_REQUEST_TIMEOUT", 6))
        except Exception as e:
            # Si falla el import u otra cosa, dejamos None y caeremos a stub
            _openai_client = None
    return _openai_client

def get_query_embedding(text: str) -> List[float]:
    """
    Devuelve embedding del texto.
    - Si hay OPENAI_API_KEY: usa OpenAI con timeout corto.
    - Si no hay key: usa stub determinístico (para no romper flujos en dev/CI).
    - Si OpenAI tarda o falla: lanza RuntimeError con prefijo EMBEDDINGS_* para que el endpoint responda 504.
    """
    txt = (text or "").strip() or "."

    # ¿Tenemos API key? -> intenta OpenAI
    if getattr(settings, "OPENAI_API_KEY", None):
        try:
            client = _client_lazy()
            if client is None:
                # improbable, pero por si el import falló
                return _stub_vector(txt)

            # Puedes setear settings.OPENAI_EMBED_MODEL = "text-embedding-3-small"
            # y opcionalmente settings.OPENAI_API_BASE si usas endpoint alternativo (Azure, proxy, etc.)
            # El SDK toma la API key/base del entorno automáticamente.
            r = client.embeddings.create(
                model=settings.OPENAI_EMBED_MODEL,
                input=txt,
            )
            vec = r.data[0].embedding  # type: ignore[attr-defined]
            # Aseguramos lista nativa de float
            return list(vec)
        except Exception as e:
            # Cualquier error de red/timeout -> propagamos con firma para 504
            raise RuntimeError(f"EMBEDDINGS_TIMEOUT_OR_ERROR: {e}") from e

    # Sin API key -> stub
    return _stub_vector(txt)

def get_embeddings(texts: List[str]) -> List[List[float]]:
    """
    Wrapper por compatibilidad: múltiple entrada -> lista de embeddings.
    """
    texts = texts or []
    return [get_query_embedding(t) for t in texts]
