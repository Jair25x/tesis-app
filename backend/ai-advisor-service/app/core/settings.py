# app/core/settings.py  (reemplazo del archivo completo o añade los nuevos campos)
from __future__ import annotations
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    # Entorno
    ENV: str = Field(default="dev")

    # Conexiones
    DATABASE_URL: str
    REDIS_URL: str | None = None

    # Proveedor LLM / Embeddings (opcionales)
    OPENAI_API_KEY: str | None = None
    OPENAI_API_BASE: str | None = None
    OPENAI_EMBED_MODEL: str = "text-embedding-3-small"
    OPENAI_CHAT_MODEL: str = "gpt-4o-mini"
    CHAT_USE_LLM: bool = False
    CHAT_LLM_MODEL: str = "gpt-4.1-mini"
    LLM_REQUEST_TIMEOUT: int = 12
    LLM_MAX_TOKENS: int = 320
    LLM_TEMPERATURE: float = 0.3
    EMB_REQUEST_TIMEOUT: int = 8

    # Seguridad
    S2S_JWT_SECRET: str
    PUBLIC_JWT_SECRET: str | None = None

    # S2S tokens
    S2S_JWT_ISSUER: str = "ai-advisor-service"
    S2S_JWT_TTL_SECONDS: int = 120

    # Clientes internos
    CURRICULUM_BASE_URL: str = "http://curriculum-service:8082"
    PROGRESS_BASE_URL: str = "http://progress-service:8083"

    # Parámetros de negocio
    RAG_TOP_K: int = 3
    RECO_K: int = 8
    CACHE_TTL_SECONDS: int = 1800

    # Features
    CHAT_PERSISTENCE_ENABLED: bool = True
    STRICT_JSON_UTF8: bool = False

    # CORS
    ALLOWED_ORIGINS: str = "*"

    class Config:
        env_file = ".env"
        extra = "ignore"

    @property
    def allowed_origins_list(self) -> list[str]:
        if not self.ALLOWED_ORIGINS:
            return ["*"]
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]

settings = Settings()
