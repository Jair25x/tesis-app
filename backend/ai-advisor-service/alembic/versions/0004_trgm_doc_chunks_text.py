# alembic revision -m "pg_trgm index for doc_chunks.text"
from alembic import op

revision = "0004_trgm_doc_chunks_text"
down_revision = "0003_student_level_history"
branch_labels = None
depends_on = None

def upgrade():
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm;")
    op.execute("CREATE INDEX IF NOT EXISTS idx_doc_chunks_text_trgm ON doc_chunks USING GIN (text gin_trgm_ops);")

def downgrade():
    op.execute("DROP INDEX IF EXISTS idx_doc_chunks_text_trgm;")
