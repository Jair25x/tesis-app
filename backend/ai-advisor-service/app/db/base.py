# app/db/base.py
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    """Base declarativa para todos los modelos."""
    pass

# Asegura que los modelos se registren (útil para Alembic/IDE)
# Nota: en alembic/env.py ya importas estos módulos; esto es redundante pero inofensivo.
from app.models import rag as _rag  # noqa: F401
from app.models import signals as _signals  # noqa: F401
from app.models import cache as _cache  # noqa: F401
from app.models import events as _events  # noqa: F401
from app.models import chat as _chat  # noqa: F401
