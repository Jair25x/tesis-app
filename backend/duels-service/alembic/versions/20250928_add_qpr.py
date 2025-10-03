from alembic import op
import sqlalchemy as sa

revision = "20250928_add_qpr"
down_revision = "20250927_add_multiplayer"
branch_labels = None
depends_on = None

def upgrade():
    with op.batch_alter_table("matches") as batch:
        batch.add_column(sa.Column("questions_per_round", sa.Integer(), nullable=False, server_default="1"))

def downgrade():
    with op.batch_alter_table("matches") as batch:
        batch.drop_column("questions_per_round")
