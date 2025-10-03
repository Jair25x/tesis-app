# app/main.py
from __future__ import annotations

import os
import asyncio
import logging
import contextlib

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from prometheus_client import CONTENT_TYPE_LATEST, generate_latest

from .routers import http as http_router, ws as ws_router
from .routers import reports
# =========================
#  App base
# =========================
APP_NAME = "duels-service"
APP_VERSION = "0.1.0"

app = FastAPI(title=APP_NAME, version=APP_VERSION)

# =========================
#  CORS (útil en local)
#  Si vas siempre por Gateway, lo puedes dejar igual sin problema.
# =========================
ALLOWED_ORIGINS = [o.strip() for o in (os.getenv("ALLOWED_ORIGINS", "http://localhost:5173") or "").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
#  Routers
# =========================
app.include_router(http_router.router)
app.include_router(ws_router.router)
app.include_router(reports.router)

# =========================
#  Health & Metrics
# =========================
@app.get("/healthz", include_in_schema=False)
async def healthz():
    return {"status": "ok"}

@app.get("/metrics", include_in_schema=False)
async def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)

# =========================
#  Eureka (opcional pero recomendado para homogeneidad)
#  Compat: intenta init_registry_client y si no existe, usa init.
# =========================
EUREKA_SERVER = os.getenv("EUREKA_SERVER", "")  # ej: http://eureka-server:8761/eureka/
EUREKA_APP_NAME = os.getenv("EUREKA_APP_NAME", "DUELS-SERVICE")

DUELS_HOST = os.getenv("DUELS_HOST", "duels-service")
PORT = int(os.getenv("PORT", "8087"))
HEALTH_URL = os.getenv("HEALTH_URL", f"http://{DUELS_HOST}:{PORT}/healthz")
HOME_URL = os.getenv("HOME_URL", f"http://{DUELS_HOST}:{PORT}/docs")

EUREKA_PREFER_IP = (os.getenv("EUREKA_PREFER_IP", "false").lower() in ("1", "true", "yes"))
EUREKA_RENEWAL = int(os.getenv("EUREKA_RENEWAL_INTERVAL", "10"))
EUREKA_DURATION = int(os.getenv("EUREKA_DURATION", "30"))
EUREKA_DATACENTER = os.getenv("EUREKA_DATACENTER", "MyOwn")
EUREKA_METADATA = {"env": os.getenv("ENV", "dev"), "version": APP_VERSION}

try:
    import py_eureka_client.eureka_client as ec  # type: ignore
except Exception:
    ec = None  # Si no está instalado, se omite

async def _register_eureka():
    logger = logging.getLogger("uvicorn.error")

    if not EUREKA_SERVER:
        logger.info("Eureka deshabilitado (EUREKA_SERVER vacío).")
        return
    if ec is None:
        logger.info("py-eureka-client no disponible; omito registro en Eureka.")
        return

    def _do_register():
        # Compat: usa la función disponible y filtra kwargs por firma.
        fn = getattr(ec, "init_registry_client", None)
        if fn is None:
            fn = getattr(ec, "init", None)
        if fn is None:
            raise RuntimeError("py_eureka_client no expone init ni init_registry_client")

        kwargs = dict(
            eureka_server=EUREKA_SERVER,
            app_name=EUREKA_APP_NAME,
            # nombres de parámetros varían entre versiones; filtramos con la firma real
            instance_host=DUELS_HOST,
            instance_port=PORT,
            status_page_url=HEALTH_URL,
            health_check_url=HEALTH_URL,
            home_page_url=HOME_URL,
            prefer_ip=EUREKA_PREFER_IP,              # algunas versiones usan 'prefer_ip'
            prefer_ip_address=EUREKA_PREFER_IP,      # otras usan 'prefer_ip_address'
            renewal_interval_in_secs=EUREKA_RENEWAL,
            duration_in_secs=EUREKA_DURATION,
            data_center_name=EUREKA_DATACENTER,
            metadata=EUREKA_METADATA,
        )

        import inspect
        sig = inspect.signature(fn)
        safe = {k: v for k, v in kwargs.items() if k in sig.parameters}
        return fn(**safe)

    try:
        await asyncio.to_thread(_do_register)
        logger.info("Eureka: registro OK (app=%s server=%s)", EUREKA_APP_NAME, EUREKA_SERVER)
    except Exception as e:
        logger.warning("Eureka: no se pudo registrar: %s", e)

# =========================
#  Lifecycle
# =========================
@app.on_event("startup")
async def on_startup():
    # Registro Eureka (no bloquea el arranque)
    await _register_eureka()

@app.on_event("shutdown")
async def on_shutdown():
    with contextlib.suppress(Exception):
        if ec is not None:
            ec.stop()  # type: ignore
