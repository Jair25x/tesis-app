from alembic import op
import sqlalchemy as sa
from sqlalchemy import text

# Revisiones Alembic
revision = "20251101_matches_waiting"
down_revision = "20251031_round_picks_d"
branch_labels = None
depends_on = None

def _safe(conn, sql: str):
    conn.execute(text("SAVEPOINT sp_idx"))
    try:
        conn.execute(text(sql))
        conn.execute(text("RELEASE SAVEPOINT sp_idx"))
    except Exception:
        conn.execute(text("ROLLBACK TO SAVEPOINT sp_idx"))

def _index_exists(conn, idxname: str) -> bool:
    q = text("""
      SELECT 1
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relkind = 'i' AND c.relname = :n
      LIMIT 1
    """)
    return conn.execute(q, {"n": idxname}).fetchone() is not None

def upgrade():
    conn = op.get_bind()
    # Índice compuesto para /open y limpieza de lobbies (últimos primero)
    if not _index_exists(conn, "ix_matches_waiting_public"):
        # Usa CONCURRENTLY si tu DB permite (en transacción autocommit). Si no, cae en normal.
        _safe(conn, "CREATE INDEX ix_matches_waiting_public ON matches(status, is_public, created_at DESC)")

def downgrade():
    conn = op.get_bind()
    _safe(conn, "DROP INDEX IF EXISTS ix_matches_waiting_public")
