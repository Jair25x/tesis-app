"""answers.student_id -> VARCHAR(64)

Revision ID: 20251029_answers_student_id
Revises: 20251029_answers_payload
Create Date: 2025-10-29 21:30:00
"""
from alembic import op
import sqlalchemy as sa

# Reemplaza por tus IDs reales:
revision = "20251029_answers_student_id"
down_revision = "20251029_answers_payload"
branch_labels = None
depends_on = None

def upgrade():
    # Como student_id es parte de la PK, Postgres permite ALTER TYPE usando USING.
    # Si existieran FKs, habría que soltarlas y recrearlas; aquí no hay FK.
    op.alter_column(
        "answers",
        "student_id",
        type_=sa.String(length=64),
        postgresql_using="student_id::text"
    )

def downgrade():
    # Volver a UUID si hiciera falta.
    op.alter_column(
        "answers",
        "student_id",
        type_=sa.dialects.postgresql.UUID(as_uuid=False),
        postgresql_using="student_id::uuid"
    )
