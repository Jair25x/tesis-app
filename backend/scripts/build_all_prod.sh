#!/usr/bin/env bash
set -euo pipefail

# ============================================================
#  Build & Push de TODAS las imágenes de producción (release)
#  Uso:
#    ./backend/scripts/build_all_prod.sh
#    ./backend/scripts/build_all_prod.sh prod-20251126-0710
# ============================================================

REGISTRY="ghcr.io/jair25x"

# Si pasas un TAG como argumento, se usa ese.
# Si no, se genera uno con fecha/hora.
RELEASE_TAG="${1:-prod-$(date +%Y%m%d-%H%M)}"

echo "========================================"
echo " Usando RELEASE_TAG = ${RELEASE_TAG}"
echo " Registry           = ${REGISTRY}"
echo "========================================"

echo "🔐 Haciendo login en GHCR..."
# REEMPLAZA 'ghp_TU_PAT' POR TU TOKEN REAL
echo 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 | docker login ghcr.io -u Jair25x --password-stdin

# --- Servicios backend (Java + FastAPI) ---
BACKEND_SERVICES=(
  "config-service"
  "eureka-server"
  "auth-service"
  "curriculum-service"
  "progress-service"
  "classroom-service"
  "assessment-service"
  "ai-advisor-service"
  "duels-service"
  "admin-monitoring-service"
  "gateway-service"
  # "avatar-service" # descomenta cuando lo uses en prod
)

for SERVICE in "${BACKEND_SERVICES[@]}"; do
  IMAGE="${REGISTRY}/${SERVICE}:${RELEASE_TAG}"
  echo
  echo "=============================="
  echo "  Building ${IMAGE}"
  echo "=============================="
  docker build -f "backend/${SERVICE}/Dockerfile" -t "${IMAGE}" backend/
  echo "▶️  Pushing ${IMAGE}"
  docker push "${IMAGE}"
done

# --- Frontend (tesis-frontend) ---
FRONTEND_IMAGE="${REGISTRY}/tesis-frontend:${RELEASE_TAG}"

echo
echo "=============================="
echo "  Building frontend ${FRONTEND_IMAGE}"
echo "=============================="
docker build -f frontend/Dockerfile -t "${FRONTEND_IMAGE}" frontend/
echo "▶️  Pushing ${FRONTEND_IMAGE}"
docker push "${FRONTEND_IMAGE}"

echo
echo "======================================================="
echo "✅ BUILD & PUSH COMPLETADOS"
echo "   RELEASE_TAG FINAL: ${RELEASE_TAG}"
echo
echo "👉 Copia y pega esto en tu .env de PROD:"
echo "-------------------------------------------------------"
cat <<EOF
# === TAGS (CI/CD) – RELEASE ${RELEASE_TAG}
FRONTEND_TAG=${RELEASE_TAG}
GATEWAY_TAG=${RELEASE_TAG}
EUREKA_TAG=${RELEASE_TAG}
CONFIG_TAG=${RELEASE_TAG}
ADMIN_TAG=${RELEASE_TAG}
AUTH_TAG=${RELEASE_TAG}
CURRICULUM_TAG=${RELEASE_TAG}
PROGRESS_TAG=${RELEASE_TAG}
CLASSROOM_TAG=${RELEASE_TAG}
ASSESSMENT_TAG=${RELEASE_TAG}
AI_ADVISOR_TAG=${RELEASE_TAG}
DUELS_TAG=${RELEASE_TAG}
EOF
echo "-------------------------------------------------------"
echo "Luego en el VPS:"
echo "  1) Actualizar .env con estos TAGs"
echo "  2) docker compose -f docker-compose.prod.yml -f overrides/close-ports.yml pull"
echo "  3) docker compose -f docker-compose.prod.yml -f overrides/close-ports.yml up -d"
echo "======================================================="
