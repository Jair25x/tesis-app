#!/bin/sh
set -eu

log() { echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] [gateway-entrypoint] $*"; }

# Preflight (no bloquea en dev)
if [ -f "/scripts/preflight-env.sh" ]; then
  /scripts/preflight-env.sh || true
fi

JAVA_OPTS="${JAVA_OPTS:-}"
SPRING_PROFILES_ACTIVE="${SPRING_PROFILES_ACTIVE:-dev}"

# Espera simple por dependencias
wait_url() {
  url="$1"; name="$2"; max="${3:-60}"
  i=0
  log "Esperando $name: $url (timeout=${max}s)"
  while [ "$i" -lt "$max" ]; do
    if curl -sf "$url" >/dev/null 2>&1; then
      log "$name OK"
      return 0
    fi
    i=$((i+1))
    sleep 1
  done
  log "WARN: $name no respondió en ${max}s; continúo de todas formas."
  return 0
}

wait_url "http://config-service:8888/actuator/health" "config-service" 90
wait_url "http://eureka-server:8761/eureka/apps" "eureka-server" 90

log "Lanzando Gateway con perfil=$SPRING_PROFILES_ACTIVE ..."
exec java $JAVA_OPTS -Dspring.profiles.active="$SPRING_PROFILES_ACTIVE" -jar /app/app.jar
