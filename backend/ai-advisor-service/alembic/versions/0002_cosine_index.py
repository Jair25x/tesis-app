# alembic/versions/0002_cosine_index.py
from alembic import op

# Revisión
revision = "0002_cosine_index"
down_revision = "0001_init"
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Cambiamos el índice ANN a coseno
    op.execute("DROP INDEX IF EXISTS doc_chunks_embedding_idx;")
    op.execute(
        "CREATE INDEX doc_chunks_embedding_idx "
        "ON doc_chunks USING ivfflat (embedding vector_cosine_ops) "
        "WITH (lists = 100);"
    )

def downgrade() -> None:
    # Volver a L2 si hiciera falta
    op.execute("DROP INDEX IF EXISTS doc_chunks_embedding_idx;")
    op.execute(
        "CREATE INDEX doc_chunks_embedding_idx "
        "ON doc_chunks USING ivfflat (embedding vector_l2_ops) "
        "WITH (lists = 100);"
    )
