#!/usr/bin/env bash
set -euo pipefail

/scripts/preflight-env.sh

log() { echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] $*"; }

PORT="${PORT:-8087}"
UVICORN_WORKERS="${UVICORN_WORKERS:-1}"
DB_URL="${DATABASE_URL:-}"
REDIS_URL="${REDIS_URL:-}"

export PYTHONPATH="/app${PYTHONPATH:+:$PYTHONPATH}"
log "PYTHONPATH=$PYTHONPATH"

wait_for_db() {
  if [[ -z "$DB_URL" ]]; then
    log "WARN: DATABASE_URL no definido; salto espera de DB."
    return 0
  fi
  log "Esperando DB: ${DB_URL}"
  local tries=40
  for i in $(seq 1 $tries); do
    python - <<'PY'
import os, sys
from sqlalchemy import create_engine, text
url = os.getenv("DATABASE_URL")
try:
    e = create_engine(url, future=True)
    with e.connect() as con:
        con.execute(text("SELECT 1"))
    sys.exit(0)
except Exception as e:
    print("DB no lista:", e)
    sys.exit(1)
PY
    if [[ $? -eq 0 ]]; then
      log "DB OK"; return 0
    fi
    log "DB aún no lista... intento ${i}/${tries}"
    sleep 1
  done
  log "ERROR: no se pudo conectar a la DB tras ${tries} intentos."
  return 1
}

wait_for_redis() {
  if [[ -z "$REDIS_URL" ]]; then
    log "REDIS_URL vacío; salto espera de Redis."
    return 0
  fi
  log "Esperando Redis: ${REDIS_URL}"
  python - <<'PY'
import os, sys
url = os.getenv("REDIS_URL")
try:
    import redis
except Exception as e:
    print("redis-py no instalado, se omite chequeo:", e)
    sys.exit(0)
try:
    r = redis.from_url(url, socket_connect_timeout=1.5, socket_timeout=1.5)
    r.ping()
    sys.exit(0)
except Exception as e:
    print("Redis no listo:", e)
    sys.exit(1)
PY
  if [[ $? -ne 0 ]]; then
    log "WARN: Redis no respondió, continúo (REDIS_URL=${REDIS_URL})"
  else
    log "Redis OK"
  fi
}

term_handler() {
  log "SIGTERM, apagando..."
  pkill -TERM -P $$ || true
  wait || true
  exit 0
}
trap term_handler SIGTERM

wait_for_db
wait_for_redis

log "Ejecutando migraciones Alembic..."
alembic upgrade head

log "Lanzando Uvicorn (workers=${UVICORN_WORKERS}) en :${PORT}"
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT}" --workers "${UVICORN_WORKERS}"
