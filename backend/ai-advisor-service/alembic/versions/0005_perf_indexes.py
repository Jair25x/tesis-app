from alembic import op

# Revisión
revision = "0005_perf_indexes"
down_revision = "0004_trgm_doc_chunks_text"
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.execute("""
        CREATE INDEX IF NOT EXISTS idx_documents_objective_grade_subject
        ON documents (objective_id, grade, subject);
    """)
    op.execute("""
        CREATE INDEX IF NOT EXISTS idx_doc_chunks_created_at
        ON doc_chunks (created_at DESC);
    """)
    op.execute("""
        CREATE INDEX IF NOT EXISTS idx_documents_source
        ON documents (source);
    """)

def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS idx_documents_source;")
    op.execute("DROP INDEX IF EXISTS idx_doc_chunks_created_at;")
    op.execute("DROP INDEX IF EXISTS idx_documents_objective_grade_subject;")
