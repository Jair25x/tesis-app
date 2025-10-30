# app/deps.py
from __future__ import annotations

from typing import Optional, Tuple, Generator, List
import jwt
from fastapi import Header, HTTPException, status
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from .config import DATABASE_URL, REDIS_URL, JWT_KEY_BYTES, JWT_ALGS

# =======================
# DB (SQLAlchemy, 2.x)
# =======================
engine = create_engine(
    DATABASE_URL,
    future=True,
    pool_pre_ping=True,
)
SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
    future=True,
)

def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# =======================
# Redis (opcional)
# =======================
try:
    import redis.asyncio as aioredis  # redis>=4
except Exception:
    aioredis = None  # type: ignore

redis = None
if REDIS_URL and aioredis is not None:
    try:
        redis = aioredis.from_url(REDIS_URL, decode_responses=True)  # type: ignore
    except Exception:
        # Si falla la creación, dejamos redis=None para no bloquear el servicio
        redis = None

async def get_redis():
    """Dependency opcional para inyectar Redis; puede ser None."""
    return redis

# =======================
# Auth / JWT helpers
# =======================
def _parse_roles(obj) -> List[str]:
    """Normaliza roles a lista 'ROLE_*' en mayúsculas."""
    if obj is None:
        return []
    if isinstance(obj, str):
        parts = [p.strip() for p in obj.split(",")]
    elif isinstance(obj, (list, tuple, set)):
        parts = [str(p).strip() for p in obj]
    else:
        parts = [str(obj).strip()]
    out: List[str] = []
    for r in parts:
        if not r:
            continue
        r_up = r.upper()
        out.append(r_up if r_up.startswith("ROLE_") else f"ROLE_{r_up}")
    return out

def _parse_bearer(authorization: Optional[str]) -> Optional[str]:
    if not authorization:
        return None
    if not authorization.lower().startswith("bearer "):
        return None
    return authorization.split(" ", 1)[1].strip()

def decode_jwt_token(authorization: Optional[str]) -> Tuple[str, List[str]]:
    token = _parse_bearer(authorization)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")
    try:
        payload = jwt.decode(
            token,
            JWT_KEY_BYTES,               # ⬅️ clave HMAC ya decodificada
            algorithms=JWT_ALGS,         # ⬅️ por defecto incluye HS512
            options={"verify_aud": False},
        )
        sub = str(payload.get("sub") or payload.get("userId") or "").strip()
        roles = _parse_roles(payload.get("roles"))
        if not sub:
            raise ValueError("sub/userId missing")
        return sub, roles
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid token: {e}")

# =======================
# FastAPI dependencies
# =======================
async def current_user(
    # Si vienes a través del gateway, ya tendrás estas cabeceras:
    x_user_id: Optional[str] = Header(None, alias="x-user-id"),
    x_auth_roles: Optional[str] = Header(None, alias="X-Auth-Roles"),
    # Fallback para llamadas directas (sin gateway):
    authorization: Optional[str] = Header(None),
) -> str:
    """
    Devuelve el userId del alumno como string.
    Exige rol STUDENT (acepta USER como alternativa laxa).
    """
    # 1) Camino preferido: gateway inyecta el userId
    if x_user_id:
        roles = _parse_roles(x_auth_roles)
        # Si el gateway no envía roles, no bloqueamos; si los envía, validamos
        if roles and "ROLE_STUDENT" not in roles and "ROLE_USER" not in roles:
            raise HTTPException(status_code=403, detail="Requires student role")
        return x_user_id

    # 2) Fallback: token directo
    sub, roles = decode_jwt_token(authorization)
    if "ROLE_STUDENT" not in roles and "ROLE_USER" not in roles:
        raise HTTPException(status_code=403, detail="Requires student role")
    return sub

# === actor genérico (docente/admin) + validador de roles ===
async def current_actor(
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None, alias="x-user-id"),
    x_auth_roles: Optional[str] = Header(None, alias="X-Auth-Roles"),
) -> Tuple[str, List[str]]:
    """
    Devuelve (userId, roles[]) sin exigir STUDENT.
    Útil para endpoints de reportes (ROLE_TEACHER / ROLE_ADMIN).
    """
    if x_user_id:
        return x_user_id, _parse_roles(x_auth_roles)
    sub, roles = decode_jwt_token(authorization)
    return sub, roles

def require_roles(roles: List[str], required: List[str]) -> None:
    """
    Lanza 403 si 'roles' no contiene al menos uno de 'required'.
    Acepta forma con o sin 'ROLE_'.
    """
    ups = {r.upper() if r.upper().startswith("ROLE_") else f"ROLE_{r.upper()}" for r in roles}
    needs = {r.upper() if r.upper().startswith("ROLE_") else f"ROLE_{r.upper()}" for r in required}
    if ups.isdisjoint(needs):
        raise HTTPException(status_code=403, detail="Requires role: " + " or ".join(required))
