-- ===========================
-- Seeds mínimos del catálogo
-- ===========================

-- BODY base (siempre equipable por defecto)
INSERT INTO cosmetic_item (id, code, display_name, slot, rarity, asset_url)
VALUES
  (gen_random_uuid(), 'BODY_CAPYBARA_BASE', 'Capibara base', 'BODY', 'COMMON',
   'https://cdn.example.com/avatars/body/capybara_base.webp')
ON CONFLICT (code) DO NOTHING;

-- HAT
INSERT INTO cosmetic_item (id, code, display_name, slot, rarity, asset_url)
VALUES
  (gen_random_uuid(), 'HAT_RED_CAP', 'Gorra roja', 'HAT', 'COMMON',
   'https://cdn.example.com/avatars/hat/red_cap.webp')
ON CONFLICT (code) DO NOTHING;

-- FACE
INSERT INTO cosmetic_item (id, code, display_name, slot, rarity, asset_url)
VALUES
  (gen_random_uuid(), 'FACE_STAR_CHEEKS', 'Mejillas estrelladas', 'FACE', 'COMMON',
   'https://cdn.example.com/avatars/face/star_cheeks.webp')
ON CONFLICT (code) DO NOTHING;

-- OUTFIT
INSERT INTO cosmetic_item (id, code, display_name, slot, rarity, asset_url)
VALUES
  (gen_random_uuid(), 'OUTFIT_SCIENTIST', 'Bata de científica/o', 'OUTFIT', 'RARE',
   'https://cdn.example.com/avatars/outfit/scientist_coat.webp')
ON CONFLICT (code) DO NOTHING;

-- BACKGROUND
INSERT INTO cosmetic_item (id, code, display_name, slot, rarity, asset_url)
VALUES
  (gen_random_uuid(), 'BACKGROUND_GRASS', 'Fondo césped', 'BACKGROUND', 'COMMON',
   'https://cdn.example.com/avatars/background/grass.webp')
ON CONFLICT (code) DO NOTHING;

-- Opcional: puedes precargar loadout por defecto (BODY base) al primer login desde servicio,
-- no lo hacemos aquí para no forzar student_id desconocidos.
