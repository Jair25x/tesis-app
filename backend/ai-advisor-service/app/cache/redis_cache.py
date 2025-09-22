# app/cache/redis_cache.py
from __future__ import annotations

from typing import Optional, Any
import json
from datetime import timedelta

import redis  # pip install redis==5.x
from app.core.settings import settings

# Singleton simple por proceso (cada worker tendrá su cliente)
_redis_client: Optional[redis.Redis] = None


def get_redis() -> redis.Redis:
    """
    Devuelve un cliente Redis ya inicializado usando REDIS_URL.
    Lanza RuntimeError si REDIS_URL no está configurada.
    """
    global _redis_client
    if _redis_client is not None:
        return _redis_client

    if not settings.REDIS_URL:
        raise RuntimeError("REDIS_URL no está configurada")

    _redis_client = redis.from_url(
        settings.REDIS_URL,
        decode_responses=True,          # strings en lugar de bytes
        socket_connect_timeout=3,       # tiempo de conexión
        socket_timeout=3,               # tiempo de operación
        health_check_interval=30,       # PING de salud
        retry_on_timeout=True,
    )
    return _redis_client


def redis_available() -> bool:
    """
    True si podemos conectar y hacer PING.
    Útil para readiness sin lanzar excepciones.
    """
    try:
        r = get_redis()
        return bool(r.ping())
    except Exception:
        return False


# -------- Helpers JSON (cache-aside) --------

def cache_set_json(key: str, value: Any, ttl_seconds: int) -> None:
    try:
        r = get_redis()
        r.setex(key, timedelta(seconds=ttl_seconds), json.dumps(value, ensure_ascii=False))
    except Exception:
        # fail-open
        pass

def cache_get_json(key: str) -> Optional[Any]:
    try:
        r = get_redis()
        raw = r.get(key)
        if not raw:
            return None
        return json.loads(raw)
    except Exception:
        return None
