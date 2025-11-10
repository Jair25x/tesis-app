# alembic/versions/0012_doc_chunks_metadata.py
from alembic import op
import sqlalchemy as sa

revision = "0012_doc_chunks_metadata"
down_revision = "0011_add_updated_at_to_documents"
branch_labels = None
depends_on = None


def _has_column(bind, table_name: str, col_name: str) -> bool:
    insp = sa.inspect(bind)
    return any(c["name"] == col_name for c in insp.get_columns(table_name))


def upgrade():
    bind = op.get_bind()

    # 1) Asegura pgvector (idempotente)
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    # 2) Agrega columnas que usa el seed (solo si faltan)
    if not _has_column(bind, "doc_chunks", "title"):
        op.add_column("doc_chunks", sa.Column("title", sa.String(255), nullable=True))

    if not _has_column(bind, "doc_chunks", "subject"):
        op.add_column("doc_chunks", sa.Column("subject", sa.String(32), nullable=True))

    if not _has_column(bind, "doc_chunks", "grade"):
        op.add_column("doc_chunks", sa.Column("grade", sa.String(16), nullable=True))

    if not _has_column(bind, "doc_chunks", "unit"):
        op.add_column("doc_chunks", sa.Column("unit", sa.String(64), nullable=True))

    if not _has_column(bind, "doc_chunks", "created_at"):
        op.add_column(
            "doc_chunks",
            sa.Column(
                "created_at",
                sa.TIMESTAMP(timezone=True),
                server_default=sa.text("now()"),
                nullable=False,
            ),
        )

    if not _has_column(bind, "doc_chunks", "updated_at"):
        op.add_column(
            "doc_chunks",
            sa.Column(
                "updated_at",
                sa.TIMESTAMP(timezone=True),
                server_default=sa.text("now()"),
                nullable=False,
            ),
        )

    # 3) Columna vector(1536) para embeddings (OpenAI text-embedding-3-small)
    if not _has_column(bind, "doc_chunks", "embedding"):
        op.execute("ALTER TABLE doc_chunks ADD COLUMN embedding vector(1536)")

    # 4) Trigger updated_at (idempotente)
    op.execute(
        """
        CREATE OR REPLACE FUNCTION set_timestamp_doc_chunks_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = now();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        """
    )
    op.execute("DROP TRIGGER IF EXISTS trg_doc_chunks_set_updated_at ON doc_chunks")
    op.execute(
        """
        CREATE TRIGGER trg_doc_chunks_set_updated_at
        BEFORE UPDATE ON doc_chunks
        FOR EACH ROW EXECUTE FUNCTION set_timestamp_doc_chunks_updated_at();
        """
    )

    # 5) Índices útiles
    op.execute("CREATE INDEX IF NOT EXISTS idx_doc_chunks_doc_id ON doc_chunks(doc_id)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_doc_chunks_meta ON doc_chunks(subject, grade, unit)")

    # 6) Índice vectorial (si ivfflat está disponible)
    try:
        op.execute(
            "CREATE INDEX IF NOT EXISTS idx_doc_chunks_embedding "
            "ON doc_chunks USING ivfflat (embedding vector_l2_ops)"
        )
    except Exception:
        # Si la versión de pgvector no soporta ivfflat aquí, lo ignoramos
        pass


def downgrade():
    # No destruimos columnas/datos en downgrade por seguridad.
    pass
