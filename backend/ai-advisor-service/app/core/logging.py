# app/core/logging.py
from __future__ import annotations

import logging
import sys
import structlog
from app.observability.request_id import get_request_id


def _add_request_id(logger, method_name, event_dict):
    rid = get_request_id()
    if rid:
        event_dict["request_id"] = rid
    return event_dict


def configure_logging(level: str = "INFO") -> None:
    """
    Configura logging estructurado en JSON para app y uvicorn.
    Incluye nivel, timestamp, módulo y request_id si existe.
    """
    logging.basicConfig(
        level=getattr(logging, level.upper(), logging.INFO),
        format="%(message)s",
        stream=sys.stdout,
    )

    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,  # merge contextvars si usas bind()
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.stdlib.add_log_level,
            _add_request_id,
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.JSONRenderer(),
        ],
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

    # Reduce verbosidad de algunos loggers ruidosos (opcional)
    logging.getLogger("uvicorn.error").setLevel(logging.INFO)
    logging.getLogger("uvicorn.access").setLevel(logging.INFO)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
