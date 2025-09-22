# app/services/clients/s2s.py
from __future__ import annotations
import time
from typing import Sequence
import jwt  # PyJWT

from app.core.settings import settings

_DEFAULT_ROLES: Sequence[str] = ("ROLE_INTERNAL",)

def mint_internal_jwt(
    *,
    subject: str | None = None,
    roles: Sequence[str] = _DEFAULT_ROLES,
    issuer: str | None = None,
    ttl_seconds: int | None = None,
) -> str:
    """
    Firma un JWT HS256 con S2S_JWT_SECRET para llamadas S2S.
    Compatible con filtros S2S en tus MS Spring.
    """
    secret = settings.S2S_JWT_SECRET
    if not secret:
        return ""

    now = int(time.time())
    iss = issuer or settings.S2S_JWT_ISSUER or "ai-advisor-service"
    sub = subject or iss
    ttl = int(ttl_seconds or settings.S2S_JWT_TTL_SECONDS or 120)

    # Asegurar prefijo ROLE_
    norm_roles = [r if str(r).upper().startswith("ROLE_") else f"ROLE_{r}".upper() for r in (roles or [])]

    payload = {
        "iss": iss,
        "sub": sub,
        "roles": norm_roles,
        "authorities": norm_roles,  # compatibilidad con filtros que leen authorities
        "scope": "internal",
        "iat": now,
        "exp": now + ttl,
    }
    return jwt.encode(payload, secret, algorithm="HS256")

# Alias legacy
def mint_s2s_jwt(roles: Sequence[str] | None = None) -> str:
    return mint_internal_jwt(roles=roles or _DEFAULT_ROLES)
