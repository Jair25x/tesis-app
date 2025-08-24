-- ============================================
-- assessment-service: schema inicial (V1)
-- ============================================

-- 1) Plantillas
CREATE TABLE IF NOT EXISTS assessment_template (
    id              UUID PRIMARY KEY,
    owner_uuid      UUID                 NOT NULL,
    title           VARCHAR(160)         NOT NULL,
    curriculum_id   UUID                 NOT NULL,
    config_json     JSONB,

    created_by      VARCHAR(255),
    updated_by      VARCHAR(255),
    created_at      TIMESTAMP            NOT NULL,
    updated_at      TIMESTAMP            NOT NULL,
    deleted_at      TIMESTAMP,
    deleted_by      VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_template_owner      ON assessment_template (owner_uuid);
CREATE INDEX IF NOT EXISTS idx_template_curriculum ON assessment_template (curriculum_id);

-- Ítems de plantilla
CREATE TABLE IF NOT EXISTS assessment_template_item (
    id              UUID PRIMARY KEY,
    template_id     UUID                 NOT NULL,
    objective_id    UUID                 NOT NULL,
    exercise_id     UUID                 NOT NULL,
    points          INT                  NOT NULL,
    position        INT                  NOT NULL,
    grading_mode    VARCHAR(12)          NOT NULL,

    created_by      VARCHAR(255),
    updated_by      VARCHAR(255),
    created_at      TIMESTAMP            NOT NULL,
    updated_at      TIMESTAMP            NOT NULL,
    deleted_at      TIMESTAMP,
    deleted_by      VARCHAR(255),

    CONSTRAINT fk_titem_template
        FOREIGN KEY (template_id) REFERENCES assessment_template(id)
        ON UPDATE RESTRICT ON DELETE CASCADE,

    CONSTRAINT ck_titem_grading_mode
        CHECK (grading_mode IN ('AUTO','MANUAL'))
);

CREATE INDEX IF NOT EXISTS idx_titem_template_position ON assessment_template_item (template_id, position);
CREATE INDEX IF NOT EXISTS idx_titem_objective         ON assessment_template_item (objective_id);

-- 2) Asignaciones
CREATE TABLE IF NOT EXISTS assessment_assignment (
    id                  UUID PRIMARY KEY,
    template_id         UUID                 NOT NULL,
    scope               VARCHAR(16)          NOT NULL,
    type                VARCHAR(16)          NOT NULL DEFAULT 'FORMATIVE',
    classroom_id        UUID,
    state               VARCHAR(16)          NOT NULL DEFAULT 'DRAFT',
    window_start        TIMESTAMPTZ,
    window_end          TIMESTAMPTZ,
    time_limit_sec      INT,
    attempts_allowed    INT                  NOT NULL DEFAULT 1,
    created_by_user_id  UUID                 NOT NULL,

    created_by      VARCHAR(255),
    updated_by      VARCHAR(255),
    created_at      TIMESTAMP            NOT NULL,
    updated_at      TIMESTAMP            NOT NULL,
    deleted_at      TIMESTAMP,
    deleted_by      VARCHAR(255),

    CONSTRAINT fk_assignment_template
        FOREIGN KEY (template_id) REFERENCES assessment_template(id)
        ON UPDATE RESTRICT ON DELETE RESTRICT,

    CONSTRAINT ck_assignment_scope
        CHECK (scope IN ('CLASSROOM','PUBLIC')),
    CONSTRAINT ck_assignment_type
        CHECK (type IN ('DIAGNOSTIC','FORMATIVE','SUMMATIVE')),
    CONSTRAINT ck_assignment_state
        CHECK (state IN ('DRAFT','PUBLISHED','CLOSED'))
);

CREATE INDEX IF NOT EXISTS idx_assign_template     ON assessment_assignment (template_id);
CREATE INDEX IF NOT EXISTS idx_assign_scope        ON assessment_assignment (scope);
CREATE INDEX IF NOT EXISTS idx_assign_classroom    ON assessment_assignment (classroom_id);
CREATE INDEX IF NOT EXISTS idx_assign_state_window ON assessment_assignment (state, window_start, window_end);

