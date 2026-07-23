CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  avatar        TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS history_items (
  id      TEXT PRIMARY KEY,
  type    TEXT NOT NULL,
  title   TEXT NOT NULL,
  words   INTEGER,
  date    TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_history_user_date ON history_items (user_id, date DESC);
