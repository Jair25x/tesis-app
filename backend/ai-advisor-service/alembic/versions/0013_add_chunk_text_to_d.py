# alembic/versions/0013_add_chunk_text_to_doc_chunks.py
from alembic import op
import sqlalchemy as sa

revision = "0013_add_chunk_text_to_d"
down_revision = "0012_doc_chunks_metadata"
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    insp = sa.inspect(bind)

    # 1) Agregar columna chunk_text si no existe
    cols = {c["name"] for c in insp.get_columns("doc_chunks")}
    if "chunk_text" not in cols:
        op.add_column("doc_chunks", sa.Column("chunk_text", sa.Text(), nullable=True))

    # 2) Si existiera alguna columna previa tipo 'content' o 'text', migra su valor
    #    (no rompe si no existen)
    if "content" in cols:
        op.execute("UPDATE doc_chunks SET chunk_text = content WHERE chunk_text IS NULL")
    elif "text" in cols:
        op.execute("UPDATE doc_chunks SET chunk_text = text WHERE chunk_text IS NULL")

    # 3) Índice (opcional, útil para búsquedas por texto sin vector)
    op.execute(
        "CREATE INDEX IF NOT EXISTS idx_doc_chunks_title ON doc_chunks(title)"
    )


def downgrade():
    # Por seguridad, no borramos datos/columnas en downgrade.
    pass
