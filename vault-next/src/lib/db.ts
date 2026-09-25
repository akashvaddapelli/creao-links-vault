/**
 * Database layer — libSQL (Turso-compatible).
 * Points at a local file in dev (TURSO_DATABASE_URL unset) or a remote
 * Turso database in prod. All data lives in your own database, zero
 * lock-in to a specific host.
 */

import { createClient, type Client } from "@libsql/client";
import path from "node:path";
import fs from "node:fs";

let _db: Client | null = null;

export function getDb(): Client {
  if (!_db) {
    const url = process.env.TURSO_DATABASE_URL || defaultLocalUrl();
    const authToken = process.env.TURSO_AUTH_TOKEN;
    _db = createClient(authToken ? { url, authToken } : { url });
  }
  return _db;
}

function defaultLocalUrl(): string {
  const dbPath = process.env.DB_PATH || path.join(process.cwd(), "data", "vault.db");
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  return `file:${dbPath}`;
}

let _migrated: Promise<void> | null = null;

export function ensureMigrated(): Promise<void> {
  if (!_migrated) _migrated = migrate(getDb());
  return _migrated;
}

/** Resolves once migrations have run, then returns the client. Use this from lib/*.ts instead of getDb(). */
export async function db(): Promise<Client> {
  await ensureMigrated();
  return getDb();
}

async function migrate(db: Client): Promise<void> {
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS links (
      id          TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL,
      url         TEXT NOT NULL,
      display_name TEXT NOT NULL,
      created_at  INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at  INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE INDEX IF NOT EXISTS idx_links_user ON links(user_id);

    CREATE TABLE IF NOT EXISTS sessions (
      token       TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL,
      expires_at  INTEGER NOT NULL,
      created_at  INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

    CREATE TABLE IF NOT EXISTS notes (
      id          TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL,
      title       TEXT NOT NULL,
      body        TEXT NOT NULL DEFAULT '',
      created_at  INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at  INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE INDEX IF NOT EXISTS idx_notes_user ON notes(user_id);

    CREATE TABLE IF NOT EXISTS password_entries (
      id              TEXT PRIMARY KEY,
      user_id         TEXT NOT NULL,
      label           TEXT NOT NULL,
      username        TEXT NOT NULL DEFAULT '',
      encrypted_secret TEXT NOT NULL,
      iv              TEXT NOT NULL,
      auth_tag        TEXT NOT NULL,
      notes           TEXT NOT NULL DEFAULT '',
      created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE INDEX IF NOT EXISTS idx_password_entries_user ON password_entries(user_id);

    CREATE TABLE IF NOT EXISTS files (
      id          TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL,
      filename    TEXT NOT NULL,
      mime_type   TEXT NOT NULL,
      size_bytes  INTEGER NOT NULL,
      storage_key TEXT NOT NULL,
      created_at  INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at  INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE INDEX IF NOT EXISTS idx_files_user ON files(user_id);
  `);
}
