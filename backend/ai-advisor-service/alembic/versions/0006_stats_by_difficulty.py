# alembic/versions/0006_stats_by_difficulty.py
from alembic import op
import sqlalchemy as sa

revision = "0006_stats_by_difficulty"
down_revision = "0005_perf_indexes"
branch_labels = None
depends_on = None

def upgrade():
    op.add_column("student_objective_stats", sa.Column("attempts_easy", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("student_objective_stats", sa.Column("attempts_medium", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("student_objective_stats", sa.Column("attempts_hard", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("student_objective_stats", sa.Column("corrects_easy", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("student_objective_stats", sa.Column("corrects_medium", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("student_objective_stats", sa.Column("corrects_hard", sa.Integer(), nullable=False, server_default="0"))
    # limpia server_default para futuras inserciones
    op.alter_column("student_objective_stats", "attempts_easy", server_default=None)
    op.alter_column("student_objective_stats", "attempts_medium", server_default=None)
    op.alter_column("student_objective_stats", "attempts_hard", server_default=None)
    op.alter_column("student_objective_stats", "corrects_easy", server_default=None)
    op.alter_column("student_objective_stats", "corrects_medium", server_default=None)
    op.alter_column("student_objective_stats", "corrects_hard", server_default=None)

def downgrade():
    op.drop_column("student_objective_stats", "corrects_hard")
    op.drop_column("student_objective_stats", "corrects_medium")
    op.drop_column("student_objective_stats", "corrects_easy")
    op.drop_column("student_objective_stats", "attempts_hard")
    op.drop_column("student_objective_stats", "attempts_medium")
    op.drop_column("student_objective_stats", "attempts_easy")
