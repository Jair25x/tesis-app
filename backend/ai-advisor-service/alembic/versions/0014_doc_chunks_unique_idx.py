# alembic/versions/0014_doc_chunks_unique_idx.py
from alembic import op
import sqlalchemy as sa

revision = "0014_doc_chunks_unique_idx"
down_revision = "0013_add_chunk_text_to_d"
branch_labels = None
depends_on = None

def upgrade():
    # Asegura columnas clave
    bind = op.get_bind()
    insp = sa.inspect(bind)
    cols = {c["name"] for c in insp.get_columns("doc_chunks")}
    # (No las creamos aquí; asumimos migraciones previas ya las añadieron.)

    # Índice único (doc_id, chunk_index)
    op.execute("""
        CREATE UNIQUE INDEX IF NOT EXISTS ux_doc_chunks_doc_idx
        ON doc_chunks (doc_id, chunk_index)
    """)

def downgrade():
    # No eliminar por seguridad (evita colisiones silenciosas).
    pass
