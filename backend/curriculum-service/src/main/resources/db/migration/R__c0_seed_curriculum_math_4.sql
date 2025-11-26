-- ============================================================
-- R__seed_curriculum_math_4.sql – Estructura base (contenidos 4.º)
-- ============================================================

-- 1) CURR
INSERT INTO curricula (id, code, name, description, grade, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(), 'CURR-MATH-4',
       'Currículo de Matemática - Cuarto grado',
       'Estructura base de contenidos de Matemática para 4.º grado de primaria (números naturales, factores y múltiplos, operaciones, fracciones, ángulos, figuras, decimales y simetría).',
       '4', TRUE, 'seed','seed', now(), now()
ON CONFLICT (code) DO NOTHING;

-- 2) COMPETENCIAS (C.1 – C.8)
WITH curr AS (SELECT id FROM curricula WHERE code = 'CURR-MATH-4')
INSERT INTO competencies (id, code, name, description, active, curriculum_id,
                          created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(), 'C.1', 'NÚMEROS NATURALES',
       'Lectura, escritura, comparación, patrones, redondeo y estimación de números naturales hasta 100 000.',
       TRUE, id, 'seed','seed', now(), now()
FROM curr
UNION ALL
SELECT gen_random_uuid(), 'C.2', 'FACTORES Y MÚLTIPLOS',
       'Reconoce y usa factores, múltiplos y criterios sencillos de divisibilidad en situaciones problemáticas.',
       TRUE, id, 'seed','seed', now(), now()
FROM curr
UNION ALL
SELECT gen_random_uuid(), 'C.3', 'CUATRO OPERACIONES CON NÚMEROS NATURALES',
       'Aplica las cuatro operaciones con números naturales en algoritmos y en resolución de problemas.',
       TRUE, id, 'seed','seed', now(), now()
FROM curr
UNION ALL
SELECT gen_random_uuid(), 'C.4', 'FRACCIONES',
       'Representa, compara y opera fracciones y números mixtos en diversos contextos.',
       TRUE, id, 'seed','seed', now(), now()
FROM curr
UNION ALL
SELECT gen_random_uuid(), 'C.5', 'ÁNGULOS',
       'Reconoce, nombra, mide y construye ángulos, giros y direcciones.',
       TRUE, id, 'seed','seed', now(), now()
FROM curr
UNION ALL
SELECT gen_random_uuid(), 'C.6', 'CUADRADOS Y RECTÁNGULOS',
       'Reconoce propiedades, dibuja y resuelve problemas con cuadrados y rectángulos.',
       TRUE, id, 'seed','seed', now(), now()
FROM curr
UNION ALL
SELECT gen_random_uuid(), 'C.7', 'DECIMALES',
       'Representa, compara, redondea y opera con números decimales hasta los milésimos.',
       TRUE, id, 'seed','seed', now(), now()
FROM curr
UNION ALL
SELECT gen_random_uuid(), 'C.8', 'SIMETRÍA Y TRANSFORMACIONES',
       'Reconoce simetrías y realiza traslaciones de figuras en el plano.',
       TRUE, id, 'seed','seed', now(), now()
FROM curr
ON CONFLICT (code) DO NOTHING;

-- 3) STANDARDS POR COMPETENCIA
------------------------------------------------------------
-- C.1 NÚMEROS NATURALES
------------------------------------------------------------
WITH c1 AS (SELECT id FROM competencies WHERE code = 'C.1')
INSERT INTO standards (id, code, name, description, active, competency_id,
                       created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),'S.1.1','Números hasta el 100 000',
       'Lectura, escritura, descomposición y valor posicional de números hasta 100 000.',
       TRUE, c1.id,'seed','seed',now(),now()
FROM c1
UNION ALL
SELECT gen_random_uuid(),'S.1.2','Comparar y ordenar números',
       'Uso de <, >, = y ordenamiento de listas de números hasta 100 000.',
       TRUE, c1.id,'seed','seed',now(),now()
