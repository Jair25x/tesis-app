-- V4__insert_sajonia_4to2_students.sql
-- Crea usuarios STUDENT para 4to grado Jordan de Sajonia 2

-- Aseguramos que exista ROLE_STUDENT (idempotente)
INSERT INTO roles (name)
SELECT 'ROLE_STUDENT'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'ROLE_STUDENT');

-- ===========================
-- Inserción de estudiantes
-- ===========================

-- 1. ALMANZA CUNO, JOSSELYN ABIGAIL
INSERT INTO users (username, password, email, nombres, apellidos)
SELECT
  'josselyn.almanza',
  crypt('almanza', gen_salt('bf')),
  NULL,
  'JOSSELYN ABIGAIL',
  'ALMANZA CUNO'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'josselyn.almanza');

-- 2. ANDRADE ORMACHEA, YAMILETH LUANA
INSERT INTO users (username, password, email, nombres, apellidos)
SELECT
  'yamileth.andrade',
  crypt('andrade', gen_salt('bf')),
  NULL,
  'YAMILETH LUANA',
  'ANDRADE ORMACHEA'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'yamileth.andrade');

-- 3. BACA GUTIERREZ, CAMILA EMPERATRIZ
INSERT INTO users (username, password, email, nombres, apellidos)
SELECT
  'camila.baca',
  crypt('baca', gen_salt('bf')),
  NULL,
  'CAMILA EMPERATRIZ',
  'BACA GUTIERREZ'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'camila.baca');

-- 4. BAUTISTA MAMANI, AISHA ASIRI
INSERT INTO users (username, password, email, nombres, apellidos)
SELECT
  'aisha.bautista',
  crypt('bautista', gen_salt('bf')),
  NULL,
  'AISHA ASIRI',
  'BAUTISTA MAMANI'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'aisha.bautista');

-- 5. BECERRA PAREDES, URPI HISAE
INSERT INTO users (username, password, email, nombres, apellidos)
SELECT
  'urpi.becerra',
  crypt('becerra', gen_salt('bf')),
  NULL,
  'URPI HISAE',
  'BECERRA PAREDES'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'urpi.becerra');

-- 6. CALLAPIÑA CLEMENT, ARIANA VALENTINA
INSERT INTO users (username, password, email, nombres, apellidos)
SELECT
  'ariana.callapiña',
  crypt('callapiña', gen_salt('bf')),
  NULL,
  'ARIANA VALENTINA',
  'CALLAPIÑA CLEMENT'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'ariana.callapiña');

-- 7. CÁRDENAS MELGAR, LUCIANA MICAELA
INSERT INTO users (username, password, email, nombres, apellidos)
SELECT
  'luciana.cardenas',
  crypt('cardenas', gen_salt('bf')),
  NULL,
  'LUCIANA MICAELA',
  'CARDENAS MELGAR'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'luciana.cardenas');

-- 8. CARPIO HUARCA, MILAGROS NASHIRA
INSERT INTO users (username, password, email, nombres, apellidos)
SELECT
  'milagros.carpio',
  crypt('carpio', gen_salt('bf')),
  NULL,
  'MILAGROS NASHIRA',
  'CARPIO HUARCA'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'milagros.carpio');

-- 9. CASTILLA TORRE, JUANA SAMANTHA
INSERT INTO users (username, password, email, nombres, apellidos)
SELECT
  'juana.castilla',
  crypt('castilla', gen_salt('bf')),
  NULL,
  'JUANA SAMANTHA',
  'CASTILLA TORRE'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'juana.castilla');

-- 10. CCOPA CONTO, TELMA GRAZIA
INSERT INTO users (username, password, email, nombres, apellidos)
SELECT
  'telma.ccopa',
  crypt('ccopa', gen_salt('bf')),
  NULL,
  'TELMA GRAZIA',
  'CCOPA CONTO'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'telma.ccopa');

-- 11. CONDORI LLERENA, ESTHER
INSERT INTO users (username, password, email, nombres, apellidos)
SELECT
  'esther.condori',
  crypt('condori', gen_salt('bf')),
  NULL,
  'ESTHER',
  'CONDORI LLERENA'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'esther.condori');

-- 12. CUSIHUAMÁN HUAMANI, DAMARIS MICAELA
INSERT INTO users (username, password, email, nombres, apellidos)
SELECT
  'damaris.cusihuaman',
  crypt('cusihuaman', gen_salt('bf')),
  NULL,
  'DAMARIS MICAELA',
  'CUSIHUAMAN HUAMANI'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'damaris.cusihuaman');

-- 13. DÁVALOS OLAZABAL, LUCIANA
INSERT INTO users (username, password, email, nombres, apellidos)
SELECT
  'luciana.davalos',
  crypt('davalos', gen_salt('bf')),
  NULL,
  'LUCIANA',
  'DÁVALOS OLAZABAL'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'luciana.davalos');

-- 14. ESCALANTE MERMA, NICOLE VALENTINA
INSERT INTO users (username, password, email, nombres, apellidos)
SELECT
  'nicole.escalante',
  crypt('escalante', gen_salt('bf')),
  NULL,
  'NICOLE VALENTINA',
  'ESCALANTE MERMA'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'nicole.escalante');

