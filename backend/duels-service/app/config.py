# app/config.py
import os
import base64
import logging

log = logging.getLogger("duels.config")


def _env_bool(key: str, default: str = "false") -> bool:
    return (os.getenv(key, default) or "").strip().lower() in ("1", "true", "yes", "y")


# ---------------------------
# Puerto y DB
# ---------------------------
PORT = int(os.getenv("PORT", "8087"))
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg://postgres:misan@duels-db:5432/duelsdb",
)

# ---------------------------
# Redis (opcional)
# ---------------------------
_raw_redis = (os.getenv("REDIS_URL", "") or "").strip()
REDIS_URL = _raw_redis or None

# --------- NUEVO: rate limit (defaults seguros) ----------
RATE_LIMIT_MATCHES_PER_MIN = int(os.getenv("RATE_LIMIT_MATCHES_PER_MIN", "10"))
RATE_LIMIT_RESOLVE_PER_MIN = int(os.getenv("RATE_LIMIT_RESOLVE_PER_MIN", "30"))

# --------- NUEVO: política de uso de Redis en prod --------
APP_ENV = os.getenv("APP_ENV", "dev").strip()  # dev|test|prod
REQUIRE_REDIS_IN_PROD = _env_bool("REQUIRE_REDIS_IN_PROD", "false")

# ---------------------------
# JWT de usuarios (WS y HTTP)
# ---------------------------
JWT_SECRET = (os.getenv("JWT_SECRET") or "").strip()
if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET vacío en entorno para duels-service")

try:
    # ✅ Igual que en auth/gateway: tratamos JWT_SECRET como Base64 estricto
    JWT_KEY_BYTES = base64.b64decode(JWT_SECRET, validate=True)
    log.info("JWT_SECRET loaded as strict Base64 (len=%d)", len(JWT_KEY_BYTES))
except Exception as e:
    # En prod es mejor fallar fuerte y no levantar con config inconsistente
    raise RuntimeError(f"JWT_SECRET no es Base64 válido: {e}") from e

JWT_ALGS = [
    a.strip()
    for a in (os.getenv("JWT_ALGS", "HS512,HS384,HS256") or "").split(",")
    if a.strip()
]

# ---------------------------
# Bases S2S
# ---------------------------
CURRICULUM_BASE = os.getenv("CURRICULUM_BASE", "http://curriculum-service:8082")
PROGRESS_BASE = os.getenv("PROGRESS_BASE", "http://progress-service:8083")
CLASSROOM_BASE = os.getenv("CLASSROOM_BASE", "http://classroom-service:8084")

# S2S JWT (duels -> progress) (opcional aquí)
S2S_JWT_SECRET = os.getenv("S2S_JWT_SECRET", "changeme-internal")
S2S_JWT_ISSUER = os.getenv("S2S_JWT_ISSUER", "ai-advisor-service")

# ---------------------------
# Eureka (opcional)
# ---------------------------
EUREKA_SERVER = os.getenv("EUREKA_SERVER", "")
EUREKA_APP_NAME = os.getenv("EUREKA_APP_NAME", "DUELS-SERVICE")
DUELS_HOST = os.getenv("DUELS_HOST", "duels-service")
HEALTH_URL = os.getenv("HEALTH_URL", f"http://{DUELS_HOST}:{PORT}/healthz")
HOME_URL = os.getenv("HOME_URL", f"http://{DUELS_HOST}:{PORT}/docs")
EUREKA_PREFER_IP = _env_bool("EUREKA_PREFER_IP", "false")
EUREKA_RENEWAL = int(os.getenv("EUREKA_RENEWAL_INTERVAL", "10"))
EUREKA_DURATION = int(os.getenv("EUREKA_DURATION", "30"))
EUREKA_DATACENTER = os.getenv("EUREKA_DATACENTER", "MyOwn")

# ---------------------------
# Gateway / CORS (tests sin gateway)
# ---------------------------
BEHIND_GATEWAY = _env_bool("BEHIND_GATEWAY", "true")
ALLOWED_ORIGINS = [
    o.strip()
    for o in (os.getenv("ALLOWED_ORIGINS", "http://localhost:5173") or "").split(",")
    if o.strip()
]

# ---------------------------
# Prometheus
# ---------------------------
METRICS_PATH = os.getenv("METRICS_PATH", "/metrics")

# ---------------------------
# NUEVO: TTL de WAITING y availability cache
# ---------------------------
DUELS_WAITING_TTL_MIN = max(5, int(os.getenv("DUELS_WAITING_TTL_MIN", "120")))
DUELS_WAITING_SWEEP_INTERVAL_SEC = max(
    30, int(os.getenv("DUELS_WAITING_SWEEP_INTERVAL_SEC", "60"))
)
DUELS_AVAILABILITY_CACHE_TTL_SEC = float(
    os.getenv("DUELS_AVAILABILITY_CACHE_TTL_SEC", "180")
)
DUELS_AVAILABILITY_TIMEOUT_SEC = float(
    os.getenv("DUELS_AVAILABILITY_TIMEOUT_SEC", "2.5")
)
