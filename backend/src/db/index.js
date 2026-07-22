import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', '..', 'data');
const dbFile = path.join(dataDir, 'db.json');

const defaultData = { users: [], history: [] };
const adapter = new JSONFile(dbFile);
export const db = new Low(adapter, defaultData);

export async function initDb() {
  await db.read();
  db.data ||= defaultData;
  await db.write();
}

/**
 * NOTE: This is a zero-config, file-based store — great for running locally
 * and for a demo deploy with no external services to set up. The catch: on
 * most free hosting tiers (Render, Railway, etc.) the filesystem is ephemeral,
 * so this data can be wiped on redeploy or restart. When you're ready for
 * real persistence, swap this module for Postgres/SQLite-on-a-volume/Supabase
 * — nothing outside this file needs to change since routes only import
 * `db` and the helper functions below.
 */

export async function findUserByEmail(email) {
  await db.read();
  return db.data.users.find((u) => u.email === email) || null;
}

export async function createUser(user) {
  await db.read();
  db.data.users.push(user);
  await db.write();
  return user;
}

export async function getHistoryForUser(userId) {
  await db.read();
  return db.data.history
    .filter((h) => h.userId === userId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

export async function addHistoryItem(item) {
  await db.read();
  db.data.history.push(item);
  await db.write();
  return item;
}
