# ---------- builder ----------
FROM python:3.11-slim AS builder
WORKDIR /wheels

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Copia requirements con openai incluido
COPY requirements.txt /tmp/requirements.txt

RUN python -m pip install --upgrade pip \
 && pip wheel --no-cache-dir --wheel-dir /wheels -r /tmp/requirements.txt

# ---------- runtime ----------
FROM python:3.11-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
  && rm -rf /var/lib/apt/lists/*

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Usuario no-root
RUN useradd -ms /bin/bash appuser

# Instala desde wheelhouse (sin internet)
COPY --from=builder /wheels /wheels
COPY requirements.txt /app/requirements.txt
RUN python -m pip install --no-cache-dir --no-index --find-links=/wheels -r /app/requirements.txt

# Código
COPY app /app/app
COPY alembic /app/alembic
COPY alembic.ini /app/alembic.ini
COPY scripts/entrypoint.sh /app/scripts/entrypoint.sh
COPY .env.example /app/.env.example
COPY README.md /app/README.md

RUN chmod +x /app/scripts/entrypoint.sh \
 && chown -R appuser:appuser /app

USER appuser

ENV PORT=8086
EXPOSE 8086

ENV UVICORN_WORKERS=2 \
    ENV=prod

ENTRYPOINT ["/app/scripts/entrypoint.sh"]
