# app/security/authz.py
from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, Any
import logging

from fastapi import Header, HTTPException, status

from app.security.jwt import (
    extract_roles,
    normalize_role,
    pick_principal,
    verify_bearer,
    verify_roles,
    resolve_public_secret,
    resolve_s2s_secret,
    pick_effective_user,
)

logger = logging.getLogger(__name__)


@dataclass
class AuthContext:
    principal: str
    roles: list[str]
    claims: dict[str, Any]
    source: str  # 'internal-headers' | 'public-bearer' | 's2s-bearer'


def _from_internal_headers(
    *,
    x_auth_roles: str | None,
    x_auth_username: str | None,
    x_user_id: str | None,
) -> tuple[list[str], str | None]:
    """
    Convierte cabeceras del gateway a (roles, principal).
    Prioriza x-user-id; si no, usa X-Auth-Username.
    """
    roles = extract_roles(x_auth_roles or "")
    principal = (x_user_id or x_auth_username or "").strip() or None
    return roles, principal


def authorize_request(
    *,
    authorization: str | None,
    x_internal_call: str | None,
    x_auth_roles: str | None,
    x_auth_username: str | None,
    x_user_id: str | None,
    x_act_as_user: str | None,
    allowed_roles: Iterable[str],
    prefer_public: bool,
) -> AuthContext:
    """
    Estrategia robusta:
    1) Si hay X-Internal-Call, intentamos headers internos del gateway.
       - Si roles y principal están OK -> se usa ese camino.
       - Si faltan o vienen vacíos -> Fallback automático a Bearer (no 403 directo).
    2) Si no hay X-Internal-Call, validamos Bearer normal.
    """

    # Materializamos allowed_roles por si nos pasan un generador y para logging.
    allowed_list = list(allowed_roles)

    # 1) Camino interno por headers del gateway (preferido cuando estén completos)
    if x_internal_call:
        roles_hdr, principal_hdr = _from_internal_headers(
            x_auth_roles=x_auth_roles,
            x_auth_username=x_auth_username,
            x_user_id=x_user_id,
        )
        if roles_hdr and principal_hdr:
            try:
                verify_roles(roles_hdr, allowed_list)
            except HTTPException as exc:
                logger.warning(
                    "AUTHZ_INTERNAL_HEADERS_ROLES_FAIL roles=%s allowed=%s detail=%s",
                    roles_hdr,
                    allowed_list,
                    getattr(exc, "detail", None),
                )
                raise

            principal = pick_effective_user(
                principal_from_headers=principal_hdr,
                principal_from_claims=None,
                act_as_user_header=x_act_as_user,
                caller_roles=roles_hdr,
            )
            return AuthContext(
                principal=principal,
                roles=[normalize_role(r) for r in roles_hdr],
                claims={},  # sin JWT en este camino
                source="internal-headers",
            )
        # Si llega X-Internal-Call pero sin roles/principal, caemos a Bearer 👇

    # 2) Camino por Bearer (público o s2s según prefer_public)
    secret = resolve_public_secret() if prefer_public else resolve_s2s_secret()
    if not authorization or not authorization.lower().startswith("bearer "):
        logger.warning(
            "AUTHZ_MISSING_BEARER x_internal_call=%s allowed=%s prefer_public=%s",
            bool(x_internal_call),
            allowed_list,
            prefer_public,
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Bearer token requerido",
        )

    try:
        claims = verify_bearer(authorization, secret)
    except HTTPException as exc:
        logger.warning(
            "AUTHZ_BEARER_FAIL prefer_public=%s detail=%s",
            prefer_public,
            getattr(exc, "detail", None),
        )
        raise

    roles = extract_roles(claims.get("roles"))

    try:
        verify_roles(roles, allowed_list)
    except HTTPException as exc:
        logger.warning(
            "AUTHZ_BEARER_ROLES_FAIL roles=%s allowed=%s prefer_public=%s detail=%s",
            roles,
            allowed_list,
            prefer_public,
            getattr(exc, "detail", None),
        )
        raise

    principal_claims = pick_principal(claims)
    principal = pick_effective_user(
        principal_from_headers=x_user_id or x_auth_username,  # opcional
        principal_from_claims=principal_claims,
        act_as_user_header=x_act_as_user,
        caller_roles=roles,
    )
    return AuthContext(
        principal=principal,
        roles=[normalize_role(r) for r in roles],
        claims=claims,
        source="public-bearer" if prefer_public else "s2s-bearer",
    )


# --------- Dependencias listas para usar en routers --------- #

def require_public_roles(*allowed: str):
    """
    Para endpoints públicos (p.ej., /api/ai/**). Usa PUBLIC_JWT_SECRET si existe; si no, cae a S2S.
    Uso en router:
      @router.get("/algo")
      def endpoint(ctx: AuthContext = Depends(require_public_roles("ROLE_STUDENT"))): ...
    """
    allowed = tuple(normalize_role(a) for a in allowed)

    def _dep(
        authorization: str = Header(default=None, alias="Authorization"),
        x_internal_call: str = Header(default=None, alias="X-Internal-Call"),
        x_auth_roles: str = Header(default=None, alias="X-Auth-Roles"),
        x_auth_username: str = Header(default=None, alias="X-Auth-Username"),
        x_user_id: str = Header(default=None, alias="x-user-id"),
        x_act_as_user: str = Header(default=None, alias="X-Act-As-User"),
    ) -> AuthContext:
        return authorize_request(
            authorization=authorization,
            x_internal_call=x_internal_call,
            x_auth_roles=x_auth_roles,
            x_auth_username=x_auth_username,
            x_user_id=x_user_id,
            x_act_as_user=x_act_as_user,
            allowed_roles=allowed,
            prefer_public=True,
        )

    return _dep


def require_internal(*allowed: str):
    """
    Para endpoints internos (/internal/**). Requiere ROLE_INTERNAL (implícitamente).
    Acepta llamadas:
      - Con X-Internal-Call + headers del gateway
      - Con Bearer firmado con S2S_JWT_SECRET (p.ej. outbox directo sin gateway)
    Uso:
      @router.post("/internal/...")
      def endpoint(ctx: AuthContext = Depends(require_internal("ROLE_INTERNAL"))): ...
    """
    normalized = {normalize_role(a) for a in allowed} | {"ROLE_INTERNAL"}

    def _dep(
        authorization: str = Header(default=None, alias="Authorization"),
        x_internal_call: str = Header(default=None, alias="X-Internal-Call"),
        x_auth_roles: str = Header(default=None, alias="X-Auth-Roles"),
        x_auth_username: str = Header(default=None, alias="X-Auth-Username"),
        x_user_id: str = Header(default=None, alias="x-user-id"),
        x_act_as_user: str = Header(default=None, alias="X-Act-As-User"),
    ) -> AuthContext:
        return authorize_request(
            authorization=authorization,
            x_internal_call=x_internal_call,
            x_auth_roles=x_auth_roles,
            x_auth_username=x_auth_username,
            x_user_id=x_user_id,
            x_act_as_user=x_act_as_user,
            allowed_roles=normalized,
            prefer_public=False,  # obliga S2S si viene por Bearer
        )

    return _dep
