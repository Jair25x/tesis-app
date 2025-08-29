-- flyway:executeInTransaction=false

-- ============================================
-- V3: Índices de rendimiento adicionales
-- ============================================

-- 1) assessment_assignment: ayuda a (scope=PUBLIC) OR (scope=CLASSROOM AND classroom_id IN (...))
--    Nota: el planner puede usarlo para ambos lados del OR.
CREATE INDEX IF NOT EXISTS idx_assign_scope_classroom
  ON assessment_assignment (scope, classroom_id);

-- Opcional si esperas MUCHÍSIMOS registros y barridos temporales:
-- BRIN para las ventanas (barato en tamaño, útil para rangos muy grandes)
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS brin_assign_window_start
--   ON assessment_assignment USING BRIN (window_start);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS brin_assign_window_end
--   ON assessment_assignment USING BRIN (window_end);

-- 2) assessment_submission: flags por alumno dentro de una asignación
CREATE INDEX IF NOT EXISTS idx_submission_assignment_student
  ON assessment_submission (assignment_id, student_id);

CREATE INDEX IF NOT EXISTS idx_submission_assignment_student_status
  ON assessment_submission (assignment_id, student_id, status);
