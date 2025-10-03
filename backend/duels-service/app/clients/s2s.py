# app/clients/s2s.py
from __future__ import annotations
import time
import jwt
from typing import Iterable, Dict, Any
from ..config import S2S_JWT_SECRET, S2S_JWT_ISSUER

_ALG = "HS256"  # ← alinea con Spring y tus otros clientes

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
