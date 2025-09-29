from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision = "20250926_000001"
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        "matches",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("creator_id", UUID(as_uuid=True), nullable=False),
        sa.Column("opponent_id", UUID(as_uuid=True), nullable=True),
        sa.Column("curriculum_id", UUID(as_uuid=True), nullable=True),
        sa.Column("objective_id", UUID(as_uuid=True), nullable=True),
        sa.Column("best_of", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="WAITING"),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
    )

    op.create_table(
        "rounds",
        sa.Column("match_id", UUID(as_uuid=True), nullable=False),
        sa.Column("n", sa.Integer(), nullable=False),
        sa.Column("exercise_id", UUID(as_uuid=True), nullable=False),
        sa.Column("objective_id", UUID(as_uuid=True), nullable=True),
        sa.Column("started_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column("ended_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("match_id", "n"),
        sa.ForeignKeyConstraint(["match_id"], ["matches.id"], ondelete="CASCADE"),
    )

    op.create_table(
        "answers",
        sa.Column("match_id", UUID(as_uuid=True), nullable=False),
        sa.Column("n", sa.Integer(), nullable=False),
        sa.Column("student_id", UUID(as_uuid=True), nullable=False),
        sa.Column("correct", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("time_ms", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("match_id", "n", "student_id"),
        sa.ForeignKeyConstraint(["match_id", "n"], ["rounds.match_id", "rounds.n"], ondelete="CASCADE"),
    )

def downgrade():
    op.drop_table("answers")
    op.drop_table("rounds")
    op.drop_table("matches")
