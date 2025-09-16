# app/cache/redis_cache.py
from __future__ import annotations

from typing import Optional

import redis  # pip install redis==5.x
from app.core.settings import settings

# Singleton simple por proceso (cada worker de Gunicorn tendrá su cliente)
_redis_client: Optional[redis.Redis] = None


def get_redis() -> redis.Redis:
    """
    Devuelve un cliente Redis ya inicializado usando REDIS_URL.
    Lanza RuntimeError si REDIS_URL no está configurado.
    """
    global _redis_client
    if _redis_client is not None:
        return _redis_client

    if not settings.REDIS_URL:
        raise RuntimeError("REDIS_URL no está configurada")

    # Parámetros prudentes para prod
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
