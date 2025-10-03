from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

# --- REVISIONS ---
revision = "20251001_fix_mp_uuid_fk"          # <= 32 chars
down_revision = "20250929_round_plan_winner"  # la tuya previa
branch_labels = None
depends_on = None


def upgrade():
    # 1) Limpieza: fila(s) inválidas o con match_id nulo/no-uuid
    #    Usamos una REGEXP defensiva sobre el valor textual del match_id.
    op.execute("""
        DELETE FROM match_players
        WHERE match_id IS NULL
           OR match_id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    """)

    # 2) Añadir columna temporal UUID y copiar datos casteados
    op.add_column("match_players", sa.Column("match_id_uuid_tmp", UUID(as_uuid=True), nullable=True))

    # Copiamos haciendo cast explícito (ya no hay filas inválidas por el paso 1)
    op.execute("UPDATE match_players SET match_id_uuid_tmp = match_id::uuid")

    # 3) Drop PK actual (match_id TEXT(36), user_id TEXT(64))
    op.execute("ALTER TABLE match_players DROP CONSTRAINT IF EXISTS match_players_pkey")

    # 4) Dropear columna antigua y renombrar la nueva
    with op.batch_alter_table("match_players") as batch:
        batch.drop_column("match_id")                    # era VARCHAR(36)
        batch.alter_column("match_id_uuid_tmp", new_column_name="match_id", existing_type=UUID(as_uuid=True), nullable=False)

    # 5) Crear nueva PK y FK hacia matches(id)
    op.execute("ALTER TABLE match_players ADD PRIMARY KEY (match_id, user_id)")
    op.create_foreign_key(
        "fk_match_players_match",
        source_table="match_players",
        referent_table="matches",
        local_cols=["match_id"],
        remote_cols=["id"],
        ondelete="CASCADE",
    )

    # 6) Índice útil para listar jugadores de un match
    op.create_index("ix_match_players_match", "match_players", ["match_id"], unique=False)


def downgrade():
    # Revertir index y FK
    op.drop_index("ix_match_players_match", table_name="match_players")
    op.drop_constraint("fk_match_players_match", "match_players", type_="foreignkey")

    # Volver a VARCHAR(36)
    op.execute("ALTER TABLE match_players DROP CONSTRAINT IF EXISTS match_players_pkey")
    op.add_column("match_players", sa.Column("match_id_tmp", sa.String(length=36), nullable=True))
    op.execute("UPDATE match_players SET match_id_tmp = match_id::text")

    with op.batch_alter_table("match_players") as batch:
        batch.drop_column("match_id")
        batch.alter_column("match_id_tmp", new_column_name="match_id", existing_type=sa.String(length=36), nullable=False)

    op.execute("ALTER TABLE match_players ADD PRIMARY KEY (match_id, user_id)")
