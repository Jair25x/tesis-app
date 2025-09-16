from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "0003_student_level_history"
down_revision = "0002_cosine_index"
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        "student_level_history",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("student_id", postgresql.UUID(as_uuid=True), nullable=False, index=True),
        sa.Column("phase", sa.String(length=16), nullable=False),  # INITIAL | MID | FINAL
        sa.Column("snapshot_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("level", sa.Integer(), nullable=False),  # 1..3
        sa.Column("probs", postgresql.JSONB(astext_type=sa.Text()), nullable=True),     # {"1":0.2,"2":0.5,"3":0.3}
        sa.Column("features", postgresql.JSONB(astext_type=sa.Text()), nullable=True),  # snapshot de features
        sa.Column("model_version", sa.String(length=64), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.UniqueConstraint("student_id", "phase", name="uq_student_phase")  # 1 registro por fase
    )

def downgrade():
    op.drop_table("student_level_history")