FROM c1
UNION ALL
SELECT gen_random_uuid(),'S.1.3','Patrones numéricos',
       'Identificación y descripción de patrones numéricos hasta 100 000.',
       TRUE, c1.id,'seed','seed',now(),now()
FROM c1
UNION ALL
SELECT gen_random_uuid(),'S.1.4','Redondeo y estimación',
       'Redondeo a distintas unidades y estimación de resultados con números naturales.',
       TRUE, c1.id,'seed','seed',now(),now()
FROM c1
ON CONFLICT (code) DO NOTHING;

------------------------------------------------------------
-- C.2 FACTORES Y MÚLTIPLOS
------------------------------------------------------------
WITH c2 AS (SELECT id FROM competencies WHERE code = 'C.2')
INSERT INTO standards (id, code, name, description, active, competency_id,
                       created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),'S.2.1','Factores de números naturales',
       'Identificación de factores y parejas de factores de un número natural.',
       TRUE, c2.id,'seed','seed',now(),now()
FROM c2
UNION ALL
SELECT gen_random_uuid(),'S.2.2','Múltiplos y divisibilidad',
       'Reconocimiento de múltiplos y uso de criterios sencillos de divisibilidad en problemas.',
       TRUE, c2.id,'seed','seed',now(),now()
FROM c2
ON CONFLICT (code) DO NOTHING;

------------------------------------------------------------
-- C.3 CUATRO OPERACIONES CON NÚMEROS NATURALES
------------------------------------------------------------
WITH c3 AS (SELECT id FROM competencies WHERE code = 'C.3')
INSERT INTO standards (id, code, name, description, active, competency_id,
                       created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),'S.3.1','Multiplicación con números naturales',
       'Multiplicación por números de una y dos cifras usando modelos y algoritmos.',
       TRUE, c3.id,'seed','seed',now(),now()
FROM c3
UNION ALL
SELECT gen_random_uuid(),'S.3.2','División y relación con la multiplicación',
       'División entre un número de una cifra y verificación con la multiplicación.',
       TRUE, c3.id,'seed','seed',now(),now()
FROM c3
UNION ALL
SELECT gen_random_uuid(),'S.3.3','Igualdades y resolución de problemas',
       'Uso de igualdades y modelos para resolver problemas con las cuatro operaciones.',
       TRUE, c3.id,'seed','seed',now(),now()
FROM c3
ON CONFLICT (code) DO NOTHING;

------------------------------------------------------------
-- C.4 FRACCIONES
------------------------------------------------------------
WITH c4 AS (SELECT id FROM competencies WHERE code = 'C.4')
INSERT INTO standards (id, code, name, description, active, competency_id,
                       created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),'S.4.1','Representación de fracciones y números mixtos',
       'Representa fracciones propias, impropias y números mixtos en diversos contextos.',
       TRUE, c4.id,'seed','seed',now(),now()
FROM c4
UNION ALL
SELECT gen_random_uuid(),'S.4.2','Comparación y orden de fracciones',
       'Comparación y ordenamiento de fracciones con distintos denominadores.',
       TRUE, c4.id,'seed','seed',now(),now()
FROM c4
UNION ALL
SELECT gen_random_uuid(),'S.4.3','Adición y sustracción de fracciones',
       'Suma y resta de fracciones en contextos variados.',
       TRUE, c4.id,'seed','seed',now(),now()
FROM c4
UNION ALL
SELECT gen_random_uuid(),'S.4.4','Fracción de un número natural',
       'Cálculo de la fracción de un número natural y resolución de problemas asociados.',
       TRUE, c4.id,'seed','seed',now(),now()
FROM c4
ON CONFLICT (code) DO NOTHING;

------------------------------------------------------------
-- C.5 ÁNGULOS
------------------------------------------------------------
WITH c5 AS (SELECT id FROM competencies WHERE code = 'C.5')
INSERT INTO standards (id, code, name, description, active, competency_id,
                       created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),'S.5.1','Identificación y nomenclatura de ángulos',
       'Reconoce y nombra distintos tipos de ángulos.',
       TRUE, c5.id,'seed','seed',now(),now()
