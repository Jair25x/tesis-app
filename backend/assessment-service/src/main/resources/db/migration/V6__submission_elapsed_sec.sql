-- Elapsed real (segundos) del intento; NULL mientras está IN_PROGRESS o si faltan timestamps
ALTER TABLE assessment_submission
  ADD COLUMN IF NOT EXISTS elapsed_sec INTEGER;

-- (Opcional) índice si vas a ordenar/filtrar por rapidez
-- CREATE INDEX IF NOT EXISTS idx_submission_elapsed ON assessment_submission (elapsed_sec);
