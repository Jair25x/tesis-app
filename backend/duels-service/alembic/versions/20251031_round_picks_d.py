# alembic revision: 20251031_round_picks_d
from alembic import op
import sqlalchemy as sa
from sqlalchemy import text

# Revisiones Alembic
revision = "20251031_round_picks_d"
down_revision = "20251030_fix_rounds_fk"
branch_labels = None
depends_on = None

# ------------------------------------------------------------
# Helpers defensivos
# ------------------------------------------------------------
def _safe(conn, sql: str):
    """Ejecuta SQL en SAVEPOINT; si falla, rollback y continúa."""
    conn.execute(text("SAVEPOINT sp_fx"))
    try:
        conn.execute(text(sql))
        conn.execute(text("RELEASE SAVEPOINT sp_fx"))
    except Exception:
        conn.execute(text("ROLLBACK TO SAVEPOINT sp_fx"))

def _table_exists(insp, table: str) -> bool:
    try:
        return table in insp.get_table_names()
    except Exception:
        return False

def _has_column(conn, table: str, col: str) -> bool:
    q = text("""
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = :t AND column_name = :c
        LIMIT 1
    """)
    return conn.execute(q, {"t": table, "c": col}).fetchone() is not None

def _constraint_exists(conn, conname: str) -> bool:
    q = text("SELECT 1 FROM pg_constraint WHERE conname = :n LIMIT 1")
    return conn.execute(q, {"n": conname}).fetchone() is not None

def _index_exists(conn, idxname: str) -> bool:
    q = text("""
      SELECT 1
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relkind = 'i' AND c.relname = :n
      LIMIT 1
    """)
    return conn.execute(q, {"n": idxname}).fetchone() is not None

# ------------------------------------------------------------
# Upgrade
# ------------------------------------------------------------
def upgrade():
    conn = op.get_bind()
    insp = sa.inspect(conn)

    # 1) rounds.exercise_id -> permitir NULL (o remover si prefieres)
    if _table_exists(insp, "rounds") and _has_column(conn, "rounds", "exercise_id"):
        _safe(conn, """
        ALTER TABLE rounds
        ALTER COLUMN exercise_id DROP NOT NULL
        """)

        # (Opcional) Index para consultas antiguas (no es crítico)
        if not _index_exists(conn, "idx_rounds_match_n"):
            _safe(conn, "CREATE INDEX idx_rounds_match_n ON rounds(match_id, n)")

    # 2) Crear/asegurar round_picks
    if not _table_exists(insp, "round_picks"):
        _safe(conn, """
        CREATE TABLE round_picks (
          match_id    UUID    NOT NULL,
          n           INTEGER NOT NULL,
          q_index     INTEGER NOT NULL,
          exercise_id UUID    NOT NULL,
          created_at  TIMESTAMPTZ DEFAULT NOW(),
          PRIMARY KEY (match_id, n, q_index)
        )
        """)
    # FK -> rounds(match_id, n) ON DELETE CASCADE (idempotente por nombre)
    if not _constraint_exists(conn, "fk_round_picks_round"):
        _safe(conn, """
        ALTER TABLE round_picks
        ADD CONSTRAINT fk_round_picks_round
        FOREIGN KEY (match_id, n)
        REFERENCES rounds (match_id, n)
        ON DELETE CASCADE
        """)

    # (Opcional) FK adicional a matches para legibilidad
    if not _constraint_exists(conn, "fk_round_picks_match"):
        _safe(conn, """
        ALTER TABLE round_picks
        ADD CONSTRAINT fk_round_picks_match
        FOREIGN KEY (match_id)
        REFERENCES matches (id)
        ON DELETE CASCADE
        """)

    # Index para exercise_id (útil para analytics/depuración)
    if not _index_exists(conn, "idx_round_picks_exercise"):
        _safe(conn, "CREATE INDEX idx_round_picks_exercise ON round_picks(exercise_id)")

    # 3) Asegurar PK compuesta en rounds (si no existe)
    #    (algunas instalaciones la tienen con otro nombre; esto es defensivo)
    if not _constraint_exists(conn, "pk_rounds_match_n"):
        _safe(conn, """
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'pk_rounds_match_n'
          ) THEN
            ALTER TABLE rounds
            ADD CONSTRAINT pk_rounds_match_n PRIMARY KEY (match_id, n);
          END IF;
        END$$;
        """)

    # 4) FKs mínimas en answers
    if not _constraint_exists(conn, "fk_answers_match"):
        _safe(conn, """
        ALTER TABLE answers
        ADD CONSTRAINT fk_answers_match
        FOREIGN KEY (match_id) REFERENCES matches (id) ON DELETE CASCADE
        """)
    if not _constraint_exists(conn, "fk_answers_round"):
        _safe(conn, """
        ALTER TABLE answers
        ADD CONSTRAINT fk_answers_round
        FOREIGN KEY (match_id, n) REFERENCES rounds (match_id, n) ON DELETE CASCADE
        """)

    # 5) Unicidad: una respuesta por usuario/pregunta
    if not _index_exists(conn, "uq_answers_match_round_q_student"):
        _safe(conn, """
        CREATE UNIQUE INDEX uq_answers_match_round_q_student
        ON answers (match_id, n, q_index, student_id)
        """)

    # 6) Backfill: rounds.exercise_id → round_picks(q_index=1)
    #    (para matches antiguos que guardaban el ejercicio en la ronda)
    _safe(conn, """
    INSERT INTO round_picks (match_id, n, q_index, exercise_id)
    SELECT r.match_id, r.n, 1, r.exercise_id
    FROM rounds r
    WHERE r.exercise_id IS NOT NULL
    ON CONFLICT (match_id, n, q_index) DO NOTHING
    """)

# ------------------------------------------------------------
# Downgrade (no destructivo)
# ------------------------------------------------------------
def downgrade():
    # Deja la estructura estable. Si insistes en revertir:
    conn = op.get_bind()

    # 1) Quitar índice de unicidad en answers (opcional)
    _safe(conn, "DROP INDEX IF EXISTS uq_answers_match_round_q_student")

    # 2) Quitar FKs opcionales (no destruye datos)
    _safe(conn, "ALTER TABLE answers DROP CONSTRAINT IF EXISTS fk_answers_round")
    _safe(conn, "ALTER TABLE answers DROP CONSTRAINT IF EXISTS fk_answers_match")
    _safe(conn, "ALTER TABLE round_picks DROP CONSTRAINT IF EXISTS fk_round_picks_round")
    _safe(conn, "ALTER TABLE round_picks DROP CONSTRAINT IF EXISTS fk_round_picks_match")

    # 3) Dejar round_picks (no lo borro para no perder backfill). Si de verdad necesitas:
    # _safe(conn, "DROP TABLE IF EXISTS round_picks")
    pass
