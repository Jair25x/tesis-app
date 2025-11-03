-- === Extensiones útiles (opcional si no tienes privilegios de superuser) ===
-- Si tu Postgres de Docker es estándar, puedes dejarlas activas.
-- Si tu proveedor no permite CREATE EXTENSION, comenta estas líneas.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- === Tabla roles ===
CREATE TABLE IF NOT EXISTS roles (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(20) NOT NULL UNIQUE
);

-- === Tabla users ===
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  user_uuid UUID NOT NULL UNIQUE DEFAULT uuid_generate_v4(),
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(320), -- puede ser nulo; uniqueness parcial abajo
  fecha_registro TIMESTAMP NOT NULL DEFAULT NOW(),
  nombres VARCHAR(255) NOT NULL,
  apellidos VARCHAR(255) NOT NULL,
  profile_picture_url VARCHAR(1024),
  preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  account_non_locked BOOLEAN NOT NULL DEFAULT TRUE,
  credentials_non_expired BOOLEAN NOT NULL DEFAULT TRUE
);

-- Unique index seguro para email (permite múltiples NULL, fuerza unique cuando tiene valor)
CREATE UNIQUE INDEX IF NOT EXISTS ux_users_email
  ON users (lower(email))
  WHERE email IS NOT NULL;

-- Índices recomendados
CREATE INDEX IF NOT EXISTS ix_users_username ON users (lower(username));
CREATE INDEX IF NOT EXISTS ix_users_user_uuid ON users (user_uuid);

-- === Tabla de asociación user_roles (Many-to-Many) ===
CREATE TABLE IF NOT EXISTS user_roles (
  user_id BIGINT NOT NULL,
  role_id INTEGER NOT NULL,
  PRIMARY KEY (user_id, role_id),
  CONSTRAINT fk_user_roles_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_user_roles_role
    FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE RESTRICT
);

-- === Tabla refresh_tokens (One-to-One con users) ===
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE, -- @OneToOne => único por usuario
  token TEXT NOT NULL UNIQUE,
  expiry_date TIMESTAMP NOT NULL,
  CONSTRAINT fk_refresh_tokens_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Índices útiles
CREATE INDEX IF NOT EXISTS ix_refresh_tokens_expiry_date ON refresh_tokens (expiry_date);
