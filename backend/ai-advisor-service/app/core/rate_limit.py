# app/core/rate_limit.py
import functools
import logging
import os
import time
from typing import Callable, Optional, Tuple

import redis

from app.core.settings import settings

log = logging.getLogger("advisor.rate_limit")

# Estado global del RL
_redis_client: Optional[redis.Redis] = None
_rl_enabled: bool = False

def init_rate_limiter(redis_url: Optional[str] = None) -> bool:
    """
    Inicializa el cliente Redis para rate-limit. Devuelve True si queda habilitado.
    - Usa RATE_LIMIT_REDIS_URL, o cae a REDIS_URL si no se pasa explicitamente.
    - Fail-open si no hay URL o si falla la conexión (no bloquea el arranque).
    """
    global _redis_client, _rl_enabled

    url = (
        redis_url
        or os.getenv("RATE_LIMIT_REDIS_URL")
        or getattr(settings, "REDIS_URL", None)
    )

    if not url:
        log.warning("RateLimit: no hay RATE_LIMIT_REDIS_URL/REDIS_URL. Fail-open.")
        _redis_client = None
        _rl_enabled = False
        return False

    try:
        client = redis.from_url(
            url,
            decode_responses=True,
            socket_connect_timeout=0.2,
            socket_timeout=0.2,
            retry_on_timeout=False,
        )
        client.ping()
        _redis_client = client
        _rl_enabled = True
        log.info("RateLimit: conectado a Redis (%s).", url)
        return True
    except Exception as e:
        log.warning("RateLimit: no se pudo conectar a Redis (%s). Fail-open.", e)
        _redis_client = None
        _rl_enabled = False
        return False

def get_rate_limit_client() -> Optional[redis.Redis]:
    """Útil para diagnósticos."""
    return _redis_client

def _parse_rule(rule: str) -> Tuple[int, int]:
    """
    '20/minute' => (20, 60)
    '5/second'  => (5, 1)
    '100/hour'  => (100, 3600)
    """
    rule = (rule or "").strip().lower()
    if not rule or "/" not in rule:
        return 20, 60
    n_str, win = rule.split("/", 1)
    try:
        n = max(1, int(n_str))
    except Exception:
        n = 20
    win = win.strip()
    if win.startswith("sec"):
        w = 1
    elif win.startswith("min"):
        w = 60
    elif win.startswith("hour"):
        w = 3600
    else:
        w = 60
    return n, w

def rate_limit(rule: str = "20/minute"):
    """
    Decorador de rate-limit con fail-open:
    - Si no hay Redis o hay errores → no bloquea la request.
    - Bucket por ventana de tiempo; clave incluye user (AuthContext.sub) o IP si está disponible.
    """
    limit, window = _parse_rule(rule)

    def decorator(fn: Callable):
        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            # Si RL no está habilitado, no limita
            if not _rl_enabled or _redis_client is None:
                return fn(*args, **kwargs)

            # Construye clave base (fn + bucket temporal)
            now_bucket = int(time.time() // window)
            key_parts = [fn.__name__, str(now_bucket)]

            # Intenta identidad de usuario (AuthContext) o IP (si Request está en kwargs)
            user_id = None
            try:
                for v in kwargs.values():
                    if getattr(v, "__class__", None).__name__ == "AuthContext":
                        user_id = getattr(v, "sub", None) or getattr(v, "principal", None)
                        break
            except Exception:
                user_id = None

            if user_id:
                key_parts.append(f"user:{user_id}")
            else:
                try:
                    from fastapi import Request  # import perezoso
                    req = kwargs.get("request")
                    if isinstance(req, Request) and req.client:
                        key_parts.append(f"ip:{req.client.host}")
                except Exception:
                    pass

            key = "rl:" + ":".join(key_parts)

            try:
                n = _redis_client.incr(key)  # type: ignore
                if n == 1:
                    _redis_client.expire(key, window)  # type: ignore
                if n > limit:
                    from fastapi import HTTPException, status
                    raise HTTPException(
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                        detail=f"Rate limit exceeded: {limit}/{window}s",
                    )
            except Exception as e:
                # Fail-open SIEMPRE (prod/dev)
                log.warning("RateLimit error (%s). Fail-open.", e)

            return fn(*args, **kwargs)

        return wrapper

    return decorator

__all__ = ["rate_limit", "init_rate_limiter", "get_rate_limit_client"]
