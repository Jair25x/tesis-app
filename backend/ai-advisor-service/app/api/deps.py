# app/api/deps.py
from __future__ import annotations
from typing import Generator
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.core.settings import settings
from app.cache.redis_cache import get_redis  # reexport
from app.services.clients.curriculum_client import CurriculumClient
from app.services.clients.progress_client import ProgressClient
from app.services.clients.s2s import mint_internal_jwt

# --- Sesión de DB ---
def get_session() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_db() -> Generator[Session, None, None]:
    yield from get_session()

def get_curriculum_client() -> CurriculumClient:
    """
    Cliente para curriculum-service con S2S real y timeouts razonables.
    """
    return CurriculumClient(
        base_url=settings.CURRICULUM_BASE_URL,
        s2s_token_provider=lambda: mint_internal_jwt(roles=("INTERNAL", "ROLE_INTERNAL")),
        timeout=5.0,
    )

def get_progress_client() -> ProgressClient:
    return ProgressClient(
        base_url=settings.PROGRESS_BASE_URL,
        s2s_token_provider=lambda: mint_internal_jwt(roles=("INTERNAL","ROLE_INTERNAL")),
        timeout=5.0,
    )
