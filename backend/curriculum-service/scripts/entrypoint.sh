#!/bin/sh
set -eu
[ -f /scripts/preflight-env.sh ] && /scripts/preflight-env.sh || true

if command -v dockerize >/dev/null 2>&1; then
  exec sh -c "dockerize \
    -wait http://config-service:8888/actuator/health \
    -wait http://eureka-server:8761/eureka/apps \
    -wait tcp://content-db:5432 \
    -timeout 60s -- java -jar /app/app.jar"
else
  i=0; while [ $i -lt 30 ]; do
    curl -fsS http://config-service:8888/actuator/health >/dev/null 2>&1 && break
    i=$((i+1)); sleep 2
  done
  i=0; while [ $i -lt 30 ]; do
    curl -fsS http://eureka-server:8761/eureka/apps >/dev/null 2>&1 && break
    i=$((i+1)); sleep 2
  done
  exec java -jar /app/app.jar
fi
