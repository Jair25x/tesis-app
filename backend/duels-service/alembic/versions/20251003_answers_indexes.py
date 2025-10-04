from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "20251003_answers_indexes"
down_revision = "20251002_add_finished_at"
branch_labels = None
depends_on = None

def upgrade():
    # Índices para acelerar KPIs en answers
    op.execute("""
        CREATE INDEX IF NOT EXISTS ix_answers_created_at
        ON answers (created_at)
    """)
    op.execute("""
        CREATE INDEX IF NOT EXISTS ix_answers_student
        ON answers (student_id)
    """)
    op.execute("""
        CREATE INDEX IF NOT EXISTS ix_answers_match
        ON answers (match_id)
    """)

    # (Opcional recomendado) Índices para filtros por currículum + ventana temporal
    op.execute("""
        CREATE INDEX IF NOT EXISTS ix_matches_curr_finished
        ON matches (curriculum_id, finished_at)
    """)
    op.execute("""
        CREATE INDEX IF NOT EXISTS ix_matches_curr_created
        ON matches (curriculum_id, created_at)
    """)

def downgrade():
    # Revert opcional primero
    op.execute("DROP INDEX IF EXISTS ix_matches_curr_created")
    op.execute("DROP INDEX IF EXISTS ix_matches_curr_finished")

    # Revert answers
    op.execute("DROP INDEX IF EXISTS ix_answers_match")
    op.execute("DROP INDEX IF EXISTS ix_answers_student")
    op.execute("DROP INDEX IF EXISTS ix_answers_created_at")
