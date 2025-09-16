# alembic/versions/0007_stats_defaults.py
from alembic import op
import sqlalchemy as sa
from sqlalchemy import text

revision = "0007_stats_defaults"
down_revision = "0006_stats_by_difficulty"
branch_labels = None
depends_on = None

def _set_default_zero(table: str, col: str):
    op.execute(text(f"ALTER TABLE {table} ALTER COLUMN {col} SET DEFAULT 0"))
    op.execute(text(f"UPDATE {table} SET {col} = 0 WHERE {col} IS NULL"))
    op.alter_column(table, col, existing_type=sa.Integer(), nullable=False)

def upgrade():
    cols = [
        "attempts_easy", "attempts_medium", "attempts_hard",
        "corrects_easy", "corrects_medium", "corrects_hard",
    ]
    for c in cols:
        _set_default_zero("student_objective_stats", c)

def downgrade():
    cols = [
        "attempts_easy", "attempts_medium", "attempts_hard",
        "corrects_easy", "corrects_medium", "corrects_hard",
    ]
    for c in cols:
        op.alter_column("student_objective_stats", c, existing_type=sa.Integer(), nullable=False)
        op.execute(text(f"ALTER TABLE student_objective_stats ALTER COLUMN {c} DROP DEFAULT"))
