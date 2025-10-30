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

# ---------------------------
# JWT de usuarios (WS y HTTP)
# ---------------------------
# NOTA: En auth-service, jwt.secret-key viene como Base64. Aquí
# lo soportamos de forma robusta para validar con HS512.
JWT_SECRET = os.getenv("JWT_SECRET", "changeme").strip()
JWT_ALGS = [a.strip() for a in (os.getenv("JWT_ALGS", "HS512,HS384,HS256") or "").split(",") if a.strip()]

def _best_effort_hmac_key(secret_raw: str) -> bytes:
    """
    Intenta decodificar el secreto como Base64 (std y urlsafe).
    Si no es Base64 válido, usa bytes crudos (fallback).
    """
    if not secret_raw:
        raise RuntimeError("JWT_SECRET vacío en entorno")

    candidates = {secret_raw}
    # rellenos por si el secreto vino sin '='
    for pad in ("", "=", "==", "==="):
        candidates.add(secret_raw + pad)

    # Base64 estándar
    for s in list(candidates):
        try:
            b = base64.b64decode(s, validate=True)
            if b:
                return b
        except Exception:
            pass

    # Base64 urlsafe
    for s in list(candidates):
        try:
            b = base64.urlsafe_b64decode(s + "===")
            if b:
                return b
        except Exception:
            pass

    log.warning("JWT_SECRET no es Base64 válido; usando bytes crudos (fallback)")
    return secret_raw.encode("utf-8")

JWT_KEY_BYTES = _best_effort_hmac_key(JWT_SECRET)

# ---------------------------
# Bases S2S
# ---------------------------
CURRICULUM_BASE = os.getenv("CURRICULUM_BASE", "http://curriculum-service:8082")
PROGRESS_BASE   = os.getenv("PROGRESS_BASE",   "http://progress-service:8083")
CLASSROOM_BASE  = os.getenv("CLASSROOM_BASE",  "http://classroom-service:8084")

# S2S JWT (duels -> progress) (opcional aquí)
S2S_JWT_SECRET = os.getenv("S2S_JWT_SECRET", "changeme-internal")
S2S_JWT_ISSUER = os.getenv("S2S_JWT_ISSUER", "ai-advisor-service")

# ---------------------------
# Eureka (opcional)
# ---------------------------
EUREKA_SERVER   = os.getenv("EUREKA_SERVER", "")
EUREKA_APP_NAME = os.getenv("EUREKA_APP_NAME", "DUELS-SERVICE")
DUELS_HOST      = os.getenv("DUELS_HOST", "duels-service")
HEALTH_URL      = os.getenv("HEALTH_URL", f"http://{DUELS_HOST}:{PORT}/healthz")
HOME_URL        = os.getenv("HOME_URL",   f"http://{DUELS_HOST}:{PORT}/docs")
EUREKA_PREFER_IP   = _env_bool("EUREKA_PREFER_IP", "false")
EUREKA_RENEWAL     = int(os.getenv("EUREKA_RENEWAL_INTERVAL", "10"))
EUREKA_DURATION    = int(os.getenv("EUREKA_DURATION", "30"))
EUREKA_DATACENTER  = os.getenv("EUREKA_DATACENTER", "MyOwn")

# ---------------------------
# Gateway / CORS (tests sin gateway)
# ---------------------------
BEHIND_GATEWAY = _env_bool("BEHIND_GATEWAY", "true")

# ---------------------------
# Prometheus
# ---------------------------
METRICS_PATH = "/metrics"
