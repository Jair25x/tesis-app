-- Enum como texto (usamos VARCHAR en JPA, no enum nativo)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabla achievements (catálogo)
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  condition_type VARCHAR(50),
  threshold INT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  points INT NOT NULL DEFAULT 0,
  created_by VARCHAR(255),
  updated_by VARCHAR(255),
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  deleted_at TIMESTAMP,
  deleted_by VARCHAR(255)
);

-- Único por código
CREATE UNIQUE INDEX IF NOT EXISTS uk_achievement_code ON achievements(code);

-- Progreso por objetivo
CREATE TABLE IF NOT EXISTS student_objective_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  curriculum_id UUID NOT NULL,
  learning_objective_id UUID NOT NULL,
  attempts_count INT NOT NULL DEFAULT 0,
  correct_count INT NOT NULL DEFAULT 0,
  streak_correct INT NOT NULL DEFAULT 0,
  accuracy NUMERIC(4,3),
  status VARCHAR(20) NOT NULL,          -- NOT_STARTED, IN_PROGRESS, MASTERED
  mastery_level VARCHAR(20) NOT NULL,   -- PRACTICING, PROFICIENT, MASTERED
  last_attempt_at TIMESTAMP,
  created_by VARCHAR(255),
  updated_by VARCHAR(255),
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  deleted_at TIMESTAMP,
  deleted_by VARCHAR(255)
);

-- Intentos
CREATE TABLE IF NOT EXISTS attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  curriculum_id UUID NOT NULL,
  learning_objective_id UUID NOT NULL,
  exercise_id UUID NOT NULL,
  template_type VARCHAR(64),
  difficulty VARCHAR(32),
  source VARCHAR(32) NOT NULL,          -- PRACTICE / ASSESSMENT
  session_id VARCHAR(128),
  answer_payload JSONB,
  check_result JSONB,
  correct BOOLEAN NOT NULL DEFAULT FALSE,
  score NUMERIC(4,3),
  hints_used INT DEFAULT 0,
  duration_ms INT,
  source_ref_id UUID,
  created_by VARCHAR(255),
  updated_by VARCHAR(255),
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  deleted_at TIMESTAMP,
  deleted_by VARCHAR(255)
);

-- Rachas por estudiante (clave natural = student_id)
CREATE TABLE IF NOT EXISTS streaks (
  student_id UUID PRIMARY KEY,
  current INT NOT NULL DEFAULT 0,
  longest INT NOT NULL DEFAULT 0,
  last_day DATE,
  created_by VARCHAR(255),
  updated_by VARCHAR(255),
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  deleted_at TIMESTAMP,
  deleted_by VARCHAR(255)
);

-- Relación estudiante-logro (único por par)
CREATE TABLE IF NOT EXISTS student_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  achievement_id UUID NOT NULL,
  earned_at TIMESTAMP NOT NULL,
  metadata JSONB,
  created_by VARCHAR(255),
  updated_by VARCHAR(255),
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  deleted_at TIMESTAMP,
  deleted_by VARCHAR(255)
);

-- Únicos / FKs lógicas (sin constraint duro a otros servicios)
CREATE UNIQUE INDEX IF NOT EXISTS uk_student_achievement ON student_achievements(student_id, achievement_id);

-- Unique SOP
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'uk_sop_student_lo'
  ) THEN
    CREATE UNIQUE INDEX uk_sop_student_lo ON student_objective_progress(student_id, learning_objective_id);
  END IF;
END $$;
