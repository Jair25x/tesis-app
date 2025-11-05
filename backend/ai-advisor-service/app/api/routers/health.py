# app/api/routers/health.py
from fastapi import APIRouter
from starlette.responses import PlainTextResponse
from sqlalchemy import text
import os

from app.db.session import SessionLocal
from app.cache.redis_cache import redis_available

router = APIRouter(prefix="", tags=["health"])

# --- Probes simples (backward compatible) ---
@router.get("/healthz", include_in_schema=False, response_class=PlainTextResponse)
def healthz():
    # Liveness minimalista (no bloquea por dependencias)
    return "OK"


@router.get("/readyz", include_in_schema=False, response_model=None)
def readyz():
    """
    Readiness con chequeos reales:
    - DB (SELECT 1)
    - Redis (ping vía redis_available())
    """
    status_map: dict[str, str] = {"status": "ready"}

    # DB
    try:
        with SessionLocal() as db:
            db.execute(text("SELECT 1"))
        status_map["db"] = "ok"
    except Exception:
        status_map["db"] = "down"

    # Redis
    try:
        status_map["redis"] = "ok" if redis_available() else "down"
    except Exception:
        status_map["redis"] = "down"

    return status_map


# --- Actuator-style (homogéneo con Spring Boot) ---
def _actuator_health_payload():
    # Mismo formato que devuelve Spring cuando está UP
    return {"status": "UP", "groups": ["liveness", "readiness"]}


def _actuator_info_payload():
    return {
        "app": "ai-advisor-service",
        "version": os.getenv("APP_VERSION", "unknown"),
        "env": os.getenv("ENV", os.getenv("SPRING_PROFILES_ACTIVE", "dev")),
    }


@router.get("/actuator/health", tags=["actuator"])
def actuator_health():
    # Mantén esto minimalista para que nunca “tire abajo” por dependencias.
    # Los chequeos profundos siguen en /readyz.
    return _actuator_health_payload()


@router.get("/actuator/info", tags=["actuator"])
def actuator_info():
    return _actuator_info_payload()
