# app/observability/logging_middleware.py
from __future__ import annotations

import time
import structlog
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from app.observability.metrics import http_requests_total, http_request_duration_seconds


logger = structlog.get_logger("access")


class LoggingMiddleware(BaseHTTPMiddleware):
    """
    Registra cada request con:
      - método, path plantilla (si disponible), status, duración.
    Y alimenta métricas Prometheus de requests y latencias.
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
            # Intentar path template ("/api/ai/recommendations/students/me")
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

            # Log JSON
            logger.info(
                "http_request",
                method=request.method,
                path=path_template,
                status=status_code,
                duration_ms=round(duration * 1000, 3),
            )
