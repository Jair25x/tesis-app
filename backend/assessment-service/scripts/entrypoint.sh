#!/usr/bin/env bash
set -euo pipefail
/scripts/preflight-env.sh

exec sh -c "dockerize \
  -wait http://config-service:8888/actuator/health \
  -wait http://eureka-server:8761/eureka/apps \
  -wait tcp://assessment-db:5432 \
  -timeout 60s -- java -jar /app/app.jar"
