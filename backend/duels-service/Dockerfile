# ---------- builder ----------
FROM python:3.11-slim AS builder
WORKDIR /wheels

ENV PYTHONDONTWRITEBYTECODE=1 \
  PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
  curl ca-certificates build-essential \
  && rm -rf /var/lib/apt/lists/*

COPY ./duels-service/requirements.txt /tmp/requirements.txt
RUN python -m pip install --upgrade pip \
  && pip wheel --no-cache-dir --wheel-dir /wheels -r /tmp/requirements.txt

# ---------- runtime ----------
FROM python:3.11-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl \
 && rm -rf /var/lib/apt/lists/*

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

RUN useradd -ms /bin/sh appuser

COPY --from=builder /wheels /wheels
COPY ./duels-service/requirements.txt /app/requirements.txt
RUN python -m pip install --no-cache-dir --no-index --find-links=/wheels -r /app/requirements.txt

COPY ./duels-service/app /app/app
COPY ./duels-service/alembic /app/alembic
COPY ./duels-service/alembic.ini /app/alembic.ini
COPY ./duels-service/scripts/entrypoint.sh /app/scripts/entrypoint.sh
COPY ./scripts/preflight-env.sh /scripts/preflight-env.sh

RUN chmod +x /app/scripts/entrypoint.sh /scripts/preflight-env.sh \
 && chown -R appuser:appuser /app

USER appuser

ENV PORT=8087 \
    UVICORN_WORKERS=1
EXPOSE 8087

ENTRYPOINT ["/app/scripts/entrypoint.sh"]

