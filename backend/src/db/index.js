import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (!process.env.DATABASE_URL) {
  console.warn('[db] DATABASE_URL is not set — the server will fail as soon as it tries to query the database.');
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Most free Postgres hosts (Supabase, Neon, Render) require SSL, and use
  // certs that Node's default TLS trust store won't validate without this.
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false },
});

/**
 * Applies schema.sql (idempotent CREATE TABLE IF NOT EXISTS) on startup.
 * This is a deliberate zero-config choice over a separate migration step —
 * fewer moving parts to forget when deploying to a new host. If this project
 * grows real schema migrations later, swap this for a proper migration tool
 * (node-pg-migrate, Prisma Migrate, etc.) — every other function in this
 * file only depends on the tables existing, not on how they got created.
 */
export async function initDb() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  await pool.query(schema);
}

export async function findUserByEmail(email) {
  const { rows } = await pool.query(
    'SELECT id, name, email, password_hash AS "passwordHash", avatar, created_at AS "createdAt" FROM users WHERE email = $1',
    [email]
  );
  return rows[0] || null;
}

export async function createUser(user) {
  const { id, name, email, passwordHash, avatar } = user;
  await pool.query(
    'INSERT INTO users (id, name, email, password_hash, avatar) VALUES ($1, $2, $3, $4, $5)',
    [id, name, email, passwordHash, avatar]
  );
  return user;
}

export async function getHistoryForUser(userId) {
  const { rows } = await pool.query(
    'SELECT id, type, title, words, date, user_id AS "userId" FROM history_items WHERE user_id = $1 ORDER BY date DESC',
    [userId]
  );
  return rows;
}

export async function addHistoryItem(item) {
  const { id, type, title, words = null, date, userId } = item;
  await pool.query(
    'INSERT INTO history_items (id, type, title, words, date, user_id) VALUES ($1, $2, $3, $4, $5, $6)',
    [id, type, title, words, date, userId]
  );
  return item;
}
