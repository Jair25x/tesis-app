-- Columna para idempotencia por submission-item
ALTER TABLE attempts
  ADD COLUMN IF NOT EXISTS submission_item_id UUID;

-- Evita duplicados del mismo submissionItem
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'uk_attempt_submission_item'
  ) THEN
    CREATE UNIQUE INDEX uk_attempt_submission_item ON attempts(submission_item_id)
    WHERE submission_item_id IS NOT NULL;
  END IF;
END $$;
