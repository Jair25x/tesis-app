# app/main.py
import logging
import os
import inspect
import threading
import time
from typing import Tuple

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse, ORJSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from prometheus_client import generate_latest, CONTENT_TYPE_LATEST

from app.core.settings import settings
from app.api.routers import health
from app.api.routers import recommendations, chat, internal
from app.api.routers import diagnostic
from app.api.routers import retrieval
from app.api.routers import ml_admin
from app.api.routers import curriculum_debug
from app.api.routers import reco_debug, emb_debug
from app.api.routers import llm_debug, rag_debug

from app.core.logging import configure_logging
from app.observability.request_id import RequestIdMiddleware
from app.observability.logging_middleware import LoggingMiddleware
from app.core.rate_limit import init_rate_limiter

# ============================================================
#  Eureka (opcional) — se habilita si hay EUREKA_SERVER en env
# ============================================================
_EUREKA_ENABLED = bool(os.getenv("EUREKA_SERVER"))
if _EUREKA_ENABLED:
    try:
        from py_eureka_client import eureka_client  # type: ignore
    except Exception:  # pragma: no cover
        eureka_client = None  # type: ignore
        _EUREKA_ENABLED = False


def _eureka_register_compat(
    app_name: str,
    eureka_server: str,
    instance_host: str,
    instance_port: int,
    status_page_url: str,
    health_check_url: str,
    home_page_url: str,
    prefer_ip: bool,
    renewal_interval_in_secs: int,
    duration_in_secs: int,
    data_center_name: str,
    metadata: dict,
) -> Tuple[bool, str]:
    """
    Intenta registrar la instancia en Eureka usando la API disponible
    de py_eureka_client. Algunas versiones exponen `init_registry_client`,
    otras solo `init`. Filtramos kwargs por firma para no romper.
    """
    try:
        import py_eureka_client.eureka_client as pec  # type: ignore
    except Exception as e:  # pragma: no cover
        return False, f"py_eureka_client no disponible: {e}"

    fn = getattr(pec, "init_registry_client", None)
    if fn is None:
        fn = getattr(pec, "init", None)
    if fn is None:
        return False, "py_eureka_client no expone init_registry_client ni init"

    full_kwargs = dict(
        eureka_server=eureka_server,
        app_name=app_name,
        instance_host=instance_host,
        instance_port=instance_port,
        status_page_url=status_page_url,
        health_check_url=health_check_url,
        home_page_url=home_page_url,
        prefer_ip=prefer_ip,
        renewal_interval_in_secs=renewal_interval_in_secs,
        duration_in_secs=duration_in_secs,
        data_center_name=data_center_name,
        metadata=metadata,
    )

    try:
        sig = inspect.signature(fn)
        safe_kwargs = {k: v for k, v in full_kwargs.items() if k in sig.parameters}
        fn(**safe_kwargs)  # levanta heartbeats en background
        return True, f"registrado con {fn.__name__}"
    except Exception as e:
        return False, f"falló {getattr(fn, '__name__', 'init<?>')}: {e}"


def _spawn_eureka_registration():
    """
    Ejecuta el registro en Eureka en un hilo separado (sin event loop de Uvicorn),
    con reintentos. Evita 'Cannot run the event loop...' y es seguro para prod.
    """
    if not (_EUREKA_ENABLED and eureka_client is not None):
        return

    logger = logging.getLogger("uvicorn.error")

    def _runner():
        # Pequeña espera para dar tiempo a que levante la app
        time.sleep(0.8)

        instance_host = os.getenv("ADVISOR_HOST", "ai-advisor-service")
        instance_port = int(os.getenv("PORT", "8086"))
        app_name = os.getenv("EUREKA_APP_NAME", "AI-ADVISOR-SERVICE")
        eureka_server = os.getenv("EUREKA_SERVER", "")

        health_url = os.getenv("HEALTH_URL", f"http://{instance_host}:{instance_port}/healthz")
        status_url = os.getenv("STATUS_URL", health_url)
        home_url = os.getenv("HOME_URL", f"http://{instance_host}:{instance_port}/docs")

        prefer_ip = os.getenv("EUREKA_PREFER_IP", "false").lower() == "true"
        renewal = int(os.getenv("EUREKA_RENEWAL_INTERVAL", "10"))
        duration = int(os.getenv("EUREKA_DURATION", "30"))
        dc_name = os.getenv("EUREKA_DATACENTER", "MyOwn")

        attempts = int(os.getenv("EUREKA_MAX_ATTEMPTS", "6"))
        backoff = float(os.getenv("EUREKA_BACKOFF_SECONDS", "3.0"))

        for i in range(1, attempts + 1):
            ok, info = _eureka_register_compat(
                app_name=app_name,
                eureka_server=eureka_server,
                instance_host=instance_host,
                instance_port=instance_port,
                status_page_url=status_url,
                health_check_url=health_url,
                home_page_url=home_url,
                prefer_ip=prefer_ip,
                renewal_interval_in_secs=renewal,
                duration_in_secs=duration,
                data_center_name=dc_name,
                metadata={"version": "0.1.0", "env": settings.ENV},
            )
            if ok:
                logger.info(
                    "Eureka: %s (app=%s host=%s port=%s server=%s)",
                    info, app_name, instance_host, instance_port, eureka_server
                )
                return
            else:
                logger.warning("Eureka: intento %d/%d falló (%s)", i, attempts, info)
                time.sleep(backoff)

        logger.error("Eureka: no se pudo registrar tras %d intentos", attempts)

    t = threading.Thread(target=_runner, name="eureka-register", daemon=True)
    t.start()


