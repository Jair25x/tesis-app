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
from .config import (
    ALLOWED_ORIGINS, EUREKA_SERVER, EUREKA_APP_NAME, DUELS_HOST, PORT,
    HEALTH_URL, HOME_URL, EUREKA_PREFER_IP, EUREKA_RENEWAL, EUREKA_DURATION,
    EUREKA_DATACENTER,
)

# --- Sweeper imports ---
from .tasks.waiting_cleanup import waiting_sweeper
from .deps import SessionLocal  # factory de sesiones

APP_NAME = "duels-service"
APP_VERSION = "0.1.0"

app = FastAPI(title=APP_NAME, version=APP_VERSION)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(http_router.router)
app.include_router(ws_router.router)
app.include_router(reports.router)

# Health & Metrics
@app.get("/healthz", include_in_schema=False)
async def healthz():
    return {"status": "ok"}

@app.get("/metrics", include_in_schema=False)
async def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)

# Eureka (opcional)
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
        fn = getattr(ec, "init_registry_client", None)
        if fn is None:
            fn = getattr(ec, "init", None)
        if fn is None:
            raise RuntimeError("py_eureka_client no expone init ni init_registry_client")

        kwargs = dict(
            eureka_server=EUREKA_SERVER,
            app_name=EUREKA_APP_NAME,
            instance_host=DUELS_HOST,
            instance_port=PORT,
            status_page_url=HEALTH_URL,
            health_check_url=HEALTH_URL,
            home_page_url=HOME_URL,
            prefer_ip=EUREKA_PREFER_IP,
            prefer_ip_address=EUREKA_PREFER_IP,
            renewal_interval_in_secs=EUREKA_RENEWAL,
            duration_in_secs=EUREKA_DURATION,
            data_center_name=EUREKA_DATACENTER,
            metadata={"version": APP_VERSION},
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

# ====== BACKGROUND: waiting sweeper ======
app.state._duels_stop_event = asyncio.Event()
app.state._duels_bg_task = None

def _db_factory():
    return SessionLocal()

@app.on_event("startup")
async def on_startup():
    # Eureka
    await _register_eureka()
    # Sweeper (no bloquea el arranque)
    async def _runner():
        await waiting_sweeper(_db_factory, app.state._duels_stop_event)
    app.state._duels_bg_task = asyncio.create_task(_runner())

@app.on_event("shutdown")
async def on_shutdown():
    # Detener sweeper
    try:
        app.state._duels_stop_event.set()
        if app.state._duels_bg_task:
            await asyncio.wait_for(app.state._duels_bg_task, timeout=5)
    except Exception:
        pass
    # Detener eureka
    with contextlib.suppress(Exception):
        if 'ec' in globals() and ec is not None:
            ec.stop()  # type: ignore
