-- V2__insert_sajonia_4to1_students.sql
-- Crea usuarios STUDENT para 4to grado Jorda de Sajonia 1

-- Aseguramos que exista ROLE_STUDENT (idempotente)
INSERT INTO roles (name)
SELECT 'ROLE_STUDENT'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'ROLE_STUDENT');

-- ===========================
-- Inserción de estudiantes
-- ===========================

-- 1. ANCORI DURAN ADRIANA FERNANDA
INSERT INTO users (username, password, email, nombres, apellidos)
SELECT
  'adriana.ancori',
  crypt('ancori', gen_salt('bf')),
  NULL,
  'ADRIANA FERNANDA',
  'ANCORI DURAN'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'adriana.ancori');

-- 2. CCAHUANA CORNEJO LUCIANA VALENTINA
INSERT INTO users (username, password, email, nombres, apellidos)
SELECT
  'luciana.ccahuana',
  crypt('ccahuana', gen_salt('bf')),
  NULL,
  'LUCIANA VALENTINA',
  'CCAHUANA CORNEJO'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'luciana.ccahuana');

-- 3. CCAHUANA CRUZ PAOLA ARIANA
INSERT INTO users (username, password, email, nombres, apellidos)
SELECT
  'paola.ccahuana',
  crypt('ccahuana', gen_salt('bf')),
  NULL,
  'PAOLA ARIANA',
  'CCAHUANA CRUZ'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'paola.ccahuana');

-- 4. GUEVARA CORIMANYA MIRELLA ANGHELY
INSERT INTO users (username, password, email, nombres, apellidos)
SELECT
  'mirella.guevara',
  crypt('guevara', gen_salt('bf')),
  NULL,
  'MIRELLA ANGHELY',
  'GUEVARA CORIMANYA'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'mirella.guevara');

-- 5. HILARI ESTRADA BIANCA VALERIA
INSERT INTO users (username, password, email, nombres, apellidos)
SELECT
  'bianca.hilari',
  crypt('hilari', gen_salt('bf')),
  NULL,
  'BIANCA VALERIA',
  'HILARI ESTRADA'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'bianca.hilari');

-- 6. HINOJOSA OLIVARES THALYTA HILDA
INSERT INTO users (username, password, email, nombres, apellidos)
SELECT
  'thalyta.hinojosa',
  crypt('hinojosa', gen_salt('bf')),
  NULL,
  'THALYTA HILDA',
  'HINOJOSA OLIVARES'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'thalyta.hinojosa');

-- 7. JARA LUNA SAMI VALENTINA
INSERT INTO users (username, password, email, nombres, apellidos)
SELECT
  'sami.jara',
  crypt('jara', gen_salt('bf')),
  NULL,
  'SAMI VALENTINA',
  'JARA LUNA'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'sami.jara');

-- 8. JUANICO GONZALES, VALERIA FERNANDA
INSERT INTO users (username, password, email, nombres, apellidos)
SELECT
  'valeria.juanico',
  crypt('juanico', gen_salt('bf')),
  NULL,
  'VALERIA FERNANDA',
  'JUANICO GONZALES'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'valeria.juanico');

-- 9. LOAIZA CHAVEZ FERNANDA VALENTINA
INSERT INTO users (username, password, email, nombres, apellidos)
SELECT
  'fernanda.loaiza',
  crypt('loaiza', gen_salt('bf')),
  NULL,
  'FERNANDA VALENTINA',
  'LOAIZA CHAVEZ'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'fernanda.loaiza');

-- 10. MENDOZA LOVATON LUCIANA VALENTINA
INSERT INTO users (username, password, email, nombres, apellidos)
SELECT
  'luciana.mendoza',
  crypt('mendoza', gen_salt('bf')),
  NULL,
  'LUCIANA VALENTINA',
  'MENDOZA LOVATON'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'luciana.mendoza');

-- 11. MEZA SOTO, ZOE MIA VALESKA
INSERT INTO users (username, password, email, nombres, apellidos)
SELECT
  'zoe.meza',
  crypt('meza', gen_salt('bf')),
  NULL,
  'ZOE MIA VALESKA',
  'MEZA SOTO'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'zoe.meza');

-- 12. PARISUAÑA PALIZA TAIS MARYFE
INSERT INTO users (username, password, email, nombres, apellidos)
SELECT
  'tais.parisuaña',
  crypt('parisuaña', gen_salt('bf')),
  NULL,
  'TAIS MARYFE',
  'PARISUAÑA PALIZA'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'tais.parisuaña');

-- 13. PONCE DE LEON CHACON CAMILA MICAELLA
INSERT INTO users (username, password, email, nombres, apellidos)
SELECT
  'camila.ponce',
  crypt('ponce', gen_salt('bf')),
  NULL,
  'CAMILA MICAELLA',
  'PONCE DE LEON CHACON'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'camila.ponce');

-- 14. QUISPE BLAS LUANA ADIEL
INSERT INTO users (username, password, email, nombres, apellidos)
SELECT
  'luana.adiel.quispe',
  crypt('quispe', gen_salt('bf')),
  NULL,
  'LUANA ADIEL',
  'QUISPE BLAS'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'luana.adiel.quispe');

