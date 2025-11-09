-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pg_trgm;    -- índices GIN/trgm para búsquedas ILIKE

-- =========================
-- Tabla: curricula
-- =========================
CREATE TABLE IF NOT EXISTS curricula (
  id           UUID PRIMARY KEY,
  code         VARCHAR(100)  NOT NULL UNIQUE,
  name         VARCHAR(255)  NOT NULL UNIQUE,
  description  TEXT,
  grade        VARCHAR(50)   NOT NULL,
  active       BOOLEAN       NOT NULL DEFAULT TRUE,
  created_by   VARCHAR(255),
  updated_by   VARCHAR(255),
  created_at   TIMESTAMP     NOT NULL,
  updated_at   TIMESTAMP     NOT NULL,
  deleted_at   TIMESTAMP,
  deleted_by   VARCHAR(255)
);

-- =========================
-- Tabla: competencies
-- =========================
CREATE TABLE IF NOT EXISTS competencies (
  id             UUID PRIMARY KEY,
  code           VARCHAR(50)  NOT NULL UNIQUE,
  name           VARCHAR(255) NOT NULL,
  description    TEXT         NOT NULL,
  active         BOOLEAN      NOT NULL DEFAULT TRUE,
  curriculum_id  UUID         NOT NULL REFERENCES curricula(id),
  created_by     VARCHAR(255),
  updated_by     VARCHAR(255),
  created_at     TIMESTAMP    NOT NULL,
  updated_at     TIMESTAMP    NOT NULL,
  deleted_at     TIMESTAMP,
  deleted_by     VARCHAR(255)
);

-- =========================
-- Tabla: standards
-- =========================
CREATE TABLE IF NOT EXISTS standards (
  id             UUID PRIMARY KEY,
  code           VARCHAR(50)   NOT NULL UNIQUE,
  name           VARCHAR(500)  NOT NULL,
  description    TEXT,
  active         BOOLEAN       NOT NULL DEFAULT TRUE,
  competency_id  UUID          NOT NULL REFERENCES competencies(id),
  created_by     VARCHAR(255),
  updated_by     VARCHAR(255),
  created_at     TIMESTAMP     NOT NULL,
  updated_at     TIMESTAMP     NOT NULL,
  deleted_at     TIMESTAMP,
  deleted_by     VARCHAR(255)
);

-- =========================
-- Tabla: learning_objectives
-- =========================
CREATE TABLE IF NOT EXISTS learning_objectives (
  id            UUID PRIMARY KEY,
  code          VARCHAR(50)   NOT NULL UNIQUE,
  name          TEXT          NOT NULL,
  description   TEXT,
  active        BOOLEAN       NOT NULL DEFAULT TRUE,
  standard_id   UUID          NOT NULL REFERENCES standards(id),
  created_by    VARCHAR(255),
  updated_by    VARCHAR(255),
  created_at    TIMESTAMP     NOT NULL,
  updated_at    TIMESTAMP     NOT NULL,
  deleted_at    TIMESTAMP,
  deleted_by    VARCHAR(255)
);

-- =========================
-- Tabla: exercises
-- =========================
CREATE TABLE IF NOT EXISTS exercises (
  id                    UUID PRIMARY KEY,
  statement             TEXT          NOT NULL,
  difficulty            VARCHAR(20)   NOT NULL,   -- BASIC | INTERMEDIATE | ADVANCED
  type                  VARCHAR(50)   NOT NULL,   -- CHOICE | QA | EQUATION | ...
  correct_answer        TEXT,
  template_type         VARCHAR(50),              -- enum lógico por app
  parameters            JSONB,                    -- @JdbcTypeCode(SqlTypes.JSON)
  active                BOOLEAN       NOT NULL DEFAULT TRUE,
  is_diagnostic         BOOLEAN       NOT NULL DEFAULT FALSE,
  learning_objective_id UUID          NOT NULL REFERENCES learning_objectives(id),
  created_by            VARCHAR(255),
  updated_by            VARCHAR(255),
  created_at            TIMESTAMP     NOT NULL,
  updated_at            TIMESTAMP     NOT NULL,
  deleted_at            TIMESTAMP,
  deleted_by            VARCHAR(255)
);

