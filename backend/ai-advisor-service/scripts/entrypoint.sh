#!/usr/bin/env bash
set -Eeuo pipefail

# ---- funciones auxiliares ----
log()  { echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] [entrypoint] $*"; }
die()  { echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] [entrypoint] ERROR: $*" >&2; exit 1; }

wait_for_db() {
  if [[ -z "${DATABASE_URL:-}" ]]; then
    log "DATABASE_URL no definido, omitiendo wait_for_db"
    return 0
  fi
  log "Esperando conexión a DB ..."
  python - <<'PY'
import os, sys, time
import psycopg  # psycopg[binary]

url = os.environ.get("DATABASE_URL")
if not url:
    sys.exit(0)

# psycopg.connect no entiende "postgresql+psycopg", normalizamos para el check
test_url = url.replace("+psycopg2", "").replace("+psycopg", "")

max_wait = int(os.environ.get("DB_MAX_WAIT_SECONDS", "60"))
t0 = time.time()
while True:
    try:
        conn = psycopg.connect(test_url, connect_timeout=3)
        with conn.cursor() as cur:
            cur.execute("SELECT 1;")
            cur.fetchone()
        conn.close()
        print("DB OK")
        break
    except Exception as e:
        if time.time() - t0 > max_wait:
            print("DB NO DISPONIBLE:", e)
            sys.exit(1)
        time.sleep(2)
PY
}

wait_for_redis() {
  if [[ -z "${REDIS_URL:-}" ]]; then
    log "REDIS_URL no definido, omitiendo wait_for_redis"
    return 0
  fi
  log "Esperando conexión a Redis ..."
  python - <<'PY'
import os, sys, time, redis
url = os.environ.get("REDIS_URL")
if not url: sys.exit(0)
max_wait = int(os.environ.get("REDIS_MAX_WAIT_SECONDS","30"))
t0 = time.time()
while True:
    try:
        r = redis.from_url(url, decode_responses=True)
        if r.ping():
            print("REDIS OK")
            break
    except Exception as e:
        if time.time() - t0 > max_wait:
            print("REDIS NO DISPONIBLE:", e)
            sys.exit(1)
        time.sleep(1)
PY
}

migrate() {
  log "Ejecutando migraciones Alembic ..."
  # Asegura que Python vea el paquete "app"
  export PYTHONPATH="${PYTHONPATH:-/app}:/app"
  cd /app
  alembic -c /app/alembic.ini upgrade head
  log "Migraciones aplicadas"
}

start() {
  local workers="${UVICORN_WORKERS:-2}"
  local bind="0.0.0.0:${PORT:-8086}"
  log "Iniciando Gunicorn (workers=${workers}, bind=${bind}) ..."
  exec gunicorn \
    -k uvicorn.workers.UvicornWorker \
    -w "${workers}" \
    -b "${bind}" \
    --access-logfile - \
    --error-logfile - \
    --timeout 60 \
    "app.main:app"
}

# ---- flujo principal ----
log "ENV=${ENV:-dev} PORT=${PORT:-8086}"
wait_for_db
wait_for_redis
migrate
start