FROM c5
UNION ALL
SELECT gen_random_uuid(),'S.5.2','Medición y construcción de ángulos',
       'Mide y dibuja ángulos en grados.',
       TRUE, c5.id,'seed','seed',now(),now()
FROM c5
UNION ALL
SELECT gen_random_uuid(),'S.5.3','Giros y direcciones',
       'Describe giros y usa direcciones de la brújula en situaciones cotidianas.',
       TRUE, c5.id,'seed','seed',now(),now()
FROM c5
ON CONFLICT (code) DO NOTHING;

------------------------------------------------------------
-- C.6 CUADRADOS Y RECTÁNGULOS
------------------------------------------------------------
WITH c6 AS (SELECT id FROM competencies WHERE code = 'C.6')
INSERT INTO standards (id, code, name, description, active, competency_id,
                       created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),'S.6.1','Propiedades de cuadrados y rectángulos',
       'Reconoce y describe propiedades de lados y ángulos en cuadrados y rectángulos.',
       TRUE, c6.id,'seed','seed',now(),now()
FROM c6
UNION ALL
SELECT gen_random_uuid(),'S.6.2','Construcción y problemas con cuadrados y rectángulos',
       'Dibuja cuadrados y rectángulos y resuelve problemas con lados y ángulos desconocidos.',
       TRUE, c6.id,'seed','seed',now(),now()
FROM c6
ON CONFLICT (code) DO NOTHING;

------------------------------------------------------------
-- C.7 DECIMALES
------------------------------------------------------------
WITH c7 AS (SELECT id FROM competencies WHERE code = 'C.7')
INSERT INTO standards (id, code, name, description, active, competency_id,
                       created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),'S.7.1','Representación de números decimales',
       'Interpreta décimos, centésimos y milésimos en diferentes representaciones.',
       TRUE, c7.id,'seed','seed',now(),now()
FROM c7
UNION ALL
SELECT gen_random_uuid(),'S.7.2','Comparación, patrones y redondeo de decimales',
       'Compara, ordena, identifica patrones y redondea números decimales.',
       TRUE, c7.id,'seed','seed',now(),now()
FROM c7
UNION ALL
SELECT gen_random_uuid(),'S.7.3','Equivalencia fracción–decimal',
       'Convierte fracciones a decimales y decimales a fracciones.',
       TRUE, c7.id,'seed','seed',now(),now()
FROM c7
UNION ALL
SELECT gen_random_uuid(),'S.7.4','Operaciones con decimales',
       'Realiza adición y sustracción de números decimales en contextos variados.',
       TRUE, c7.id,'seed','seed',now(),now()
FROM c7
ON CONFLICT (code) DO NOTHING;

------------------------------------------------------------
-- C.8 SIMETRÍA Y TRANSFORMACIONES
------------------------------------------------------------
WITH c8 AS (SELECT id FROM competencies WHERE code = 'C.8')
INSERT INTO standards (id, code, name, description, active, competency_id,
                       created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),'S.8.1','Figuras simétricas y líneas de simetría',
       'Reconoce figuras simétricas y traza líneas de simetría.',
       TRUE, c8.id,'seed','seed',now(),now()
FROM c8
UNION ALL
SELECT gen_random_uuid(),'S.8.2','Traslación de figuras en el plano',
       'Describe y realiza traslaciones de figuras en el plano cuadriculado.',
       TRUE, c8.id,'seed','seed',now(),now()
FROM c8
ON CONFLICT (code) DO NOTHING;

-- 4) LEARNING OBJECTIVES
------------------------------------------------------------
-- C.1 NÚMEROS NATURALES
------------------------------------------------------------
WITH s11 AS (SELECT id FROM standards WHERE code='S.1.1'),
     s12 AS (SELECT id FROM standards WHERE code='S.1.2'),
     s13 AS (SELECT id FROM standards WHERE code='S.1.3'),
     s14 AS (SELECT id FROM standards WHERE code='S.1.4')
