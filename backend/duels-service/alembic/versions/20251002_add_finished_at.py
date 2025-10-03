from alembic import op
import sqlalchemy as sa

# ids
revision = "20251002_add_finished_at"
down_revision = "20251001_duels_indexes"
branch_labels = None
depends_on = None

def upgrade():
    with op.batch_alter_table("matches") as batch:
        batch.add_column(sa.Column("finished_at", sa.TIMESTAMP(timezone=True), nullable=True))
    # índice útil para reportes por ventana de tiempo
    op.execute("""
        CREATE INDEX IF NOT EXISTS ix_matches_finished_at
        ON matches (finished_at)
    """)

def downgrade():
    op.execute("DROP INDEX IF EXISTS ix_matches_finished_at")
    with op.batch_alter_table("matches") as batch:
        batch.drop_column("finished_at")
