from __future__ import annotations

from typing import Optional, Tuple, Generator, List, Deque, Dict
import time
from collections import deque
import jwt
from fastapi import Header, HTTPException, status
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from .config import (
    DATABASE_URL, REDIS_URL, JWT_KEY_BYTES, JWT_ALGS,
    RATE_LIMIT_MATCHES_PER_MIN, RATE_LIMIT_RESOLVE_PER_MIN,
    REQUIRE_REDIS_IN_PROD, APP_ENV,
)

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
# Redis (opcional, asyncio)
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
        redis = None

async def get_redis():
    """Dependency opcional para inyectar Redis; puede ser None."""
    return redis

# =======================
# Auth / JWT helpers
# =======================
def _parse_roles(obj) -> List[str]:
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
            JWT_KEY_BYTES,
            algorithms=JWT_ALGS,
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
    x_user_id: Optional[str] = Header(None, alias="x-user-id"),
    x_auth_roles: Optional[str] = Header(None, alias="X-Auth-Roles"),
    authorization: Optional[str] = Header(None),
) -> str:
    """
    Devuelve el userId del alumno como string.
    Exige rol STUDENT (acepta USER como alternativa laxa).
    """
    if x_user_id:
        roles = _parse_roles(x_auth_roles)
        if roles and "ROLE_STUDENT" not in roles and "ROLE_USER" not in roles:
            raise HTTPException(status_code=403, detail="Requires student role")
        return x_user_id

    sub, roles = decode_jwt_token(authorization)
    if "ROLE_STUDENT" not in roles and "ROLE_USER" not in roles:
        raise HTTPException(status_code=403, detail="Requires student role")
    return sub

async def current_actor(
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None, alias="x-user-id"),
    x_auth_roles: Optional[str] = Header(None, alias="X-Auth-Roles"),
) -> Tuple[str, List[str]]:
    if x_user_id:
        return x_user_id, _parse_roles(x_auth_roles)
    sub, roles = decode_jwt_token(authorization)
    return sub, roles

def require_roles(roles: List[str], required: List[str]) -> None:
    ups = {r.upper() if r.upper().startswith("ROLE_") else f"ROLE_{r.upper()}" for r in roles}
    needs = {r.upper() if r.upper().startswith("ROLE_") else f"ROLE_{r.upper()}" for r in required}
    if ups.isdisjoint(needs):
        raise HTTPException(status_code=403, detail="Requires role: " + " or ".join(required))

# =======================
# (Opcional) Rate limit centralizado
# =======================
_inmem_buckets: Dict[str, Deque[float]] = {}

def _rate_limit_inmem(key: str, limit_per_min: int):
    now = time.time()
    window = 60
    dq = _inmem_buckets.setdefault(key, deque())
    while dq and (now - dq[0] > window):
        dq.popleft()
    if len(dq) >= limit_per_min:
        raise HTTPException(status_code=429, detail="Too many requests")
    dq.append(now)

async def _rate_limit_redis(key: str, limit_per_min: int):
    if redis is None:
        _rate_limit_inmem(key, limit_per_min)
        return
    bucket = int(time.time() // 60)
    rkey = f"rl:{key}:{bucket}"
    val = await redis.incr(rkey)  # type: ignore
    if val == 1:
        await redis.expire(rkey, 65)  # type: ignore
    if val > limit_per_min:
        raise HTTPException(status_code=429, detail="Too many requests")

def _require_redis_or_ok():
    if REQUIRE_REDIS_IN_PROD and APP_ENV == "prod" and redis is None:
        raise RuntimeError("Redis is required in prod but REDIS_URL is empty")

async def rate_limit_create_match(user_id: str):
    _require_redis_or_ok()
    key = f"duels:matches:{user_id}"
    if redis:
        await _rate_limit_redis(key, RATE_LIMIT_MATCHES_PER_MIN)
    else:
        _rate_limit_inmem(key, RATE_LIMIT_MATCHES_PER_MIN)

async def rate_limit_resolve(user_id: str, ip: str):
    _require_redis_or_ok()
    keys = (f"duels:resolve:user:{user_id}", f"duels:resolve:ip:{ip}")
    for key in keys:
        if redis:
            await _rate_limit_redis(key, RATE_LIMIT_RESOLVE_PER_MIN)
        else:
            _rate_limit_inmem(key, RATE_LIMIT_RESOLVE_PER_MIN)
