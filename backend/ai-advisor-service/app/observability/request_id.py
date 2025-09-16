# app/observability/request_id.py
from __future__ import annotations

from uuid import uuid4
from contextvars import ContextVar
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

_request_id_ctx: ContextVar[str | None] = ContextVar("request_id", default=None)


def get_request_id() -> str | None:
    return _request_id_ctx.get()


class RequestIdMiddleware(BaseHTTPMiddleware):
    """
    Garantiza que cada request tenga un X-Request-Id:
    - Si el cliente envía uno, lo reutiliza.
    - Si no, genera UUID4.
    Propaga el valor en un contextvar para logging y lo devuelve en la respuesta.
    """
    def __init__(self, app, header_name: str = "X-Request-Id"):
        super().__init__(app)
        self.header_name = header_name

    async def dispatch(self, request: Request, call_next):
        rid = request.headers.get(self.header_name) or str(uuid4())
        token = _request_id_ctx.set(rid)
        try:
            response: Response = await call_next(request)
            response.headers[self.header_name] = rid
            return response
        finally:
            _request_id_ctx.reset(token)
