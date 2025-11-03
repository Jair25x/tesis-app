-- Índices recomendados (con nombre igual a tus @Index)

CREATE INDEX IF NOT EXISTS idx_sop_student_curriculum
  ON student_objective_progress(student_id, curriculum_id);

CREATE INDEX IF NOT EXISTS idx_sop_student_status
  ON student_objective_progress(student_id, status);

CREATE INDEX IF NOT EXISTS idx_sop_student_mastery
  ON student_objective_progress(student_id, mastery_level);

CREATE INDEX IF NOT EXISTS idx_attempt_student_created
  ON attempts(student_id, created_at);

CREATE INDEX IF NOT EXISTS idx_attempt_student_lo
  ON attempts(student_id, learning_objective_id);

CREATE INDEX IF NOT EXISTS idx_attempt_student_exercise
  ON attempts(student_id, exercise_id);

CREATE INDEX IF NOT EXISTS idx_sa_student
  ON student_achievements(student_id);

-- JSONB GIN opcional para analítica
CREATE INDEX IF NOT EXISTS idx_attempt_answer_payload_gin ON attempts USING GIN (answer_payload);
CREATE INDEX IF NOT EXISTS idx_attempt_check_result_gin ON attempts USING GIN (check_result);
