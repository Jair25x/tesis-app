#!/bin/sh
set -eu

log() { echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] [preflight] $*"; }

# Detecta entorno (prod sólo bloquea)
ENVIRONMENT="${ENV:-${SPRING_PROFILES_ACTIVE:-dev}}"
if [ "$ENVIRONMENT" != "prod" ]; then
  log "entorno=$ENVIRONMENT → validaciones suaves (no bloqueo)."
  exit 0
fi

# Lista de variables críticas (separadas por espacio)
REQUIRED_VARS="\
JWT_SECRET S2S_JWT_SECRET PUBLIC_JWT_SECRET \
REDIS_PASSWORD \
POSTGRES_AUTH_PASSWORD POSTGRES_CONTENT_PASSWORD POSTGRES_PROGRESS_PASSWORD \
POSTGRES_CLASSROOM_PASSWORD POSTGRES_ASSESSMENT_PASSWORD \
POSTGRES_ADVISOR_PASSWORD POSTGRES_DUELS_PASSWORD \
GITHUB_TOKEN \
GF_SECURITY_ADMIN_USER GF_SECURITY_ADMIN_PASSWORD"

missing=0
for v in $REQUIRED_VARS; do
  # eval para expandir el valor de la variable por nombre
  eval "val=\${$v:-}"
  if [ -z "${val}" ]; then
    log "FATAL: falta variable $v"; missing=1
  fi
done

if [ "$missing" -ne 0 ]; then
  log "Corte de arranque por secretos faltantes (prod)."
  exit 1
fi

log "OK: secretos mínimos presentes (prod)."
