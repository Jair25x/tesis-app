ALTER TABLE assessment_submission_item
  ADD COLUMN IF NOT EXISTS exercise_difficulty VARCHAR(20);

CREATE INDEX IF NOT EXISTS idx_sitem_difficulty
  ON assessment_submission_item(exercise_difficulty);
