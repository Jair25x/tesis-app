#!/bin/sh
set -eu

# preflight genérico (si lo usas)
if [ -f "/scripts/preflight-env.sh" ]; then
  /scripts/preflight-env.sh
fi

# Variables por defecto
JAVA_OPTS="${JAVA_OPTS:-}"
SPRING_PROFILES_ACTIVE="${SPRING_PROFILES_ACTIVE:-prod}"

echo "[entrypoint] SPRING_PROFILES_ACTIVE=$SPRING_PROFILES_ACTIVE"

exec java $JAVA_OPTS -Dspring.profiles.active="$SPRING_PROFILES_ACTIVE" -jar /app/app.jar
