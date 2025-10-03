from alembic import op
import sqlalchemy as sa

# Revisions
revision = "20251001_duels_indexes"
down_revision = "20251001_fix_mp_uuid_fk"
branch_labels = None
depends_on = None


def upgrade():
    # 1) Index compuesto para el Hub (status + is_public + created_at)
    op.execute("""
        CREATE INDEX IF NOT EXISTS ix_matches_status_public_created
        ON matches (status, is_public, created_at DESC);
    """)

    # 2) Index por match_id en match_players (ya lo creaste en la migración anterior;
    #    esto es idempotente por si en algún entorno faltara)
    op.execute("""
        CREATE INDEX IF NOT EXISTS ix_match_players_match
        ON match_players (match_id);
    """)

    # 3) (Opcional) Index funcional para resolución rápida de códigos case-insensitive
    #    OJO: requiere Postgres. Útil para resolve_short_code(upper(short_code)=...)
    op.execute("""
        CREATE INDEX IF NOT EXISTS ix_matches_upper_shortcode
        ON matches (upper(short_code));
    """)


def downgrade():
    # Borramos en orden inverso
    op.execute("DROP INDEX IF EXISTS ix_matches_upper_shortcode;")
    op.execute("DROP INDEX IF EXISTS ix_match_players_match;")
    op.execute("DROP INDEX IF EXISTS ix_matches_status_public_created;")
