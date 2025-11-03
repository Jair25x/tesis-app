-- V2__tuning.sql
-- Índices y salvaguardas adicionales para rendimiento e integridad

-- =========================
-- CLASSROOMS
-- =========================

-- Listar aulas por docente y estado activo
CREATE INDEX IF NOT EXISTS idx_classroom_owner_active
  ON classrooms(owner_uuid, active);

-- (Opcional) Búsqueda por nombre con LIKE/ILIKE: requiere extensión pg_trgm
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') THEN
    CREATE EXTENSION pg_trgm;
  END IF;
END
$$;

-- Acelera ILIKE '%texto%' sobre LOWER(name)
CREATE INDEX IF NOT EXISTS gin_classrooms_name_trgm
  ON classrooms USING GIN (lower(name) gin_trgm_ops);

-- =========================
-- CLASSROOM_MEMBERS
-- =========================

-- Ya existe idx_member_classroom; añadimos compuesto con rol para filtros por rol
CREATE INDEX IF NOT EXISTS idx_member_classroom_role
  ON classroom_members(classroom_id, role);

-- =========================
-- JOIN_CODES
-- =========================

-- Búsqueda típica: códigos vigentes por aula y no revocados
CREATE INDEX IF NOT EXISTS idx_join_code_lookup
  ON join_codes(classroom_id, revoked, expires_at);

-- Salvaguardas de integridad (sin IF NOT EXISTS; usar DO + pg_constraint)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_join_codes_used_nonneg'
      AND conrelid = 'join_codes'::regclass
  ) THEN
    ALTER TABLE join_codes
      ADD CONSTRAINT chk_join_codes_used_nonneg
      CHECK (used_count >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_join_codes_max_nonneg'
      AND conrelid = 'join_codes'::regclass
  ) THEN
    ALTER TABLE join_codes
      ADD CONSTRAINT chk_join_codes_max_nonneg
      CHECK (max_uses IS NULL OR max_uses >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_join_codes_used_le_max'
      AND conrelid = 'join_codes'::regclass
  ) THEN
    ALTER TABLE join_codes
      ADD CONSTRAINT chk_join_codes_used_le_max
      CHECK (max_uses IS NULL OR used_count <= max_uses);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_join_codes_code_upper'
      AND conrelid = 'join_codes'::regclass
  ) THEN
    ALTER TABLE join_codes
      ADD CONSTRAINT chk_join_codes_code_upper
      CHECK (code = UPPER(code));
  END IF;
END
$$;
