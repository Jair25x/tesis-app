-- roles
CREATE UNIQUE INDEX IF NOT EXISTS ux_roles_name ON roles (name);

-- users JSONB
CREATE INDEX IF NOT EXISTS gin_users_preferences ON users USING gin (preferences);

-- user_roles (búsqueda por rol -> usuarios)
CREATE INDEX IF NOT EXISTS ix_user_roles_role ON user_roles (role_id);

-- refresh_tokens (búsqueda por token)
CREATE UNIQUE INDEX IF NOT EXISTS ux_refresh_tokens_token ON refresh_tokens (token);