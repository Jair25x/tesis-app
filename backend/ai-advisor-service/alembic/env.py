# alembic/env.py
from __future__ import annotations

from logging.config import fileConfig
from alembic import context
from sqlalchemy import engine_from_config, pool

# --- Asegura que /app esté en sys.path para importar "app.*" ---
import os
import sys
import pathlib

PROJECT_ROOT = pathlib.Path(__file__).resolve().parents[1]  # /app
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# --- Importa settings y Base + módulos que definen modelos ---
from app.core.settings import settings
from app.db.base import Base
# Importar módulos que contienen los modelos asegura que Alembic detecte las tablas
from app.models import rag, signals, events, cache, chat  # noqa: F401

# --- Configuración Alembic ---
config = context.config

# Logging de Alembic
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Metadatos objetivo de tus modelos
target_metadata = Base.metadata

def get_url() -> str:
    return settings.DATABASE_URL

# Expone sqlalchemy.url a Alembic, por si algún comando lo lee
config.set_main_option("sqlalchemy.url", get_url())

def run_migrations_offline() -> None:
    """Modo offline: genera SQL sin conexión real."""
    url = get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        compare_type=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    """Modo online: conecta y aplica migraciones."""
    # Toma la sección [alembic] de alembic.ini y le inyecta la URL
    configuration = config.get_section(config.config_ini_section) or {}
    configuration["sqlalchemy.url"] = get_url()

    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",          # <<< IMPORTANTE: usa el prefijo correcto
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
