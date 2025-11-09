-- ===========================
-- avatar-service: esquema base
-- ===========================

-- NOTA: Guardamos enums como VARCHAR (JPA @Enumerated STRING), no se crean tipos ENUM en PG.

-- ========== TABLA cosmetic_item ==========
CREATE TABLE IF NOT EXISTS cosmetic_item (
  id UUID PRIMARY KEY,
  code VARCHAR(64) NOT NULL UNIQUE,
  display_name VARCHAR(120) NOT NULL,
  slot VARCHAR(16) NOT NULL,                 -- BODY|HAT|FACE|OUTFIT|BACKGROUND
  rarity VARCHAR(24) NOT NULL DEFAULT 'COMMON',
  asset_url TEXT NOT NULL,

  active BOOLEAN NOT NULL DEFAULT TRUE,

  created_by VARCHAR(120),
  updated_by VARCHAR(120),
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  deleted_by VARCHAR(120)
);

CREATE INDEX IF NOT EXISTS ix_cosmetic_item_slot   ON cosmetic_item (slot);
CREATE INDEX IF NOT EXISTS ix_cosmetic_item_active ON cosmetic_item (active);

-- ========== TABLA reward_rule ==========
CREATE TABLE IF NOT EXISTS reward_rule (
  id UUID PRIMARY KEY,
  source VARCHAR(16) NOT NULL,               -- ACHIEVEMENT|DUEL|EVENT
  trigger_code VARCHAR(120) NOT NULL,        -- p.ej. DUEL_FIRST_WIN, STREAK_3D, etc.
  cosmetic_item_id UUID NOT NULL REFERENCES cosmetic_item (id),
  max_claims INTEGER NOT NULL DEFAULT 1,
  ttl_seconds INTEGER,                       -- opcional

  active BOOLEAN NOT NULL DEFAULT TRUE,

  created_by VARCHAR(120),
  updated_by VARCHAR(120),
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  deleted_by VARCHAR(120)
);

CREATE INDEX IF NOT EXISTS ix_reward_rule_active  ON reward_rule (active);
CREATE INDEX IF NOT EXISTS ix_reward_rule_source  ON reward_rule (source);
CREATE INDEX IF NOT EXISTS ix_reward_rule_trigger ON reward_rule (trigger_code);

-- ========== TABLA student_inventory ==========
CREATE TABLE IF NOT EXISTS student_inventory (
  id UUID PRIMARY KEY,
  student_id UUID NOT NULL,
  cosmetic_item_id UUID NOT NULL REFERENCES cosmetic_item (id),
  source VARCHAR(16) NOT NULL,               -- ACHIEVEMENT|DUEL|EVENT
  award_code VARCHAR(120) NOT NULL,          -- idempotencia por (student,source,award)

  awarded_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  metadata_json TEXT NOT NULL DEFAULT '{}',

  created_by VARCHAR(120),
  updated_by VARCHAR(120),
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  deleted_by VARCHAR(120),

  CONSTRAINT ux_inventory_idempotent UNIQUE (student_id, source, award_code)
);

CREATE INDEX IF NOT EXISTS ix_inventory_student    ON student_inventory (student_id);
CREATE INDEX IF NOT EXISTS ix_inventory_awarded_at ON student_inventory (awarded_at);

-- ========== TABLA student_avatar_loadout ==========
CREATE TABLE IF NOT EXISTS student_avatar_loadout (
  id UUID PRIMARY KEY,
  student_id UUID NOT NULL,
  slot VARCHAR(16) NOT NULL,                 -- BODY|HAT|FACE|OUTFIT|BACKGROUND
  cosmetic_item_id UUID NULL REFERENCES cosmetic_item (id),

  created_by VARCHAR(120),
  updated_by VARCHAR(120),
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITHOUT TIME ZONE,
  deleted_by VARCHAR(120),

  CONSTRAINT ux_loadout_student_slot UNIQUE (student_id, slot)
);

CREATE INDEX IF NOT EXISTS ix_loadout_student    ON student_avatar_loadout (student_id);
CREATE INDEX IF NOT EXISTS ix_loadout_updated_at ON student_avatar_loadout (updated_at);
