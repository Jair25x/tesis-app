-- Reglas que enlazan achievements de progress-service a ítems cosméticos

-- Obtén IDs por code (ajusta si tus codes de V2 difieren)
WITH items AS (
  SELECT
    (SELECT id FROM cosmetic_item WHERE code = 'HAT_RED_CAP' AND active) AS hat_red_cap,
    (SELECT id FROM cosmetic_item WHERE code = 'OUTFIT_SPORTS' AND active) AS outfit_sports,
    (SELECT id FROM cosmetic_item WHERE code = 'FACE_COOL_SHADES' AND active) AS face_cool_shades
)
INSERT INTO reward_rule (id, source, trigger_code, cosmetic_item_id, max_claims, ttl_seconds, active, created_at, updated_at)
SELECT gen_random_uuid(), 'ACHIEVEMENT', 'FIRST_TRY', hat_red_cap, 1, NULL, TRUE, now(), now()
FROM items
WHERE hat_red_cap IS NOT NULL
ON CONFLICT DO NOTHING;

WITH items AS (
  SELECT
    (SELECT id FROM cosmetic_item WHERE code = 'HAT_RED_CAP' AND active) AS hat_red_cap,
    (SELECT id FROM cosmetic_item WHERE code = 'OUTFIT_SPORTS' AND active) AS outfit_sports,
    (SELECT id FROM cosmetic_item WHERE code = 'FACE_COOL_SHADES' AND active) AS face_cool_shades
)
INSERT INTO reward_rule (id, source, trigger_code, cosmetic_item_id, max_claims, ttl_seconds, active, created_at, updated_at)
SELECT gen_random_uuid(), 'ACHIEVEMENT', 'FIVE_IN_ROW', outfit_sports, 1, NULL, TRUE, now(), now()
FROM items
WHERE outfit_sports IS NOT NULL
ON CONFLICT DO NOTHING;

WITH items AS (
  SELECT
    (SELECT id FROM cosmetic_item WHERE code = 'HAT_RED_CAP' AND active) AS hat_red_cap,
    (SELECT id FROM cosmetic_item WHERE code = 'OUTFIT_SPORTS' AND active) AS outfit_sports,
    (SELECT id FROM cosmetic_item WHERE code = 'FACE_COOL_SHADES' AND active) AS face_cool_shades
)
INSERT INTO reward_rule (id, source, trigger_code, cosmetic_item_id, max_claims, ttl_seconds, active, created_at, updated_at)
SELECT gen_random_uuid(), 'ACHIEVEMENT', 'DAILY_STARTER', face_cool_shades, 1, NULL, TRUE, now(), now()
FROM items
WHERE face_cool_shades IS NOT NULL
ON CONFLICT DO NOTHING;

-- Duelos:
WITH items AS (
  SELECT
    (SELECT id FROM cosmetic_item WHERE code = 'HAT_RED_CAP' AND active) AS hat_red_cap,
    (SELECT id FROM cosmetic_item WHERE code = 'OUTFIT_SPORTS' AND active) AS outfit_sports,
    (SELECT id FROM cosmetic_item WHERE code = 'FACE_COOL_SHADES' AND active) AS face_cool_shades,
    (SELECT id FROM cosmetic_item WHERE code = 'BACKGROUND_CHAMPION' AND active) AS background_champion
)
INSERT INTO reward_rule (id, source, trigger_code, cosmetic_item_id, max_claims, ttl_seconds, active, created_at, updated_at)
SELECT gen_random_uuid(), 'ACHIEVEMENT', 'DUEL_FIRST_WIN', background_champion, 1, NULL, TRUE, now(), now()
FROM items
WHERE background_champion IS NOT NULL
ON CONFLICT DO NOTHING;

WITH items AS (
  SELECT
    (SELECT id FROM cosmetic_item WHERE code = 'HAT_RED_CAP' AND active) AS hat_red_cap,
    (SELECT id FROM cosmetic_item WHERE code = 'OUTFIT_SPORTS' AND active) AS outfit_sports,
    (SELECT id FROM cosmetic_item WHERE code = 'FACE_COOL_SHADES' AND active) AS face_cool_shades,
    (SELECT id FROM cosmetic_item WHERE code = 'BACKGROUND_CHAMPION' AND active) AS background_champion
)
INSERT INTO reward_rule (id, source, trigger_code, cosmetic_item_id, max_claims, ttl_seconds, active, created_at, updated_at)
SELECT gen_random_uuid(), 'ACHIEVEMENT', 'DUEL_FAST_ANSWER', face_cool_shades, 1, NULL, TRUE, now(), now()
FROM items
WHERE face_cool_shades IS NOT NULL
ON CONFLICT DO NOTHING;

WITH items AS (
  SELECT
    (SELECT id FROM cosmetic_item WHERE code = 'HAT_RED_CAP' AND active) AS hat_red_cap,
    (SELECT id FROM cosmetic_item WHERE code = 'OUTFIT_SPORTS' AND active) AS outfit_sports,
    (SELECT id FROM cosmetic_item WHERE code = 'FACE_COOL_SHADES' AND active) AS face_cool_shades,
    (SELECT id FROM cosmetic_item WHERE code = 'BACKGROUND_CHAMPION' AND active) AS background_champion
)
INSERT INTO reward_rule (id, source, trigger_code, cosmetic_item_id, max_claims, ttl_seconds, active, created_at, updated_at)
SELECT gen_random_uuid(), 'ACHIEVEMENT', 'DUEL_BEST_OF_THREE_WINNER', outfit_sports, 1, NULL, TRUE, now(), now()
FROM items
WHERE outfit_sports IS NOT NULL
ON CONFLICT DO NOTHING;
