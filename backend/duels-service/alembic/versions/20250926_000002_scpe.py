from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "20250926_000002_scpe"
down_revision = "20250926_000001"
branch_labels = None
depends_on = None

def upgrade():
    # matches: short_code + is_public (+ UNIQUE al short_code)
    with op.batch_alter_table("matches") as batch:
        batch.add_column(sa.Column("short_code", sa.String(length=12), nullable=True))
        batch.add_column(sa.Column("is_public", sa.Boolean(), nullable=False, server_default=sa.text("true")))
        batch.create_unique_constraint("uq_matches_short_code", ["short_code"])

    # Elo simple
    op.create_table(
        "duel_ratings",
        sa.Column("user_id", sa.String(length=64), primary_key=True),
        sa.Column("rating", sa.Integer(), nullable=False, server_default="1000"),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
    )

def downgrade():
    op.drop_table("duel_ratings")
    with op.batch_alter_table("matches") as batch:
        batch.drop_constraint("uq_matches_short_code", type_="unique")
        batch.drop_column("short_code")
        batch.drop_column("is_public")