INSERT INTO learning_objectives (id, code, name, description, active, standard_id,
                                 created_by, updated_by, created_at, updated_at)
VALUES
  (gen_random_uuid(),'LO.1.1.1','Valor posicional y notación',
   'Identifica el valor posicional de las cifras y descompone números naturales hasta 100 000.',
   TRUE,(SELECT id FROM s11),'seed','seed',now(),now()),
  (gen_random_uuid(),'LO.1.1.2','Lectura y escritura de números',
   'Lee y escribe números naturales hasta 100 000 en cifras y palabras.',
   TRUE,(SELECT id FROM s11),'seed','seed',now(),now()),
  (gen_random_uuid(),'LO.1.2.1','Comparar y ordenar hasta 100 000',
   'Compara y ordena números hasta 100 000 usando los símbolos <, > y =.',
   TRUE,(SELECT id FROM s12),'seed','seed',now(),now()),
  (gen_random_uuid(),'LO.1.3.1','Patrones y secuencias numéricas',
   'Completa secuencias y describe la regla de patrones numéricos hasta 100 000.',
   TRUE,(SELECT id FROM s13),'seed','seed',now(),now()),
  (gen_random_uuid(),'LO.1.4.1','Redondeo y estimación en contexto',
   'Redondea números naturales y estima resultados en situaciones cotidianas.',
   TRUE,(SELECT id FROM s14),'seed','seed',now(),now())
ON CONFLICT (code) DO NOTHING;

------------------------------------------------------------
-- C.2 FACTORES Y MÚLTIPLOS
------------------------------------------------------------
WITH s21 AS (SELECT id FROM standards WHERE code='S.2.1'),
     s22 AS (SELECT id FROM standards WHERE code='S.2.2')
INSERT INTO learning_objectives (id, code, name, description, active, standard_id,
                                 created_by, updated_by, created_at, updated_at)
VALUES
  (gen_random_uuid(),'LO.2.1.1','Factores de un número natural',
   'Identifica los factores de un número natural y forma parejas de factores.',
   TRUE,(SELECT id FROM s21),'seed','seed',now(),now()),
  (gen_random_uuid(),'LO.2.2.1','Múltiplos de un número natural',
   'Reconoce múltiplos de un número natural y analiza regularidades en las listas de múltiplos.',
   TRUE,(SELECT id FROM s22),'seed','seed',now(),now()),
  (gen_random_uuid(),'LO.2.2.2','Criterios sencillos de divisibilidad',
   'Aplica criterios sencillos de divisibilidad para resolver problemas.',
   TRUE,(SELECT id FROM s22),'seed','seed',now(),now())
ON CONFLICT (code) DO NOTHING;

------------------------------------------------------------
-- C.3 CUATRO OPERACIONES CON NÚMEROS NATURALES
------------------------------------------------------------
WITH s31 AS (SELECT id FROM standards WHERE code='S.3.1'),
     s32 AS (SELECT id FROM standards WHERE code='S.3.2'),
     s33 AS (SELECT id FROM standards WHERE code='S.3.3')
INSERT INTO learning_objectives (id, code, name, description, active, standard_id,
                                 created_by, updated_by, created_at, updated_at)
