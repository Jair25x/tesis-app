# alembic/versions/20251029_answers_payload.py
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB

# IDs de revisión
revision = "20251029_answers_payload"
down_revision = "20251003_more_indexes"  # <-- ajusta si tu última difiere
branch_labels = None
depends_on = None

def upgrade():
    with op.batch_alter_table("answers") as batch:
        batch.add_column(sa.Column("payload", JSONB, nullable=True))
        batch.add_column(sa.Column("raw_payload", JSONB, nullable=True))
        batch.add_column(sa.Column("exercise_id", UUID(as_uuid=True), nullable=True))

    op.execute("""
        CREATE INDEX IF NOT EXISTS ix_answers_exercise
        ON answers (exercise_id)
    """)
    op.execute("""
        CREATE INDEX IF NOT EXISTS ix_answers_match_n_q
        ON answers (match_id, n, q_index)
    """)
    op.execute("""
        CREATE INDEX IF NOT EXISTS ix_answers_match_correct
        ON answers (match_id, correct)
    """)

def downgrade():
    op.execute("DROP INDEX IF EXISTS ix_answers_match_correct")
    op.execute("DROP INDEX IF EXISTS ix_answers_match_n_q")
    op.execute("DROP INDEX IF EXISTS ix_answers_exercise")
    with op.batch_alter_table("answers") as batch:
        batch.drop_column("exercise_id")
        batch.drop_column("raw_payload")
        batch.drop_column("payload")