-- 15. QUISPE CONCHA, MARÍA DE FÁTIMA
INSERT INTO users (username, password, email, nombres, apellidos)
SELECT
  'maria.quispe',
  crypt('quispe', gen_salt('bf')),
  NULL,
  'MARÍA DE FÁTIMA',
  'QUISPE CONCHA'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'maria.quispe');

-- 16. QUISPE HUAYLLANI, AMY CLARISSEL
INSERT INTO users (username, password, email, nombres, apellidos)
SELECT
  'amy.quispe',
  crypt('quispe', gen_salt('bf')),
  NULL,
  'AMY CLARISSEL',
  'QUISPE HUAYLLANI'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'amy.quispe');

-- 17. QUISPE LA TORRE NOEMI ALESSIA
INSERT INTO users (username, password, email, nombres, apellidos)
SELECT
  'noemi.quispe',
  crypt('quispe', gen_salt('bf')),
  NULL,
  'NOEMI ALESSIA',
  'QUISPE LA TORRE'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'noemi.quispe');

-- 18. QUISPE MESCO, LUANA AURORA
INSERT INTO users (username, password, email, nombres, apellidos)
SELECT
  'luana.aurora.quispe',
  crypt('quispe', gen_salt('bf')),
  NULL,
  'LUANA AURORA',
  'QUISPE MESCO'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'luana.aurora.quispe');

-- 19. QUISPE SOLIS DANIELA VALENTINA
INSERT INTO users (username, password, email, nombres, apellidos)
SELECT
  'daniela.quispe',
  crypt('quispe', gen_salt('bf')),
  NULL,
  'DANIELA VALENTINA',
  'QUISPE SOLIS'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'daniela.quispe');

-- 20. SANTOS RUIZ, MARJOVIC FERNANDA
INSERT INTO users (username, password, email, nombres, apellidos)
SELECT
  'marjovic.santos',
  crypt('santos', gen_salt('bf')),
  NULL,
  'MARJOVIC FERNANDA',
  'SANTOS RUIZ'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'marjovic.santos');

-- 21. SONCCO VALENCIA, LIA IVANNA
INSERT INTO users (username, password, email, nombres, apellidos)
SELECT
  'lia.soncco',
  crypt('soncco', gen_salt('bf')),
  NULL,
  'LIA IVANNA',
  'SONCCO VALENCIA'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'lia.soncco');

-- 22. TACURI HOLGADO ROOSE CAMILA LIANED
INSERT INTO users (username, password, email, nombres, apellidos)
SELECT
  'roose.tacuri',
  crypt('tacuri', gen_salt('bf')),
  NULL,
  'ROOSE CAMILA LIANED',
  'TACURI HOLGADO'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'roose.tacuri');

-- 23. VARGAS PANTIGOZO, ZOE
INSERT INTO users (username, password, email, nombres, apellidos)
SELECT
  'zoe.vargas',
  crypt('vargas', gen_salt('bf')),
  NULL,
  'ZOE',
  'VARGAS PANTIGOZO'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'zoe.vargas');

-- 24. VELARDE CARRASCO SULEY YURIAN
INSERT INTO users (username, password, email, nombres, apellidos)
SELECT
  'suley.velarde',
  crypt('velarde', gen_salt('bf')),
  NULL,
  'SULEY YURIAN',
  'VELARDE CARRASCO'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'suley.velarde');

-- 25. VILLAVICENCIO GALDO KEIDY VICTORIA
INSERT INTO users (username, password, email, nombres, apellidos)
SELECT
  'keidy.villavicencio',
  crypt('villavicencio', gen_salt('bf')),
  NULL,
  'KEIDY VICTORIA',
  'VILLAVICENCIO GALDO'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'keidy.villavicencio');

-- 26. ZARATE ARIAS ARELYZ MILAGROS
INSERT INTO users (username, password, email, nombres, apellidos)
SELECT
  'arelyz.zarate',
  crypt('zarate', gen_salt('bf')),
  NULL,
  'ARELYZ MILAGROS',
  'ZARATE ARIAS'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'arelyz.zarate');

-- 27. ZARATE ESCOBEDO MARIANA DANIELA
INSERT INTO users (username, password, email, nombres, apellidos)
SELECT
  'mariana.zarate',
  crypt('zarate', gen_salt('bf')),
  NULL,
  'MARIANA DANIELA',
  'ZARATE ESCOBEDO'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'mariana.zarate');

-- ===========================
-- Asignar ROLE_STUDENT
-- ===========================
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
CROSS JOIN roles r
WHERE r.name = 'ROLE_STUDENT'
  AND u.username IN (
    'adriana.ancori',
    'luciana.ccahuana',
    'paola.ccahuana',
    'mirella.guevara',
    'bianca.hilari',
    'thalyta.hinojosa',
    'sami.jara',
    'valeria.juanico',
    'fernanda.loaiza',
    'luciana.mendoza',
    'zoe.meza',
    'tais.parisuaña',
    'camila.ponce',
    'luana.adiel.quispe',
    'maria.quispe',
    'amy.quispe',
    'noemi.quispe',
    'luana.aurora.quispe',
    'daniela.quispe',
    'marjovic.santos',
    'lia.soncco',
    'roose.tacuri',
    'zoe.vargas',
    'suley.velarde',
    'keidy.villavicencio',
    'arelyz.zarate',
    'mariana.zarate'
  )
ON CONFLICT DO NOTHING;
