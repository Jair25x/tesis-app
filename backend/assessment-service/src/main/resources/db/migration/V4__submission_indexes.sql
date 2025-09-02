-- src/main/resources/db/migration/V4__submission_indexes.sql
-- Índices para acelerar reintentos, historial y flags

CREATE INDEX IF NOT EXISTS idx_submission_assignment_student
  ON assessment_submission (assignment_id, student_id);

CREATE INDEX IF NOT EXISTS idx_submission_assignment_student_status
  ON assessment_submission (assignment_id, student_id, status);

CREATE INDEX IF NOT EXISTS idx_submission_assignment_student_attempt_desc
  ON assessment_submission (assignment_id, student_id, attempt_no DESC);

-- Útil para /my/submissions ordenado por submittedAt
CREATE INDEX IF NOT EXISTS idx_submission_student_submitted_at
  ON assessment_submission (student_id, submitted_at DESC);
