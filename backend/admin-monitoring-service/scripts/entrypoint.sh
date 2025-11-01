#!/usr/bin/env bash
set -euo pipefail
/scripts/preflight-env.sh

exec sh -c "dockerize \
  -wait http://eureka-server:8761/eureka/apps \
  -timeout 60s -- java -jar /app/app.jar"
