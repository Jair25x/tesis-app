#!/bin/sh
set -eu

# preflight opcional
[ -f /scripts/preflight-env.sh ] && /scripts/preflight-env.sh || true

if command -v dockerize >/dev/null 2>&1; then
  exec sh -c "dockerize \
    -wait http://eureka-server:8761/eureka/apps \
    -timeout 60s -- java -jar /app/app.jar"
else
  # Espera simple por Eureka (mejor que nada)
  i=0; while [ $i -lt 30 ]; do
    if curl -fsS http://eureka-server:8761/eureka/apps >/dev/null 2>&1; then break; fi
    i=$((i+1)); sleep 2
  done
  exec java -jar /app/app.jar
fi
