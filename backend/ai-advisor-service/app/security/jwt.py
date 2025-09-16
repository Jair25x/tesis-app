# app/security/jwt.py
from __future__ import annotations

import base64
from typing import Iterable, Any, Sequence
from uuid import UUID

import jwt
from fastapi import HTTPException, status

from app.core.settings import settings


ALGS: Sequence[str] = ("HS256",)


def _build_secret_bytes(secret_str: str) -> bytes:
    """
    Acepta secretos en Base64 (como en JJWT/Java) o texto plano.
    Si la decodificación base64 falla, usa UTF-8 del string.
    """
    if not secret_str:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="JWT secret not configured")

    try:
        # validate=True fuerza error si no es base64 válido
        raw = base64.b64decode(secret_str, validate=True)
        # Si la decodificación produce bytes razonables, los usamos.
        # HS256 recomienda >= 32 bytes de entropía.
        if len(raw) >= 32:
            return raw
        # Si es muy corto, probablemente no era base64 "real" o es débil; caemos a utf-8
    except Exception:
        pass
    return secret_str.encode("utf-8")


def decode_jwt(token: str, secret: str) -> dict[str, Any]:
    """
    Decodifica y valida un JWT HS256. Acepta secretos en base64 o texto plano.
    Verifica 'exp' si existe. No verifica 'aud' ni 'iss' (puedes agregarlo si lo necesitas).
    """
    try:
        decoded = jwt.decode(
            token,
            _build_secret_bytes(secret),
            algorithms=list(ALGS),
            options={"verify_aud": False},
            leeway=60,  # tolerancia de reloj
        )
        return decoded  # type: ignore[return-value]
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expirado")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Token inválido: {e}")


def normalize_role(role: str | None) -> str:
    if not role:
        return ""
    r = role.strip().upper()
    return r if r.startswith("ROLE_") else f"ROLE_{r}"


def extract_roles(raw: Any) -> list[str]:
    """
    Acepta: lista/tupla (['ROLE_STUDENT', ...]) o CSV ('ROLE_STUDENT,ROLE_TEACHER').
    """
    if raw is None:
        return []
    if isinstance(raw, (list, tuple, set)):
        return [normalize_role(str(x)) for x in raw if x is not None]
    # Fallback CSV
    s = str(raw).strip()
    if not s:
        return []
    return [normalize_role(x) for x in s.split(",") if x.strip()]


def verify_roles(claims_or_roles: dict[str, Any] | Sequence[str], allowed: Iterable[str]) -> None:
    """
    Verifica que exista al menos un rol permitido en el set del usuario.
    Acepta un dict de claims (con 'roles') o directamente una secuencia de roles.
    """
    allowed_norm = {normalize_role(a) for a in allowed}
    if isinstance(claims_or_roles, dict):
        user_roles = set(extract_roles(claims_or_roles.get("roles")))
    else:
        user_roles = set(normalize_role(r) for r in claims_or_roles)
    if not (allowed_norm & user_roles):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acceso denegado (roles insuficientes)")


def pick_principal(claims: dict[str, Any]) -> str:
    """
    Principal preferido: 'userId' (UUID en tu dominio) o 'sub'.
    """
    principal = claims.get("userId") or claims.get("sub")
    if not principal or not str(principal).strip():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Principal no disponible en el token")
    return str(principal).strip()


def parse_principal_uuid_or_forbid(principal: str) -> UUID:
    try:
        return UUID(str(principal))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Principal inválido (se esperaba UUID)",
        )


def verify_bearer(authorization_header: str, secret: str) -> dict[str, Any]:
    """
    Compatibilidad con tu código actual en routers: extrae el token Bearer y decodifica.
    """
    if not authorization_header or not authorization_header.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Bearer token requerido")
    token = authorization_header.split(" ", 1)[1].strip()
    return decode_jwt(token, secret)


def resolve_public_secret() -> str:
    """
    Devuelve el secreto a usar para tokens 'públicos' (FE).
    Si no existe PUBLIC_JWT_SECRET, cae al S2S para entornos de dev/local.
    """
    return settings.PUBLIC_JWT_SECRET or settings.S2S_JWT_SECRET


def resolve_s2s_secret() -> str:
    """Secreto para tokens S2S (internos)."""
    return settings.S2S_JWT_SECRET


def pick_effective_user(
    *,
    principal_from_headers: str | None,
    principal_from_claims: str | None,
    act_as_user_header: str | None,
    caller_roles: list[str],
) -> str:
    """
    Determina el usuario efectivo de la llamada.
    - Si hay X-Act-As-User y el llamante tiene ROLE_INTERNAL -> usa ese valor (impersonación controlada).
    - Si no, usa principal de headers (gateway) o de claims (Bearer).
    """
    roles_norm = [normalize_role(r) for r in caller_roles]
    if act_as_user_header and "ROLE_INTERNAL" in roles_norm:
        return act_as_user_header.strip()

    if principal_from_headers and principal_from_headers.strip():
        return principal_from_headers.strip()

    if principal_from_claims and principal_from_claims.strip():
        return principal_from_claims.strip()

    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No se pudo determinar el usuario efectivo")
