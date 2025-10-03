from alembic import op
import sqlalchemy as sa

revision = "20250928_answers_qindex_pk"
down_revision = "20250928_add_qpr"
branch_labels = None
depends_on = None

def upgrade():
    # Añadir columna q_index con default 1
    with op.batch_alter_table("answers") as batch:
        batch.add_column(sa.Column("q_index", sa.Integer(), nullable=False, server_default="1"))

    # Rehacer PK: antes (match_id, n, student_id) → ahora (match_id, n, q_index, student_id)
    # Nota: batch_alter_table no soporta drop/create PK en todas las DB sin nombre, así que hacemos manual
    op.execute("ALTER TABLE answers DROP CONSTRAINT answers_pkey")
    op.execute("ALTER TABLE answers ADD PRIMARY KEY (match_id, n, q_index, student_id)")

def downgrade():
    # Volver al PK original y quitar q_index
    op.execute("ALTER TABLE answers DROP CONSTRAINT answers_pkey")
    op.execute("ALTER TABLE answers ADD PRIMARY KEY (match_id, n, student_id)")
    with op.batch_alter_table("answers") as batch:
        batch.drop_column("q_index")
