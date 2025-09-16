# ai-advisor-service (FastAPI)

Servicio de asesoría inteligente (RAG + recomendaciones) para el MVP.

## Endpoints

- `GET /healthz` – liveness
- `GET /readyz` – readiness (DB + Redis)
- `GET /metrics` – Prometheus
- `POST /internal/advisor/attempts` – Ingesta de intentos (idempotente)
- `GET /api/ai/recommendations/students/me` – Recos heurísticas (ROLE_STUDENT)
- `POST /api/ai/chat` – Chat con grounding (stub RAG)

## Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `ENV` | `dev` \| `prod` | `prod` |
| `PORT` | Puerto HTTP interno | `8086` |
| `DATABASE_URL` | URL Postgres | `postgresql+psycopg://postgres:misan@advisor-db:5432/advisordb` |
| `REDIS_URL` | URL Redis (opcional) | `redis://advisor-redis:6379/0` |
| `S2S_JWT_SECRET` | Secreto HS256 S2S | `base64...` |
| `PUBLIC_JWT_SECRET` | Secreto HS256 público (opcional) | `base64...` |
| `S2S_JWT_ISSUER` | Issuer de tokens S2S | `ai-advisor-service` |
| `S2S_JWT_TTL_SECONDS` | TTL de tokens S2S | `120` |
| `CURRICULUM_BASE_URL` | URL interna de curriculum-service | `http://curriculum-service:8082` |
| `RAG_TOP_K` | Nº de chunks para citar | `3` |
| `RECO_K` | Nº de recomendaciones | `8` |
| `CACHE_TTL_SECONDS` | TTL de caché Redis | `1800` |
| `ALLOWED_ORIGINS` | CORS (solo dev) | `http://localhost:5173` |
| `OPENAI_API_KEY` | (Fase 2) LLM/Embeddings | `...` |

> **pgvector**: tu base de datos debe venir de una imagen con la extensión instalada (ej. `ankane/pgvector:pg17`). La migración ejecutará `CREATE EXTENSION IF NOT EXISTS vector;`.

## Run local (opcional)

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL=postgresql+psycopg://postgres:misan@localhost:5447/advisordb
alembic upgrade head
uvicorn app.main:app --host 0.0.0.0 --port 8086
