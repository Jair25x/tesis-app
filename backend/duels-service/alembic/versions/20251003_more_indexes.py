from alembic import op

# revision identifiers, used by Alembic.
revision = "20251003_more_indexes"
down_revision = "20251003_answers_indexes"
branch_labels = None
depends_on = None


def upgrade():
    # match_players: muy usado para exists() y para listar jugadores por match
    op.execute("CREATE INDEX IF NOT EXISTS ix_match_players_match ON match_players (match_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_match_players_user ON match_players (user_id)")

    # rounds: para COUNT(DISTINCT n) por match_id en /teacher/matches
    op.execute("CREATE INDEX IF NOT EXISTS ix_rounds_match ON rounds (match_id)")

    # Por si consultas por ventana:
    op.execute("CREATE INDEX IF NOT EXISTS ix_rounds_match_n ON rounds (match_id, n)")

    # matches: ya tienes ix_matches_finished_at; reforzamos created_at si no existe
    op.execute("CREATE INDEX IF NOT EXISTS ix_matches_created_at ON matches (created_at)")

    # (defensivo) winner para agregados rápidos (top players win)
    op.execute("CREATE INDEX IF NOT EXISTS ix_matches_winner ON matches (winner_id)")


def downgrade():
    op.execute("DROP INDEX IF EXISTS ix_matches_winner")
    op.execute("DROP INDEX IF EXISTS ix_matches_created_at")
    op.execute("DROP INDEX IF EXISTS ix_rounds_match_n")
    op.execute("DROP INDEX IF EXISTS ix_rounds_match")
    op.execute("DROP INDEX IF EXISTS ix_match_players_user")
    op.execute("DROP INDEX IF EXISTS ix_match_players_match")
