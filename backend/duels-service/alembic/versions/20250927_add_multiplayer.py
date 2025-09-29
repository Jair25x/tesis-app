"""add multiplayer columns and match_players table

Revision ID: 20250927_add_multiplayer
Revises: 20250926_000002_scpe
Create Date: 2025-09-27
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "20250927_add_multiplayer"
down_revision = "20250926_000002_scpe"
branch_labels = None
depends_on = None


def upgrade():
    # --- matches: nuevos campos ---
    op.add_column("matches", sa.Column("max_players", sa.Integer(), nullable=False, server_default="2"))
    op.add_column("matches", sa.Column("mode", sa.String(length=24), nullable=False, server_default="bestOf"))
    op.add_column("matches", sa.Column("question_time_sec", sa.Integer(), nullable=True))
    op.add_column("matches", sa.Column("win_target", sa.Integer(), nullable=True))

    # --- match_players: tabla para N jugadores ---
    op.create_table(
        "match_players",
        sa.Column("match_id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=64), nullable=False),
        sa.Column("joined_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("match_id", "user_id"),
    )
    op.create_index("ix_match_players_match", "match_players", ["match_id"])


def downgrade():
    op.drop_index("ix_match_players_match", table_name="match_players")
    op.drop_table("match_players")
    op.drop_column("matches", "win_target")
    op.drop_column("matches", "question_time_sec")
    op.drop_column("matches", "mode")
    op.drop_column("matches", "max_players")
