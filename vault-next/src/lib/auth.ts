/**
 * Authentication — session-based, no third-party auth service.
 * Single owner: credentials stored in environment variables.
 * Sessions stored in SQLite, token in httpOnly cookie.
 */

import { getDb } from "./db";
import { cookies } from "next/headers";
import crypto from "node:crypto";

const SESSION_COOKIE = "vault_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function hashPassword(password: string): string {
  const salt = process.env.AUTH_SALT || "vault-default-salt-change-me";
  return crypto.createHmac("sha256", salt).update(password).digest("hex");
}

export function verifyPassword(password: string): boolean {
  const stored = process.env.AUTH_PASSWORD_HASH;
  if (!stored) {
    // Fallback: compare plaintext (dev only — set AUTH_PASSWORD_HASH in prod)
    return password === process.env.AUTH_PASSWORD;
  }
  return hashPassword(password) === stored;
}

export function createSession(userId: string): string {
  const db = getDb();
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = Math.floor((Date.now() + SESSION_TTL_MS) / 1000);

  db.prepare(
    "INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)"
  ).run(token, userId, expiresAt);

  return token;
}

export function getSession(token: string): { userId: string } | null {
  const db = getDb();
  const row = db
    .prepare("SELECT user_id, expires_at FROM sessions WHERE token = ?")
    .get(token) as { user_id: string; expires_at: number } | undefined;

  if (!row) return null;
  if (row.expires_at < Math.floor(Date.now() / 1000)) {
    db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
    return null;
  }

  return { userId: row.user_id };
}

export function deleteSession(token: string): void {
  getDb().prepare("DELETE FROM sessions WHERE token = ?").run(token);
}

/** Server-side: get current session from cookie */
export async function getCurrentSession(): Promise<{ userId: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return getSession(token);
}

export { SESSION_COOKIE };
