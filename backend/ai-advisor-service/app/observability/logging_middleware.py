# app/observability/logging_middleware.py
from __future__ import annotations

import time
from typing import Dict
import structlog
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from app.observability.metrics import http_requests_total, http_request_duration_seconds
from app.core.settings import settings

logger = structlog.get_logger("access")

SENSITIVE_HEADERS = {"authorization", "cookie", "set-cookie", "x-api-key"}

def _scrub_headers(headers: Dict[str, str]) -> Dict[str, str]:
    out: Dict[str, str] = {}
    for k, v in headers.items():
        kl = k.lower()
        out[k] = "<redacted>" if kl in SENSITIVE_HEADERS else v
    return out


class LoggingMiddleware(BaseHTTPMiddleware):
    """
    - Mide requests/latencias (Prometheus).
    - Loguea método, path plantilla, status y duración.
    - Redacta cabeceras sensibles siempre.
    - No loguea body (reduce riesgo); si lo quisieras, hazlo solo en dev.
    """
    async def dispatch(self, request: Request, call_next):
        start = time.perf_counter()
        status_code = 500
        try:
            response = await call_next(request)
            status_code = response.status_code
            return response
        finally:
            duration = time.perf_counter() - start
            route = request.scope.get("route")
            path_template = getattr(route, "path_format", None) or getattr(route, "path", None) or request.url.path

            # Métricas
            http_requests_total.labels(
                method=request.method,
                path=path_template,
                status=str(status_code),
            ).inc()
            http_request_duration_seconds.labels(
                method=request.method,
                path=path_template,
                status=str(status_code),
            ).observe(duration)

            # Cabeceras redactadas solo en dev (para no ruido en prod)
            extra_headers = None
            try:
                if (settings.ENV or "dev").lower() != "prod":
                    extra_headers = _scrub_headers(dict(request.headers))
            except Exception:
                extra_headers = None

            logger.info(
                "http_request",
                method=request.method,
                path=path_template,
                status=status_code,
                duration_ms=round(duration * 1000, 3),
                headers=extra_headers,  # None en prod
            )
