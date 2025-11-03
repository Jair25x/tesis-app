-- Checks de dominio (acotan datos erróneos sin pelearse con la app)
ALTER TABLE hints
  ADD CONSTRAINT chk_hints_cost_nonneg CHECK (cost >= 0) NOT VALID;

ALTER TABLE solution_steps
  ADD CONSTRAINT chk_steps_num_positive CHECK (step_number >= 1) NOT VALID;

ALTER TABLE exercises
  ADD CONSTRAINT chk_ex_difficulty CHECK (difficulty IN ('BASIC','INTERMEDIATE','ADVANCED')) NOT VALID;

-- Unicidad lógica para evitar duplicados molestos en catálogos/colecciones
ALTER TABLE solution_steps
  ADD CONSTRAINT uq_step_per_ex UNIQUE (exercise_id, step_number) DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE hints
  ADD CONSTRAINT uq_hint_text_per_ex UNIQUE (exercise_id, hint_text) DEFERRABLE INITIALLY IMMEDIATE;

-- ÍNDICES adiciones típicos de navegación jerárquica
CREATE INDEX IF NOT EXISTS idx_comp_curr     ON competencies(curriculum_id);
CREATE INDEX IF NOT EXISTS idx_std_comp      ON standards(competency_id);
CREATE INDEX IF NOT EXISTS idx_lo_std        ON learning_objectives(standard_id);

-- Opcional: índice GIN sobre parameters si filtras por keys/valores
-- CREATE INDEX IF NOT EXISTS gin_ex_params ON exercises USING GIN (parameters);
