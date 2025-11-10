# alembic/versions/0014_cleanup_doc_chunks_text.py
from alembic import op
import sqlalchemy as sa

revision = "0015_cleanup_doc_chunks"
down_revision = "0014_doc_chunks_unique_idx"
branch_labels = None
depends_on = None

def upgrade():
    bind = op.get_bind()
    insp = sa.inspect(bind)

    cols = {c["name"] for c in insp.get_columns("doc_chunks")}

    # 1) Asegura que chunk_text exista
    if "chunk_text" not in cols:
        op.add_column("doc_chunks", sa.Column("chunk_text", sa.Text(), nullable=True))

        # refresca metadata
        cols = {c["name"] for c in insp.get_columns("doc_chunks")}

    # 2) Si existe columna legacy "text", haz backfill y elimínala
    if "text" in cols:
        # Copia datos existentes a chunk_text si faltan
        op.execute("UPDATE doc_chunks SET chunk_text = text WHERE chunk_text IS NULL")
        # Elimina la columna legacy
        op.drop_column("doc_chunks", "text")

    # 3) Endurece esquema: chunk_text NOT NULL
    # (si aún quedara algún NULL por rareza, lo deja como cadena vacía)
    op.execute("UPDATE doc_chunks SET chunk_text = '' WHERE chunk_text IS NULL")
    op.alter_column("doc_chunks", "chunk_text", nullable=False)

def downgrade():
    # Downgrade razonable: re-crear "text" como nullable y copiar desde chunk_text
    op.add_column("doc_chunks", sa.Column("text", sa.Text(), nullable=True))
    op.execute("UPDATE doc_chunks SET text = chunk_text WHERE text IS NULL")
    # Si quieres devolver chunk_text a nullable, hazlo (no obligatorio)
    op.alter_column("doc_chunks", "chunk_text", nullable=True)
