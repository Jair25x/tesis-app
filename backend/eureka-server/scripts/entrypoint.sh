#!/usr/bin/env bash
set -euo pipefail
/scripts/preflight-env.sh
exec java -jar /app/app.jar