-- 15. ESTRADA ZÁRATE, FÁTIMA VICTORIA
INSERT INTO users (username, password, email, nombres, apellidos)
SELECT
  'fatima.estrada',
  crypt('estrada', gen_salt('bf')),
  NULL,
  'FATIMA VICTORIA',
  'ESTRADA ZARATE'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'fatima.estrada');

-- 16. FARFÁN QUISPE, LUANA MARIALE
INSERT INTO users (username, password, email, nombres, apellidos)
SELECT
  'luana.farfan',
  crypt('farfan', gen_salt('bf')),
  NULL,
  'LUANA MARIALE',
  'FARFAN QUISPE'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'luana.farfan');

-- 17. GARCÍA VALERO, ALONDRA IVANA
INSERT INTO users (username, password, email, nombres, apellidos)
SELECT
  'alondra.garcia',
  crypt('garcia', gen_salt('bf')),
  NULL,
  'ALONDRA IVANA',
  'GARCIA VALERO'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'alondra.garcia');

-- 18. HUAMÁN PILLCO, SAMI AILANIE
INSERT INTO users (username, password, email, nombres, apellidos)
SELECT
  'sami.huaman',
  crypt('huaman', gen_salt('bf')),
  NULL,
  'SAMI AILANIE',
  'HUAMAN PILLCO'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'sami.huaman');

-- 19. HUARCAYA ALVARADO, BRIANNA ROSS
INSERT INTO users (username, password, email, nombres, apellidos)
SELECT
  'brianna.huarcaya',
  crypt('huarcaya', gen_salt('bf')),
  NULL,
  'BRIANNA ROSS',
  'HUARCAYA ALVARADO'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'brianna.huarcaya');

-- 20. HURTADO HUAMÁN, ARIANA MICAELA
INSERT INTO users (username, password, email, nombres, apellidos)
SELECT
  'ariana.hurtado',
  crypt('hurtado', gen_salt('bf')),
  NULL,
  'ARIANA MICAELA',
  'HURTADO HUAMAN'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'ariana.hurtado');

-- 21. JARA MARTIARENA, DANNETH VALERIE RENATA
INSERT INTO users (username, password, email, nombres, apellidos)
SELECT
  'danneth.jara',
  crypt('jara', gen_salt('bf')),
  NULL,
  'DANNETH VALERIE RENATA',
  'JARA MARTIARENA'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'danneth.jara');

-- 22. RÍOS CUSI, ALDANA MICAELA
INSERT INTO users (username, password, email, nombres, apellidos)
SELECT
  'aldana.rios',
  crypt('rios', gen_salt('bf')),
  NULL,
  'ALDANA MICAELA',
  'RIOS CUSI'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'aldana.rios');

-- 23. ROMOACCA ENRÍQUEZ, MISHELLE ALMENDRA
INSERT INTO users (username, password, email, nombres, apellidos)
SELECT
  'mishelle.romoacca',
  crypt('romoacca', gen_salt('bf')),
  NULL,
  'MISHELLE ALMENDRA',
  'ROMOACCA ENRIQUEZ'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'mishelle.romoacca');

-- 24. SÁNCHEZ VÁSQUEZ, AZUL CAMILA
INSERT INTO users (username, password, email, nombres, apellidos)
SELECT
  'azul.sanchez',
  crypt('sanchez', gen_salt('bf')),
  NULL,
  'AZUL CAMILA',
  'SANCHEZ VASQUEZ'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'azul.sanchez');

-- 25. TAYPE GONZÁLES, LUANA LUCERO
INSERT INTO users (username, password, email, nombres, apellidos)
SELECT
  'luana.taype',
  crypt('taype', gen_salt('bf')),
  NULL,
  'LUANA LUCERO',
  'TAYPE GONZALES'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'luana.taype');

-- 26. TORRES CARRASCO, KRISTEN ISSIA
INSERT INTO users (username, password, email, nombres, apellidos)
SELECT
  'kristen.torres',
  crypt('torres', gen_salt('bf')),
  NULL,
  'KRISTEN ISSIA',
  'TORRES CARRASCO'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'kristen.torres');

-- 27. VELASCO APAZA, ALIZZE BRIANNA
INSERT INTO users (username, password, email, nombres, apellidos)
SELECT
  'alizze.velasco',
  crypt('velasco', gen_salt('bf')),
  NULL,
  'ALIZZE BRIANNA',
  'VELASCO APAZA'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'alizze.velasco');

-- ===========================
-- Asignar ROLE_STUDENT
-- ===========================
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
CROSS JOIN roles r
WHERE r.name = 'ROLE_STUDENT'
  AND u.username IN (
    'josselyn.almanza',
    'yamileth.andrade',
    'camila.baca',
    'aisha.bautista',
    'urpi.becerra',
    'ariana.callapiña',
    'luciana.cardenas',
    'milagros.carpio',
    'juana.castilla',
    'telma.ccopa',
    'esther.condori',
    'damaris.cusihuaman',
    'luciana.davalos',
    'nicole.escalante',
    'fatima.estrada',
    'luana.farfan',
    'alondra.garcia',
    'sami.huaman',
    'brianna.huarcaya',
    'ariana.hurtado',
    'danneth.jara',
    'aldana.rios',
    'mishelle.romoacca',
    'azul.sanchez',
    'luana.taype',
    'kristen.torres',
    'alizze.velasco'
  )
ON CONFLICT DO NOTHING;
