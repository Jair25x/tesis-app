# app/clients/s2s.py
from __future__ import annotations
import time
import jwt
from typing import Iterable, Dict, Any
from ..config import S2S_JWT_SECRET, S2S_JWT_ISSUER

_ALG = "HS256"  # alineado con Spring Security

def s2s_token(
    *,
    subject: str = "duels-service",
    authorities: Iterable[str] = ("ROLE_INTERNAL",),
    ttl_seconds: int = 300,
    extra_claims: Dict[str, Any] | None = None,
) -> str:
    now = int(time.time())
    claims: Dict[str, Any] = {
        "sub": subject,
        "iss": S2S_JWT_ISSUER,
        "iat": now,
        "exp": now + ttl_seconds,
        "authorities": list(authorities),
        "roles": list(authorities),
    }
    if extra_claims:
        claims.update(extra_claims)
    return jwt.encode(claims, S2S_JWT_SECRET, algorithm=_ALG)

def mint_internal_jwt(
    *,
    roles: Iterable[str] = ("ROLE_INTERNAL",),
    subject: str = "duels-service",
    ttl_seconds: int = 300,
    extra_claims: Dict[str, Any] | None = None,
) -> str:
    """
    Para emitir un JWT interno coherente con filtros S2S de Spring. Documentalo no te olvidess
    """
    return s2s_token(subject=subject, authorities=roles, ttl_seconds=ttl_seconds, extra_claims=extra_claims)
