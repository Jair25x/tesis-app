# ai-advisor-service/alembic/versions/0011_add_updated_at_to_documents.py
from alembic import op
import sqlalchemy as sa

revision = "0011_add_updated_at_to_documents"
down_revision = "0010_add_unit_to_documents"  # <-- asegura que coincide con tu 0010
branch_labels = None
depends_on = None

def upgrade():
    # 1) Columna updated_at (tz aware) con default now()
    op.add_column(
        "documents",
        sa.Column(
            "updated_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )

    # 2) Trigger para mantener updated_at en updates
    op.execute(
        """
        CREATE OR REPLACE FUNCTION set_timestamp_documents_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        """
    )

    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_trigger
                WHERE tgname = 'trg_documents_set_updated_at'
            ) THEN
                CREATE TRIGGER trg_documents_set_updated_at
                BEFORE UPDATE ON documents
                FOR EACH ROW
                EXECUTE FUNCTION set_timestamp_documents_updated_at();
            END IF;
        END
        $$;
        """
    )

def downgrade():
    # Eliminar trigger y función
    op.execute(
        """
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM pg_trigger
                WHERE tgname = 'trg_documents_set_updated_at'
            ) THEN
                DROP TRIGGER trg_documents_set_updated_at ON documents;
            END IF;
        END
        $$;
        """
    )

    op.execute(
        """
        DROP FUNCTION IF EXISTS set_timestamp_documents_updated_at();
        """
    )

    # Eliminar columna
    op.drop_column("documents", "updated_at")
