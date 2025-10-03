# app/config.py
import os

def _env_bool(key: str, default: str = "false") -> bool:
    return (os.getenv(key, default) or "").strip().lower() in ("1", "true", "yes", "y")

# Puerto y DB
PORT = int(os.getenv("PORT", "8087"))
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg://postgres:misan@duels-db:5432/duelsdb",
)

# Redis: si viene vacío => None (deshabilita uso de Redis)
_raw_redis = (os.getenv("REDIS_URL", "") or "").strip()
REDIS_URL = _raw_redis or None

# JWT de usuarios (WS y HTTP)
JWT_SECRET = os.getenv("JWT_SECRET", "changeme")
JWT_ALGS = [a.strip() for a in (os.getenv("JWT_ALGS", "HS512,HS384,HS256") or "").split(",") if a.strip()]

# Bases S2S
CURRICULUM_BASE = os.getenv("CURRICULUM_BASE", "http://curriculum-service:8082")
PROGRESS_BASE   = os.getenv("PROGRESS_BASE",   "http://progress-service:8083")
CLASSROOM_BASE = os.getenv("CLASSROOM_BASE", "http://classroom-service:8084")
# S2S JWT (duels -> progress)
S2S_JWT_SECRET = os.getenv("S2S_JWT_SECRET", "changeme-internal")
S2S_JWT_ISSUER = os.getenv("S2S_JWT_ISSUER", "ai-advisor-service")

# Eureka (opcional)
EUREKA_SERVER   = os.getenv("EUREKA_SERVER", "")
EUREKA_APP_NAME = os.getenv("EUREKA_APP_NAME", "DUELS-SERVICE")
DUELS_HOST      = os.getenv("DUELS_HOST", "duels-service")
HEALTH_URL      = os.getenv("HEALTH_URL", f"http://{DUELS_HOST}:{PORT}/healthz")
HOME_URL        = os.getenv("HOME_URL",   f"http://{DUELS_HOST}:{PORT}/docs")
EUREKA_PREFER_IP   = _env_bool("EUREKA_PREFER_IP", "false")
EUREKA_RENEWAL     = int(os.getenv("EUREKA_RENEWAL_INTERVAL", "10"))
EUREKA_DURATION    = int(os.getenv("EUREKA_DURATION", "30"))
EUREKA_DATACENTER  = os.getenv("EUREKA_DATACENTER", "MyOwn")

# Gateway / CORS (el gateway maneja CORS; aquí sólo por si haces tests sin gateway)
BEHIND_GATEWAY = _env_bool("BEHIND_GATEWAY", "true")

# Prometheus
METRICS_PATH = "/metrics"
