# alembic/versions/0009_avg_score_scale.py
from alembic import op
import sqlalchemy as sa

revision = "0009_avg_score_scale"
down_revision = "0008_chat_conversations"
branch_labels = None
depends_on = None

def upgrade():
    op.alter_column("student_objective_stats", "avg_score",
                    type_=sa.Numeric(4, 3), existing_nullable=True)

def downgrade():
    op.alter_column("student_objective_stats", "avg_score",
                    type_=sa.Numeric(5, 2), existing_nullable=True)
