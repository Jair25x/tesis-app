# alembic/env.py
from __future__ import annotations

import os
import sys
from logging.config import fileConfig
from alembic import context
from sqlalchemy import engine_from_config, pool

# ===== Asegura que el root del proyecto esté en sys.path =====
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from app.models import Base  # Base = declarative_base()

# ===== Alembic Config =====
config = context.config

# Logging desde alembic.ini si existe; si no, ignora
if config.config_file_name and os.path.exists(config.config_file_name):
    fileConfig(config.config_file_name)

# ===== Define DB_URL ANTES de leer la sección [alembic] =====
# Esto resuelve la interpolación de %(DB_URL)s en alembic.ini
DB_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg://postgres:misan@duels-db:5432/duelsdb",
)
config.set_main_option("DB_URL", DB_URL)

# Metadata a trackear (autogenerate)
target_metadata = Base.metadata

def run_migrations_offline() -> None:
    """Ejecuta migraciones en modo 'offline' (sin conexión)."""
    context.configure(
        url=DB_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        compare_type=True,
        compare_server_default=True,
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    """Ejecuta migraciones en modo 'online' (con conexión)."""
    # Carga la sección ya con DB_URL interpolado correctamente
    cfg_section = config.get_section(config.config_ini_section) or {}
    # Por si acaso, fuerza la URL aquí también:
    cfg_section["sqlalchemy.url"] = DB_URL

    connectable = engine_from_config(
        cfg_section,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
        future=True,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
        )
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
