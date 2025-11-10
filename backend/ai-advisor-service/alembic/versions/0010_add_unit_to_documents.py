# ai-advisor-service/alembic/versions/0010_add_unit_to_documents.py
from alembic import op
import sqlalchemy as sa

# Ajusta el revision si ya existe uno igual, pero usa un ID único tipo timestamp si prefieres
revision = "0010_add_unit_to_documents"
down_revision = "0009_avg_score_scale"
branch_labels = None
depends_on = None

def upgrade():
    # Agregar columna 'unit' nullable a documents
    with op.batch_alter_table("documents") as batch_op:
        batch_op.add_column(sa.Column("unit", sa.String(length=64), nullable=True))
    # (Opcional) Índice si vas a filtrar por grade/subject/unit:
    # op.create_index(
    #     "idx_documents_grade_subject_unit",
    #     "documents",
    #     ["grade", "subject", "unit"],
    #     unique=False
    # )

def downgrade():
    # (Opcional) si creaste el índice arriba, primero elimínalo:
    # op.drop_index("idx_documents_grade_subject_unit", table_name="documents")
    with op.batch_alter_table("documents") as batch_op:
        batch_op.drop_column("unit")
