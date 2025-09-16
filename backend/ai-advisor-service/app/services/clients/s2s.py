# app/services/clients/s2s.py
from __future__ import annotations
import time
from typing import Sequence
import jwt  # PyJWT

from app.core.settings import settings

_DEFAULT_ROLES: Sequence[str] = ("INTERNAL", "ROLE_INTERNAL")

def mint_internal_jwt(
    *,
    subject: str | None = None,
    roles: Sequence[str] = _DEFAULT_ROLES,
    issuer: str | None = None,
    ttl_seconds: int | None = None,
) -> str:
    """
    Firma un JWT HS256 con S2S_JWT_SECRET para llamadas S2S a otros MS.
    Compatible con el JwtAuthenticationFilter del curriculum-service.
    """
    secret = settings.S2S_JWT_SECRET
    if not secret:
        return ""  # sin secreto => no mandes Authorization (el MS destino responderá 401)

    now = int(time.time())
    payload = {
        "sub": subject or settings.S2S_JWT_ISSUER or "ai-advisor-service",
        "roles": list(roles),
        "authorities": list(roles),
        "iss": issuer or settings.S2S_JWT_ISSUER or "ai-advisor-service",
        "iat": now,
        "exp": now + int(ttl_seconds or settings.S2S_JWT_TTL_SECONDS or 120),
    }
    return jwt.encode(payload, secret, algorithm="HS256")

# Alias legacy
def mint_s2s_jwt(roles: Sequence[str] | None = None) -> str:
    return mint_internal_jwt(roles=roles or _DEFAULT_ROLES)
