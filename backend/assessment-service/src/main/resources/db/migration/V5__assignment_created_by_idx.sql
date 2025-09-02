-- flyway:executeInTransaction=false

-- Índice por creador para filtros createdBy=... y orden por created_at
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assignment_created_by
  ON assessment_assignment (created_by_user_id, created_at DESC);