VALUES
  (gen_random_uuid(),'LO.3.1.1','Multiplicación por un número de una cifra',
   'Multiplica números naturales por un número de una cifra usando modelos y algoritmos.',
   TRUE,(SELECT id FROM s31),'seed','seed',now(),now()),
  (gen_random_uuid(),'LO.3.1.2','Multiplicación por un número de dos cifras',
   'Multiplica números naturales por un número de dos cifras.',
   TRUE,(SELECT id FROM s31),'seed','seed',now(),now()),
  (gen_random_uuid(),'LO.3.2.1','División entre un número de una cifra',
   'Resuelve divisiones entre un número de una cifra y verifica el resultado con la multiplicación.',
   TRUE,(SELECT id FROM s32),'seed','seed',now(),now()),
  (gen_random_uuid(),'LO.3.3.1','Igualdades con operaciones',
   'Establece igualdades que relacionan diferentes operaciones y las usa para verificar resultados.',
   TRUE,(SELECT id FROM s33),'seed','seed',now(),now()),
  (gen_random_uuid(),'LO.3.3.2','Resolución de problemas con las cuatro operaciones',
   'Resuelve problemas que involucran las cuatro operaciones utilizando modelos y estrategias variadas.',
   TRUE,(SELECT id FROM s33),'seed','seed',now(),now())
ON CONFLICT (code) DO NOTHING;

------------------------------------------------------------
-- C.4 FRACCIONES
------------------------------------------------------------
WITH s41 AS (SELECT id FROM standards WHERE code='S.4.1'),
     s42 AS (SELECT id FROM standards WHERE code='S.4.2'),
     s43 AS (SELECT id FROM standards WHERE code='S.4.3'),
     s44 AS (SELECT id FROM standards WHERE code='S.4.4')
INSERT INTO learning_objectives (id, code, name, description, active, standard_id,
                                 created_by, updated_by, created_at, updated_at)
VALUES
  (gen_random_uuid(),'LO.4.1.1','Números mixtos y fracciones impropias',
   'Representa números mixtos y fracciones impropias en diferentes contextos.',
   TRUE,(SELECT id FROM s41),'seed','seed',now(),now()),
  (gen_random_uuid(),'LO.4.1.2','Conversión entre fracciones y números mixtos',
   'Convierte fracciones impropias a números mixtos y viceversa.',
   TRUE,(SELECT id FROM s41),'seed','seed',now(),now()),
  (gen_random_uuid(),'LO.4.2.1','Comparar y ordenar fracciones',
   'Compara y ordena fracciones usando representaciones gráficas y numéricas.',
   TRUE,(SELECT id FROM s42),'seed','seed',now(),now()),
  (gen_random_uuid(),'LO.4.3.1','Adición y sustracción de fracciones',
   'Realiza adición y sustracción de fracciones con denominadores compatibles.',
   TRUE,(SELECT id FROM s43),'seed','seed',now(),now()),
  (gen_random_uuid(),'LO.4.4.1','Fracción de un número natural',
   'Calcula la fracción de un número natural y resuelve problemas contextualizados.',
   TRUE,(SELECT id FROM s44),'seed','seed',now(),now())
ON CONFLICT (code) DO NOTHING;

------------------------------------------------------------
-- C.5 ÁNGULOS
------------------------------------------------------------
WITH s51 AS (SELECT id FROM standards WHERE code='S.5.1'),
     s52 AS (SELECT id FROM standards WHERE code='S.5.2'),
     s53 AS (SELECT id FROM standards WHERE code='S.5.3')
INSERT INTO learning_objectives (id, code, name, description, active, standard_id,
                                 created_by, updated_by, created_at, updated_at)
VALUES
  (gen_random_uuid(),'LO.5.1.1','Identificación de ángulos',
   'Reconoce y nombra distintos tipos de ángulos en figuras y situaciones del entorno.',
   TRUE,(SELECT id FROM s51),'seed','seed',now(),now()),
  (gen_random_uuid(),'LO.5.2.1','Medición y construcción de ángulos',
   'Mide y dibuja ángulos en grados usando instrumentos apropiados.',
   TRUE,(SELECT id FROM s52),'seed','seed',now(),now()),
  (gen_random_uuid(),'LO.5.3.1','Giros y direcciones',
   'Describe giros de un cuarto, mitad, tres cuartos y completos y los relaciona con las direcciones de la brújula.',
   TRUE,(SELECT id FROM s53),'seed','seed',now(),now())
