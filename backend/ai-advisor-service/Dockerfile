# ---------- builder ----------
FROM python:3.11-slim AS builder
WORKDIR /wheels

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY ./ai-advisor-service/requirements.txt /tmp/requirements.txt
RUN python -m pip install --upgrade pip \
 && pip wheel --no-cache-dir --wheel-dir /wheels -r /tmp/requirements.txt

# ---------- runtime ----------
FROM python:3.11-slim
WORKDIR /app

# No bash necesario si usas POSIX sh en el entrypoint
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl \
 && rm -rf /var/lib/apt/lists/*

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN useradd -ms /bin/sh appuser

COPY --from=builder /wheels /wheels
COPY ./ai-advisor-service/requirements.txt /app/requirements.txt
RUN python -m pip install --no-cache-dir --no-index --find-links=/wheels -r /app/requirements.txt

COPY ./ai-advisor-service/app /app/app
COPY ./ai-advisor-service/alembic /app/alembic
COPY ./ai-advisor-service/alembic.ini /app/alembic.ini
COPY ./ai-advisor-service/scripts/entrypoint.sh /app/scripts/entrypoint.sh
COPY ./ai-advisor-service/.env.example /app/.env.example
COPY ./ai-advisor-service/README.md /app/README.md
COPY ./scripts/preflight-env.sh /scripts/preflight-env.sh

RUN chmod +x /app/scripts/entrypoint.sh /scripts/preflight-env.sh \
 && chown -R appuser:appuser /app

USER appuser

ENV PORT=8086 \
    UVICORN_WORKERS=2 \
    ENV=prod
EXPOSE 8086

ENTRYPOINT ["/app/scripts/entrypoint.sh"]
