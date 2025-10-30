# alembic revision: 20251030_fix_rounds_fk
from alembic import op
import sqlalchemy as sa
from sqlalchemy import text

# Revisiones Alembic
revision = "20251030_fix_rounds_fk"
down_revision = "20251029_answers_student_id"
branch_labels = None
depends_on = None

# ------------------------------------------------------------
# Helpers defensivos
# ------------------------------------------------------------
def _safe(conn, sql: str):
    """Ejecuta un SQL dentro de un SAVEPOINT; si falla, rollback al SAVEPOINT y continúa."""
    conn.execute(text("SAVEPOINT sp_fx"))
    try:
        conn.execute(text(sql))
        conn.execute(text("RELEASE SAVEPOINT sp_fx"))
    except Exception:
        conn.execute(text("ROLLBACK TO SAVEPOINT sp_fx"))

def _table_exists(insp, table_name: str) -> bool:
    try:
        return table_name in insp.get_table_names()
    except Exception:
        return False

def _col_is_uuid(conn, table: str, column: str) -> bool:
    q = text("""
        SELECT data_type
        FROM information_schema.columns
        WHERE table_name = :t AND column_name = :c
        LIMIT 1
    """)
    row = conn.execute(q, {"t": table, "c": column}).fetchone()
    return bool(row and str(row[0]).lower() == "uuid")

def _constraint_exists(conn, conname: str) -> bool:
    q = text("""
        SELECT 1
        FROM pg_constraint
        WHERE conname = :n
        LIMIT 1
    """)
    return conn.execute(q, {"n": conname}).fetchone() is not None

# ------------------------------------------------------------
# Upgrade
# ------------------------------------------------------------
def upgrade():
    conn = op.get_bind()
    insp = sa.inspect(conn)

    # 1) round_picks: asegurar existencia para que la introspección no falle
    if not _table_exists(insp, "round_picks"):
        # Crea una versión mínima; ajusta si ya la tienes con otra PK
        _safe(conn, """
        CREATE TABLE IF NOT EXISTS round_picks (
            match_id  UUID NOT NULL,
            n         INTEGER NOT NULL,
            q_index   INTEGER NOT NULL,
            exercise_id UUID NOT NULL,
            PRIMARY KEY (match_id, n, q_index)
        );
        """)

    # Recalcular inspector por si acabamos de crear tablas
    insp = sa.inspect(conn)

    # 2) Asegurar tipos UUID donde corresponde en round_picks
    for col in ("match_id", "exercise_id"):
        if not _col_is_uuid(conn, "round_picks", col):
            _safe(conn, f"""
            ALTER TABLE round_picks
            ALTER COLUMN {col} TYPE UUID USING {col}::uuid;
            """)

    # 3) Unicidad/PK adicional en round_picks (si tu modelo usa PK compuesta ya es suficiente,
    #    pero si prefieres una UNIQUE explícita, la agregamos solo si falta)
    if not _constraint_exists(conn, "uq_round_picks_match_n_q"):
        _safe(conn, """
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'uq_round_picks_match_n_q'
          ) THEN
            ALTER TABLE round_picks
            ADD CONSTRAINT uq_round_picks_match_n_q UNIQUE (match_id, n, q_index);
          END IF;
        END$$;
        """)

    # 4) Fix en rounds: ejemplo de FK y PK compuesta defensiva (ajusta a tu modelo real)
    #    — Evita fallar si ya existen o si los nombres son distintos.
    #    A) PK (match_id, n)
    if not _constraint_exists(conn, "pk_rounds_match_n"):
        _safe(conn, """
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'pk_rounds_match_n'
          ) THEN
            -- intenta crear PK compuesta si no existe ya
            ALTER TABLE rounds
            ADD CONSTRAINT pk_rounds_match_n PRIMARY KEY (match_id, n);
          END IF;
        END$$;
        """)

    #    B) FK rounds.match_id -> matches(id) ON DELETE CASCADE
    if not _constraint_exists(conn, "fk_rounds_match"):
        _safe(conn, """
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'fk_rounds_match'
          ) THEN
            ALTER TABLE rounds
            ADD CONSTRAINT fk_rounds_match
            FOREIGN KEY (match_id) REFERENCES matches (id) ON DELETE CASCADE;
          END IF;
        END$$;
        """)

    # 5) Fix en answers: ejemplo de FKs mínimas para no romper (ajusta a tu esquema real)
    #    FK answers.match_id -> matches(id)
    if not _constraint_exists(conn, "fk_answers_match"):
        _safe(conn, """
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'fk_answers_match'
          ) THEN
            ALTER TABLE answers
            ADD CONSTRAINT fk_answers_match
            FOREIGN KEY (match_id) REFERENCES matches (id) ON DELETE CASCADE;
          END IF;
        END$$;
        """)

    #    Opcional: si tienes answers.exercise_id (UUID), convierte tipo si hiciera falta
    try:
        if not _col_is_uuid(conn, "answers", "exercise_id"):
            _safe(conn, """
            ALTER TABLE answers
            ALTER COLUMN exercise_id TYPE UUID USING exercise_id::uuid;
            """)
    except Exception:
        # Si no existe la columna, lo ignoramos
        pass

    # 6) Opcional: FK round_picks.match_id -> matches(id) (si te aporta integridad)
    if not _constraint_exists(conn, "fk_round_picks_match"):
        _safe(conn, """
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'fk_round_picks_match'
          ) THEN
            ALTER TABLE round_picks
            ADD CONSTRAINT fk_round_picks_match
            FOREIGN KEY (match_id) REFERENCES matches (id) ON DELETE CASCADE;
          END IF;
        END$$;
        """)

    # Nota: Si tenías intentos de DROP CONSTRAINT con nombres incorrectos,
    # este enfoque evita romper la transacción y sigue con lo restante.

def downgrade():
    # Deja una reversión mínima/no destructiva para no complicar rollbacks
    pass
