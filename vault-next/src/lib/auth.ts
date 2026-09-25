/**
 * Authentication — session-based, no third-party auth service.
 * Single owner: credentials stored in environment variables.
 * Sessions stored in the database, token in an httpOnly cookie.
 */

import { db } from "./db";
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
    const expected = process.env.AUTH_PASSWORD;
    if (!expected) return false;
    return timingSafeEqualStr(password, expected);
  }
  return timingSafeEqualStr(hashPassword(password), stored);
}

function timingSafeEqualStr(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export async function createSession(userId: string): Promise<string> {
  const client = await db();
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = Math.floor((Date.now() + SESSION_TTL_MS) / 1000);

  await client.execute({
    sql: "INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)",
    args: [token, userId, expiresAt],
  });

  return token;
}

export async function getSession(token: string): Promise<{ userId: string } | null> {
  const client = await db();
  const result = await client.execute({
    sql: "SELECT user_id, expires_at FROM sessions WHERE token = ?",
    args: [token],
  });

  const row = result.rows[0];
  if (!row) return null;

  const expiresAt = Number(row.expires_at);
  if (expiresAt < Math.floor(Date.now() / 1000)) {
    await client.execute({ sql: "DELETE FROM sessions WHERE token = ?", args: [token] });
    return null;
  }

  return { userId: String(row.user_id) };
}

export async function deleteSession(token: string): Promise<void> {
  const client = await db();
  await client.execute({ sql: "DELETE FROM sessions WHERE token = ?", args: [token] });
}

/** Server-side: get current session from cookie */
export async function getCurrentSession(): Promise<{ userId: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return getSession(token);
}

export { SESSION_COOKIE };