ON CONFLICT (code) DO NOTHING;

------------------------------------------------------------
-- C.6 CUADRADOS Y RECTÁNGULOS
------------------------------------------------------------
WITH s61 AS (SELECT id FROM standards WHERE code='S.6.1'),
     s62 AS (SELECT id FROM standards WHERE code='S.6.2')
INSERT INTO learning_objectives (id, code, name, description, active, standard_id,
                                 created_by, updated_by, created_at, updated_at)
VALUES
  (gen_random_uuid(),'LO.6.1.1','Propiedades de cuadrados y rectángulos',
   'Reconoce y describe las propiedades de lados y ángulos en cuadrados y rectángulos.',
   TRUE,(SELECT id FROM s61),'seed','seed',now(),now()),
  (gen_random_uuid(),'LO.6.2.1','Construcción y resolución de problemas con figuras rectangulares',
   'Dibuja cuadrados y rectángulos y resuelve problemas con lados o ángulos desconocidos.',
   TRUE,(SELECT id FROM s62),'seed','seed',now(),now())
ON CONFLICT (code) DO NOTHING;

------------------------------------------------------------
-- C.7 DECIMALES
------------------------------------------------------------
WITH s71 AS (SELECT id FROM standards WHERE code='S.7.1'),
     s72 AS (SELECT id FROM standards WHERE code='S.7.2'),
     s73 AS (SELECT id FROM standards WHERE code='S.7.3'),
     s74 AS (SELECT id FROM standards WHERE code='S.7.4')
INSERT INTO learning_objectives (id, code, name, description, active, standard_id,
                                 created_by, updated_by, created_at, updated_at)
VALUES
  (gen_random_uuid(),'LO.7.1.1','Representación de números decimales',
   'Interpreta y representa décimos, centésimos y milésimos en rectas y modelos.',
   TRUE,(SELECT id FROM s71),'seed','seed',now(),now()),
  (gen_random_uuid(),'LO.7.2.1','Comparar, ordenar y redondear decimales',
   'Compara, ordena y redondea números decimales e identifica patrones en secuencias decimales.',
   TRUE,(SELECT id FROM s72),'seed','seed',now(),now()),
  (gen_random_uuid(),'LO.7.3.1','Equivalencia entre fracciones y decimales',
   'Convierte fracciones a números decimales y números decimales a fracciones.',
   TRUE,(SELECT id FROM s73),'seed','seed',now(),now()),
  (gen_random_uuid(),'LO.7.4.1','Adición y sustracción de decimales',
   'Realiza adición y sustracción de números decimales en situaciones problemáticas.',
   TRUE,(SELECT id FROM s74),'seed','seed',now(),now())
ON CONFLICT (code) DO NOTHING;

------------------------------------------------------------
-- C.8 SIMETRÍA Y TRANSFORMACIONES
------------------------------------------------------------
WITH s81 AS (SELECT id FROM standards WHERE code='S.8.1'),
     s82 AS (SELECT id FROM standards WHERE code='S.8.2')
INSERT INTO learning_objectives (id, code, name, description, active, standard_id,
                                 created_by, updated_by, created_at, updated_at)
VALUES
  (gen_random_uuid(),'LO.8.1.1','Figuras simétricas y líneas de simetría',
   'Reconoce figuras simétricas y traza líneas de simetría en diversas figuras.',
   TRUE,(SELECT id FROM s81),'seed','seed',now(),now()),
  (gen_random_uuid(),'LO.8.1.2','Completar figuras simétricas',
   'Completa figuras simétricas en papel cuadriculado u otras representaciones.',
   TRUE,(SELECT id FROM s81),'seed','seed',now(),now()),
  (gen_random_uuid(),'LO.8.2.1','Traslaciones en el plano',
   'Describe y representa traslaciones de figuras en el plano cuadriculado.',
   TRUE,(SELECT id FROM s82),'seed','seed',now(),now())
ON CONFLICT (code) DO NOTHING;