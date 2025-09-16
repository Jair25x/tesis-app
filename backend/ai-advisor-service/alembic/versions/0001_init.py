# alembic/versions/0001_init.py
from alembic import op
import sqlalchemy as sa
from pgvector.sqlalchemy import Vector  # <-- IMPORT CORRECTO

# Revisión
revision = "0001_init"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Extensión pgvector (segura si ya existe)
    op.execute("CREATE EXTENSION IF NOT EXISTS vector;")

    # Tabla: documents
    op.create_table(
        "documents",
        sa.Column("id", sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("grade", sa.String(length=16), nullable=True),
        sa.Column("subject", sa.String(length=32), nullable=True),
        sa.Column("objective_id", sa.dialects.postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("source", sa.String(length=64), nullable=True),
        sa.Column("version", sa.String(length=32), nullable=True),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
    )

    # Tabla: doc_chunks (RAG + embeddings)
    op.create_table(
        "doc_chunks",
        sa.Column("id", sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("doc_id", sa.dialects.postgresql.UUID(as_uuid=True), sa.ForeignKey("documents.id", ondelete="CASCADE"), nullable=False),
        sa.Column("chunk_index", sa.Integer(), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("tokens", sa.Integer(), nullable=True),
        sa.Column("embedding", Vector(dim=1536), nullable=True),  # <-- AQUÍ
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
    )

    # Índice ANN sobre embeddings (ivfflat)
    # Usa vector_l2_ops si tu métrica es L2; si preferirás coseno, cambia a vector_cosine_ops
    op.execute(
        "CREATE INDEX doc_chunks_embedding_idx ON doc_chunks USING ivfflat (embedding vector_l2_ops) WITH (lists = 100);"
    )
    # Índices útiles
    op.create_index("ix_doc_chunks_doc_id", "doc_chunks", ["doc_id"])
    op.create_index("ix_doc_chunks_chunk_index", "doc_chunks", ["chunk_index"])

    # Tabla: student_objective_stats (acumuladores por alumno/objetivo)
    op.create_table(
        "student_objective_stats",
        sa.Column("student_id", sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("objective_id", sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("attempts", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("corrects", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("avg_score", sa.Numeric(5, 2), nullable=True),
        sa.Column("last_attempt_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column("streak", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("efactor", sa.Numeric(3, 2), nullable=True),
    )

    # Tabla: advisor_events (idempotencia por submission_item_id)
    op.create_table(
        "advisor_events",
        sa.Column("id", sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("submission_item_id", sa.dialects.postgresql.UUID(as_uuid=True), nullable=False, unique=True),
        sa.Column("payload", sa.JSON(), nullable=False),
        sa.Column("received_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_advisor_events_submission_item_id", "advisor_events", ["submission_item_id"], unique=True)

    # (Opcional) Tabla: recommendations_cache (cache JSONB por alumno)
    op.create_table(
        "recommendations_cache",
        sa.Column("student_id", sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("payload", sa.JSON(), nullable=False),
        sa.Column("generated_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("recommendations_cache")
    op.drop_index("ix_advisor_events_submission_item_id", table_name="advisor_events")
    op.drop_table("advisor_events")
    op.drop_table("student_objective_stats")
    op.drop_index("ix_doc_chunks_chunk_index", table_name="doc_chunks")
    op.drop_index("ix_doc_chunks_doc_id", table_name="doc_chunks")
    op.execute("DROP INDEX IF EXISTS doc_chunks_embedding_idx;")
    op.drop_table("doc_chunks")
    op.drop_table("documents")
    # No solemos dropear la extensión vector en entornos compartidos