def create_app() -> FastAPI:
    # Logging
    configure_logging(level="INFO" if settings.ENV.lower() != "prod" else "INFO")

    app = FastAPI(
        title="AI Advisor Service",
        version="0.1.0",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        default_response_class=ORJSONResponse,
    )

    # =============================
    # CORS: SOLO si NO hay gateway
    # =============================
    # Usa BEHIND_GATEWAY=true en docker-compose para producción/desarrollo con gateway.
    BEHIND_GATEWAY = os.getenv("BEHIND_GATEWAY", "true").lower() == "true"
    if not BEHIND_GATEWAY and settings.ENV.lower() != "prod":
        app.add_middleware(
            CORSMiddleware,
            allow_origins=settings.allowed_origins_list,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    # Observabilidad (request-id + access log + métricas)
    app.add_middleware(RequestIdMiddleware)
    app.add_middleware(LoggingMiddleware)

    # ===== Startup / Shutdown =====
    @app.on_event("startup")
    async def _startup():
        # Rate limit (Redis) con fail-open
        init_rate_limiter()

        # Registro Eureka en un hilo (evita conflictos con event loop)
        _spawn_eureka_registration()

    @app.on_event("shutdown")
    async def _shutdown():
        # Cierre de heartbeats si la lib lo expone
        if _EUREKA_ENABLED and eureka_client is not None:
            try:
                eureka_client.stop()  # type: ignore
            except Exception:
                pass

    # (Opcional) Forzar charset en /api/ai/*
    @app.middleware("http")
    async def _enforce_utf8_json(request: Request, call_next):
        try:
            if request.method in ("POST", "PUT", "PATCH") and request.url.path.startswith("/api/ai/"):
                ctype = (request.headers.get("content-type") or "").lower()
                if "application/json" in ctype and "charset=utf-8" not in ctype:
                    strict = bool(getattr(settings, "STRICT_JSON_UTF8", False))
                    if strict:
                        return ORJSONResponse(
                            status_code=415,
                            content={"detail": "Content-Type must be application/json; charset=utf-8"},
                        )
                    logging.getLogger("uvicorn.error").warning(
                        "non_utf8_json_client: ct=%s path=%s", ctype, str(request.url.path)
                    )
        except Exception:
            pass
        return await call_next(request)

    # Routers
    app.include_router(health.router)
    app.include_router(recommendations.router)
    app.include_router(chat.router)
    app.include_router(internal.router)
    app.include_router(diagnostic.router)
    app.include_router(retrieval.router)
    app.include_router(ml_admin.router)
    app.include_router(curriculum_debug.router)
    app.include_router(reco_debug.router)
    app.include_router(emb_debug.router)
    app.include_router(llm_debug.router)
    app.include_router(rag_debug.router)

    # Prometheus
    @app.get("/metrics")
    def metrics():
        return PlainTextResponse(generate_latest(), media_type=CONTENT_TYPE_LATEST)

    # Errores bonitos
    logger = logging.getLogger("uvicorn.error")

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        try:
            raw = (await request.body()).decode("utf-8", "ignore")
        except Exception:
            raw = "<unavailable>"
        logger.warning("request_validation_error: %s", exc.errors())
        return ORJSONResponse(
            status_code=422,
            content={
                "detail": "Invalid request body",
                "errors": exc.errors(),
                "path": str(request.url),
                "raw": raw[:2000],
            },
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        if exc.status_code == 400 and "parsing the body" in str(exc.detail).lower():
            try:
                raw = (await request.body()).decode("utf-8", "ignore")
            except Exception:
                raw = "<unavailable>"
            return ORJSONResponse(
                status_code=400,
                content={
                    "detail": "Bad JSON: could not parse request body",
                    "hint": "Revisa comillas, encoding UTF-8 y que sea JSON válido.",
                    "path": str(request.url),
                    "raw": raw[:2000],
                },
            )
        return ORJSONResponse(
            status_code=exc.status_code,
            content={"detail": str(exc.detail)},
        )

    # Debug bajo fricción
    @app.post("/_debug/echo")
    async def debug_echo(request: Request):
        raw = (await request.body()).decode("utf-8", "ignore")
        try:
            as_json = await request.json()
        except Exception:
            as_json = None
        return {"headers": dict(request.headers), "raw": raw, "json": as_json}

    return app


app = create_app()