-- 3) Submissions
CREATE TABLE IF NOT EXISTS assessment_submission (
    id              UUID PRIMARY KEY,
    assignment_id   UUID                 NOT NULL,
    student_id      UUID                 NOT NULL,
    status          VARCHAR(16)          NOT NULL DEFAULT 'NOT_STARTED',
    started_at      TIMESTAMPTZ,
    submitted_at    TIMESTAMPTZ,
    graded_at       TIMESTAMPTZ,
    score           NUMERIC(8,2),
    max_score       NUMERIC(8,2),
    duration_sec    INT,
    attempt_no      INT                  NOT NULL DEFAULT 1,
    lock_token      VARCHAR(64),

    created_by      VARCHAR(255),
    updated_by      VARCHAR(255),
    created_at      TIMESTAMP            NOT NULL,
    updated_at      TIMESTAMP            NOT NULL,
    deleted_at      TIMESTAMP,
    deleted_by      VARCHAR(255),

    CONSTRAINT fk_submission_assignment
        FOREIGN KEY (assignment_id) REFERENCES assessment_assignment(id)
        ON UPDATE RESTRICT ON DELETE RESTRICT,

    CONSTRAINT uk_submission_assignment_student_attempt
        UNIQUE (assignment_id, student_id, attempt_no),

    CONSTRAINT ck_submission_status
        CHECK (status IN ('NOT_STARTED','IN_PROGRESS','SUBMITTED','GRADED','CANCELED'))
);

CREATE INDEX IF NOT EXISTS idx_submission_assignment ON assessment_submission (assignment_id);
CREATE INDEX IF NOT EXISTS idx_submission_student    ON assessment_submission (student_id);
CREATE INDEX IF NOT EXISTS idx_submission_status     ON assessment_submission (status);

-- Ítems del submission
CREATE TABLE IF NOT EXISTS assessment_submission_item (
    id                  UUID PRIMARY KEY,
    submission_id       UUID                 NOT NULL,
    exercise_id         UUID                 NOT NULL,
    objective_id        UUID                 NOT NULL,
    position            INT                  NOT NULL,
    points              INT                  NOT NULL,
    grading_mode        VARCHAR(12)          NOT NULL,
    answer_json         JSONB,
    correct             BOOLEAN,
    score               NUMERIC(8,2),
    feedback_json       JSONB,
    checked_at          TIMESTAMPTZ,
    exercise_title      VARCHAR(200),
    exercise_type       VARCHAR(40),
    statement_rendered  TEXT,

    created_by      VARCHAR(255),
    updated_by      VARCHAR(255),
    created_at      TIMESTAMP            NOT NULL,
    updated_at      TIMESTAMP            NOT NULL,
    deleted_at      TIMESTAMP,
    deleted_by      VARCHAR(255),

    CONSTRAINT fk_sitem_submission
        FOREIGN KEY (submission_id) REFERENCES assessment_submission(id)
        ON UPDATE RESTRICT ON DELETE CASCADE,

    CONSTRAINT ck_sitem_grading_mode
        CHECK (grading_mode IN ('AUTO','MANUAL'))
);

CREATE INDEX IF NOT EXISTS idx_sitem_submission_position ON assessment_submission_item (submission_id, position);
CREATE INDEX IF NOT EXISTS idx_sitem_submission_exercise ON assessment_submission_item (submission_id, exercise_id);
CREATE INDEX IF NOT EXISTS idx_sitem_submission_objective ON assessment_submission_item (submission_id, objective_id);

-- 4) Outbox (progress/advisor)
CREATE TABLE IF NOT EXISTS assessment_progress_outbox (
    id                  UUID PRIMARY KEY,
    submission_item_id  UUID                 NOT NULL,
    payload_json        JSONB                NOT NULL,
    status              VARCHAR(16)          NOT NULL DEFAULT 'PENDING',
    last_error          TEXT,

    created_by      VARCHAR(255),
    updated_by      VARCHAR(255),
    created_at      TIMESTAMP            NOT NULL,
    updated_at      TIMESTAMP            NOT NULL,
    deleted_at      TIMESTAMP,
    deleted_by      VARCHAR(255),

    CONSTRAINT ck_outbox_status
        CHECK (status IN ('PENDING','SENT','FAILED'))
);

CREATE INDEX IF NOT EXISTS idx_outbox_status           ON assessment_progress_outbox (status);
CREATE INDEX IF NOT EXISTS idx_outbox_submission_item  ON assessment_progress_outbox (submission_item_id);
