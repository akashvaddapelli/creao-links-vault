/**
 * File metadata CRUD — the actual bytes live in R2 (see storage.ts),
 * this table only tracks metadata + the R2 object key.
 * All queries scoped to userId so data is always owner-only.
 */

import { db } from "./db";
import crypto from "node:crypto";
import type { Row } from "@libsql/client";

export interface FileRecord {
  id: string;
  user_id: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  storage_key: string;
  created_at: number;
  updated_at: number;
}

function toFile(row: Row): FileRecord {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    filename: String(row.filename),
    mime_type: String(row.mime_type),
    size_bytes: Number(row.size_bytes),
    storage_key: String(row.storage_key),
    created_at: Number(row.created_at),
    updated_at: Number(row.updated_at),
  };
}

export async function getFiles(userId: string): Promise<FileRecord[]> {
  const client = await db();
  const result = await client.execute({
    sql: "SELECT * FROM files WHERE user_id = ? ORDER BY created_at DESC",
    args: [userId],
  });
  return result.rows.map(toFile);
}

export async function getFileById(id: string, userId: string): Promise<FileRecord | null> {
  const client = await db();
  const result = await client.execute({
    sql: "SELECT * FROM files WHERE id = ? AND user_id = ?",
    args: [id, userId],
  });
  return result.rows[0] ? toFile(result.rows[0]) : null;
}

export async function createFileRecord(
  userId: string,
  data: { filename: string; mime_type: string; size_bytes: number; storage_key: string }
): Promise<FileRecord> {
  const client = await db();
  const id = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);
  await client.execute({
    sql: "INSERT INTO files (id, user_id, filename, mime_type, size_bytes, storage_key, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    args: [id, userId, data.filename, data.mime_type, data.size_bytes, data.storage_key, now, now],
  });
  return (await getFileById(id, userId))!;
}

export async function deleteFileRecord(id: string, userId: string): Promise<boolean> {
  const client = await db();
  const result = await client.execute({
    sql: "DELETE FROM files WHERE id = ? AND user_id = ?",
    args: [id, userId],
  });
  return result.rowsAffected > 0;
}
