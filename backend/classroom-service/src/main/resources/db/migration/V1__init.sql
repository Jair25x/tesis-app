-- === classroom-service / Flyway V1 ===
-- Postgres >= 13
-- Crea extensiones útiles para UUID si aún no existen
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================
-- TABLE: classrooms
-- Model: com.tesis.classroom_service.model.Classroom
-- =========================================================
CREATE TABLE IF NOT EXISTS classrooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Docente propietario (UUID canónico del usuario)
  owner_uuid UUID NOT NULL,

  name VARCHAR(120) NOT NULL,
  description TEXT,
  grade VARCHAR(20),
  subject VARCHAR(50),

  -- Estado / soft-delete a nivel de dominio
  active BOOLEAN NOT NULL DEFAULT TRUE,

  -- Auditoría base (coincide con AuditableEntity)
  created_by VARCHAR(100),
  updated_by VARCHAR(100),
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  deleted_by VARCHAR(100)
);

-- Índices según anotaciones
CREATE INDEX IF NOT EXISTS idx_classroom_owner ON classrooms(owner_uuid);
CREATE INDEX IF NOT EXISTS idx_classroom_active ON classrooms(active);

-- =========================================================
-- TABLE: classroom_members
-- Model: com.tesis.classroom_service.model.ClassroomMember
-- =========================================================
CREATE TABLE IF NOT EXISTS classroom_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  classroom_id UUID NOT NULL,
  user_uuid   UUID NOT NULL,

  role VARCHAR(20) NOT NULL, -- Enum mapeado como STRING: STUDENT|CO_TEACHER|OWNER
  joined_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),

  -- Auditoría base
  created_by VARCHAR(100),
  updated_by VARCHAR(100),
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  deleted_by VARCHAR(100),

  CONSTRAINT fk_member_classroom
    FOREIGN KEY (classroom_id) REFERENCES classrooms(id)
      ON UPDATE NO ACTION ON DELETE RESTRICT,

  CONSTRAINT uk_member_classroom_user
    UNIQUE (classroom_id, user_uuid)
);

-- Índices según anotaciones
CREATE INDEX IF NOT EXISTS idx_member_classroom ON classroom_members(classroom_id);
CREATE INDEX IF NOT EXISTS idx_member_user ON classroom_members(user_uuid);

-- =========================================================
-- TABLE: join_codes
-- Model: com.tesis.classroom_service.model.JoinCode
-- =========================================================
CREATE TABLE IF NOT EXISTS join_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  classroom_id UUID NOT NULL,
  code VARCHAR(12) NOT NULL,

  -- expira en fecha/hora absoluta (Instant -> TIMESTAMPTZ)
  expires_at TIMESTAMPTZ NOT NULL,

  -- null = ilimitado
  max_uses INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  revoked BOOLEAN NOT NULL DEFAULT FALSE,

  -- Auditoría base
  created_by VARCHAR(100),
  updated_by VARCHAR(100),
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  deleted_by VARCHAR(100),

  CONSTRAINT fk_join_code_classroom
    FOREIGN KEY (classroom_id) REFERENCES classrooms(id)
      ON UPDATE NO ACTION ON DELETE RESTRICT,

  CONSTRAINT uk_join_code_code
    UNIQUE (code)
);

-- Índices según anotaciones
CREATE INDEX IF NOT EXISTS idx_join_code_classroom ON join_codes(classroom_id);
CREATE INDEX IF NOT EXISTS idx_join_code_expires   ON join_codes(expires_at);

-- =========================================================
-- Triggers opcionales (DB-side) para updated_at (si quieres reforzar
-- además de @PreUpdate en JPA). Descomenta si deseas.
-- =========================================================
-- CREATE OR REPLACE FUNCTION set_updated_at()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   NEW.updated_at = now();
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- DO $$
-- BEGIN
--   IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tg_classrooms_updated_at') THEN
--     CREATE TRIGGER tg_classrooms_updated_at
--       BEFORE UPDATE ON classrooms
--       FOR EACH ROW EXECUTE FUNCTION set_updated_at();
--   END IF;
--   IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tg_classroom_members_updated_at') THEN
--     CREATE TRIGGER tg_classroom_members_updated_at
--       BEFORE UPDATE ON classroom_members
--       FOR EACH ROW EXECUTE FUNCTION set_updated_at();
--   END IF;
--   IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tg_join_codes_updated_at') THEN
--     CREATE TRIGGER tg_join_codes_updated_at
--       BEFORE UPDATE ON join_codes
--       FOR EACH ROW EXECUTE FUNCTION set_updated_at();
--   END IF;
-- END $$;
