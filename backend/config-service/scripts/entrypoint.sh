#!/bin/sh
set -eu
[ -f /scripts/preflight-env.sh ] && /scripts/preflight-env.sh || true

# Puede correr sin Eureka
if command -v dockerize >/dev/null 2>&1; then
  exec sh -c "dockerize -timeout 30s -- java -jar /app/app.jar"
else
  exec java -jar /app/app.jar
fi
