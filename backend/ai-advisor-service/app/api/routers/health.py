# app/api/routers/health.py
from fastapi import APIRouter
from starlette.responses import PlainTextResponse
from sqlalchemy import text

from app.db.session import SessionLocal
from app.cache.redis_cache import get_redis, redis_available

router = APIRouter(prefix="", tags=["health"])


@router.get("/healthz", include_in_schema=False, response_class=PlainTextResponse)
def healthz():
    return "OK"


@router.get("/readyz", include_in_schema=False, response_model=None)
def readyz():
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
        if redis_available():
            status_map["redis"] = "ok"
        else:
            # Si hay REDIS_URL pero falla el ping, redis_available() dará False
            status_map["redis"] = "down"
    except Exception:
        status_map["redis"] = "down"

    return status_map
