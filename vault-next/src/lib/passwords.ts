/**
 * Password entry CRUD — secrets are AES-256-GCM encrypted at rest.
 * All queries scoped to userId so data is always owner-only.
 * The decrypted secret is only ever returned by getPasswordSecret().
 */

import { db } from "./db";
import { encryptSecret, decryptSecret } from "./crypto";
import crypto from "node:crypto";
import type { Row } from "@libsql/client";

/** Metadata safe to list — never includes the decrypted secret. */
export interface PasswordEntry {
  id: string;
  user_id: string;
  label: string;
  username: string;
  notes: string;
  created_at: number;
  updated_at: number;
}

function toEntry(row: Row): PasswordEntry {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    label: String(row.label),
    username: String(row.username),
    notes: String(row.notes),
    created_at: Number(row.created_at),
    updated_at: Number(row.updated_at),
  };
}

export async function getPasswordEntries(userId: string): Promise<PasswordEntry[]> {
  const client = await db();
  const result = await client.execute({
    sql: "SELECT id, user_id, label, username, notes, created_at, updated_at FROM password_entries WHERE user_id = ? ORDER BY label COLLATE NOCASE ASC",
    args: [userId],
  });
  return result.rows.map(toEntry);
}

export async function getPasswordEntryById(
  id: string,
  userId: string
): Promise<PasswordEntry | null> {
  const client = await db();
  const result = await client.execute({
    sql: "SELECT id, user_id, label, username, notes, created_at, updated_at FROM password_entries WHERE id = ? AND user_id = ?",
    args: [id, userId],
  });
  return result.rows[0] ? toEntry(result.rows[0]) : null;
}

/** Returns the decrypted secret for a single entry, or null if not found. */
export async function getPasswordSecret(id: string, userId: string): Promise<string | null> {
  const client = await db();
  const result = await client.execute({
    sql: "SELECT encrypted_secret, iv, auth_tag FROM password_entries WHERE id = ? AND user_id = ?",
    args: [id, userId],
  });
  const row = result.rows[0];
  if (!row) return null;
  return decryptSecret({
    ciphertext: String(row.encrypted_secret),
    iv: String(row.iv),
    authTag: String(row.auth_tag),
  });
}

export async function createPasswordEntry(
  userId: string,
  data: { label: string; username: string; secret: string; notes: string }
): Promise<PasswordEntry> {
  const client = await db();
  const id = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);
  const enc = encryptSecret(data.secret);
  await client.execute({
    sql: "INSERT INTO password_entries (id, user_id, label, username, encrypted_secret, iv, auth_tag, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    args: [id, userId, data.label, data.username, enc.ciphertext, enc.iv, enc.authTag, data.notes, now, now],
  });
  return (await getPasswordEntryById(id, userId))!;
}

export async function updatePasswordEntry(
  id: string,
  userId: string,
  data: { label: string; username: string; secret: string; notes: string }
): Promise<PasswordEntry | null> {
  const client = await db();
  const now = Math.floor(Date.now() / 1000);
  const enc = encryptSecret(data.secret);
  const result = await client.execute({
    sql: "UPDATE password_entries SET label = ?, username = ?, encrypted_secret = ?, iv = ?, auth_tag = ?, notes = ?, updated_at = ? WHERE id = ? AND user_id = ?",
    args: [data.label, data.username, enc.ciphertext, enc.iv, enc.authTag, data.notes, now, id, userId],
  });
  if (result.rowsAffected === 0) return null;
  return getPasswordEntryById(id, userId);
}

export async function deletePasswordEntry(id: string, userId: string): Promise<boolean> {
  const client = await db();
  const result = await client.execute({
    sql: "DELETE FROM password_entries WHERE id = ? AND user_id = ?",
    args: [id, userId],
  });
  return result.rowsAffected > 0;
}
