-- ============================================
-- assessment-service: outbox para AI Advisor (V2)
-- ============================================

CREATE TABLE IF NOT EXISTS assessment_advisor_outbox (
    id            UUID PRIMARY KEY,
    submission_id UUID                 NOT NULL,
    payload_json  JSONB                NOT NULL,
    status        VARCHAR(16)          NOT NULL DEFAULT 'PENDING',
    last_error    TEXT,

    created_by    VARCHAR(255),
    updated_by    VARCHAR(255),
    created_at    TIMESTAMP            NOT NULL,
    updated_at    TIMESTAMP            NOT NULL,
    deleted_at    TIMESTAMP,
    deleted_by    VARCHAR(255),

    CONSTRAINT ck_advisor_outbox_status
      CHECK (status IN ('PENDING','SENT','FAILED'))
);

CREATE INDEX IF NOT EXISTS idx_advisor_outbox_status
  ON assessment_advisor_outbox (status);

CREATE INDEX IF NOT EXISTS idx_advisor_outbox_submission
  ON assessment_advisor_outbox (submission_id);