-- =========================
-- Tabla: hints
-- =========================
CREATE TABLE IF NOT EXISTS hints (
  id          UUID PRIMARY KEY,
  hint_text   TEXT         NOT NULL,
  cost        INTEGER      NOT NULL,
  exercise_id UUID         NOT NULL REFERENCES exercises(id),
  active      BOOLEAN      NOT NULL DEFAULT TRUE,
  created_by  VARCHAR(255),
  updated_by  VARCHAR(255),
  created_at  TIMESTAMP    NOT NULL,
  updated_at  TIMESTAMP    NOT NULL,
  deleted_at  TIMESTAMP,
  deleted_by  VARCHAR(255)
);

-- =========================
-- Tabla: solution_steps
-- =========================
CREATE TABLE IF NOT EXISTS solution_steps (
  id          UUID PRIMARY KEY,
  step_number INTEGER      NOT NULL,
  explanation TEXT         NOT NULL,
  exercise_id UUID         NOT NULL REFERENCES exercises(id),
  active      BOOLEAN      NOT NULL DEFAULT TRUE,
  created_by  VARCHAR(255),
  updated_by  VARCHAR(255),
  created_at  TIMESTAMP    NOT NULL,
  updated_at  TIMESTAMP    NOT NULL,
  deleted_at  TIMESTAMP,
  deleted_by  VARCHAR(255)
);

-- Índices de apoyo / navegación
CREATE INDEX IF NOT EXISTS idx_comp_curr     ON competencies(curriculum_id);
CREATE INDEX IF NOT EXISTS idx_std_comp      ON standards(competency_id);
CREATE INDEX IF NOT EXISTS idx_lo_std        ON learning_objectives(standard_id);
CREATE INDEX IF NOT EXISTS idx_ex_lo_active  ON exercises(learning_objective_id, active);
CREATE INDEX IF NOT EXISTS idx_ex_diag_act   ON exercises(is_diagnostic, active);
CREATE INDEX IF NOT EXISTS idx_hint_exercise ON hints(exercise_id);
CREATE INDEX IF NOT EXISTS idx_step_exercise ON solution_steps(exercise_id);

-- Búsquedas por texto aceleradas con GIN/trgm (lower)
CREATE INDEX IF NOT EXISTS gin_curricula_code     ON curricula            USING GIN (LOWER(code) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS gin_curricula_name     ON curricula            USING GIN (LOWER(name) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS gin_competencies_code  ON competencies         USING GIN (LOWER(code) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS gin_competencies_name  ON competencies         USING GIN (LOWER(name) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS gin_standards_code     ON standards            USING GIN (LOWER(code) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS gin_standards_name     ON standards            USING GIN (LOWER(name) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS gin_lobj_code          ON learning_objectives  USING GIN (LOWER(code) gin_trgm_ops);

-- Checks de dominio
ALTER TABLE hints
  ADD CONSTRAINT chk_hints_cost_nonneg CHECK (cost >= 0) NOT VALID;

ALTER TABLE solution_steps
  ADD CONSTRAINT chk_steps_num_positive CHECK (step_number >= 1) NOT VALID;

-- Dificultad canónica (mayúsculas)
ALTER TABLE exercises
  ADD CONSTRAINT chk_ex_difficulty
  CHECK (difficulty IN ('BASIC','INTERMEDIATE','ADVANCED'));

-- Unicidad lógica para evitar duplicados molestos
ALTER TABLE solution_steps
  ADD CONSTRAINT uq_step_per_ex UNIQUE (exercise_id, step_number) DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE hints
  ADD CONSTRAINT uq_hint_text_per_ex UNIQUE (exercise_id, hint_text) DEFERRABLE INITIALLY IMMEDIATE;

-- (Opcional) Índice GIN para parameters si vas a filtrar por keys
-- CREATE INDEX IF NOT EXISTS gin_ex_params ON exercises USING GIN (parameters);
