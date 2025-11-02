#!/bin/sh
set -eu
[ -f /scripts/preflight-env.sh ] && /scripts/preflight-env.sh || true

if command -v dockerize >/dev/null 2>&1; then
  dockerize \
    -wait http://config-service:8888/actuator/health \
    -wait http://eureka-server:8761/eureka/apps \
    -wait tcp://progress-db:5432 \
    -timeout 60s true || true
else
  i=0; while [ $i -lt 30 ]; do
    curl -fsS http://config-service:8888/actuator/health >/dev/null 2>&1 && break
    i=$((i+1)); sleep 2
  done
  i=0; while [ $i -lt 30 ]; do
    curl -fsS http://eureka-server:8761/eureka/apps >/dev/null 2>&1 && break
    i=$((i+1)); sleep 2
  done
fi

exec java -jar /app/app.jar
