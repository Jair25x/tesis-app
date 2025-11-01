#!/usr/bin/env bash
set -euo pipefail

# Solo forzamos verificación dura en PROD
ENVIRONMENT="${ENV:-${SPRING_PROFILES_ACTIVE:-dev}}"
if [[ "$ENVIRONMENT" != "prod" ]]; then
  echo "preflight: entorno=$ENVIRONMENT → validaciones suaves (no bloqueo)."
  exit 0
fi

required_vars=(
  JWT_SECRET S2S_JWT_SECRET PUBLIC_JWT_SECRET
  REDIS_PASSWORD
  POSTGRES_AUTH_PASSWORD POSTGRES_CONTENT_PASSWORD POSTGRES_PROGRESS_PASSWORD
  POSTGRES_CLASSROOM_PASSWORD POSTGRES_ASSESSMENT_PASSWORD
  POSTGRES_ADVISOR_PASSWORD POSTGRES_DUELS_PASSWORD
  GITHUB_TOKEN
  GF_SECURITY_ADMIN_USER GF_SECURITY_ADMIN_PASSWORD
)
missing=0
for v in "${required_vars[@]}"; do
  if [[ -z "${!v:-}" ]]; then
    echo "FATAL: falta variable $v"; missing=1
  fi
done
if [[ "$missing" -ne 0 ]]; then
  echo "Corte de arranque por secretos faltantes (prod)."; exit 1
fi
echo "OK: secretos mínimos presentes (prod)."
