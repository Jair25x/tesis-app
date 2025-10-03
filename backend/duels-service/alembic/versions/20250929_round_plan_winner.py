from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

# revision identifiers, used by Alembic.
revision = "20250929_round_plan_winner"
down_revision = "20250928_answers_qindex_pk"
branch_labels = None
depends_on = None


def upgrade():
    # --- matches: winner_id y difficulty ---
    with op.batch_alter_table("matches") as batch:
        # ganador del duelo (para W/L)
        batch.add_column(sa.Column("winner_id", UUID(as_uuid=True), nullable=True))
        batch.create_index("ix_matches_winner_id", ["winner_id"], unique=False)
        # dificultad global (opcional, string corta)
        batch.add_column(sa.Column("difficulty", sa.String(length=16), nullable=True))

    # --- round_configs: configuración por ronda ---
    op.create_table(
        "round_configs",
        sa.Column("match_id", UUID(as_uuid=True), nullable=False),
        sa.Column("n", sa.Integer(), nullable=False),
        sa.Column("questions", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("difficulty", sa.String(length=16), nullable=True),
        sa.PrimaryKeyConstraint("match_id", "n"),
    )
    op.create_index("ix_round_configs_match_n", "round_configs", ["match_id", "n"], unique=False)

    # --- round_picks: picks exactos por sub-pregunta ---
    op.create_table(
        "round_picks",
        sa.Column("match_id", UUID(as_uuid=True), nullable=False),
        sa.Column("n", sa.Integer(), nullable=False),
        sa.Column("q_index", sa.Integer(), nullable=False),
        sa.Column("exercise_id", UUID(as_uuid=True), nullable=False),
        sa.PrimaryKeyConstraint("match_id", "n", "q_index"),
    )
    op.create_index("ix_round_picks_match_n_q", "round_picks", ["match_id", "n", "q_index"], unique=False)


def downgrade():
    # Tablas nuevas
    op.drop_index("ix_round_picks_match_n_q", table_name="round_picks")
    op.drop_table("round_picks")

    op.drop_index("ix_round_configs_match_n", table_name="round_configs")
    op.drop_table("round_configs")

    # matches: columnas nuevas
    with op.batch_alter_table("matches") as batch:
        batch.drop_index("ix_matches_winner_id")
        batch.drop_column("winner_id")
        batch.drop_column("difficulty")
