#!/usr/bin/env bash
set -euo pipefail
/scripts/preflight-env.sh

# Puede correr sin Eureka; si lo registras, añade el -wait de Eureka.
exec sh -c "dockerize -timeout 30s -- java -jar /app/app.jar"
