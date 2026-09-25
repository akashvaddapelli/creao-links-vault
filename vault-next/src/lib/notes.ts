/**
 * Note CRUD — all queries scoped to userId so data is always owner-only.
 */

import { db } from "./db";
import crypto from "node:crypto";
import type { Row } from "@libsql/client";

export interface Note {
  id: string;
  user_id: string;
  title: string;
  body: string;
  created_at: number;
  updated_at: number;
}

function toNote(row: Row): Note {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    title: String(row.title),
    body: String(row.body),
    created_at: Number(row.created_at),
    updated_at: Number(row.updated_at),
  };
}

export async function getNotes(userId: string): Promise<Note[]> {
  const client = await db();
  const result = await client.execute({
    sql: "SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC",
    args: [userId],
  });
  return result.rows.map(toNote);
}

export async function getNoteById(id: string, userId: string): Promise<Note | null> {
  const client = await db();
  const result = await client.execute({
    sql: "SELECT * FROM notes WHERE id = ? AND user_id = ?",
    args: [id, userId],
  });
  return result.rows[0] ? toNote(result.rows[0]) : null;
}

export async function createNote(
  userId: string,
  data: { title: string; body: string }
): Promise<Note> {
  const client = await db();
  const id = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);
  await client.execute({
    sql: "INSERT INTO notes (id, user_id, title, body, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
    args: [id, userId, data.title, data.body, now, now],
  });
  return (await getNoteById(id, userId))!;
}

export async function updateNote(
  id: string,
  userId: string,
  data: { title: string; body: string }
): Promise<Note | null> {
  const client = await db();
  const now = Math.floor(Date.now() / 1000);
  const result = await client.execute({
    sql: "UPDATE notes SET title = ?, body = ?, updated_at = ? WHERE id = ? AND user_id = ?",
    args: [data.title, data.body, now, id, userId],
  });
  if (result.rowsAffected === 0) return null;
  return getNoteById(id, userId);
}

export async function deleteNote(id: string, userId: string): Promise<boolean> {
  const client = await db();
  const result = await client.execute({
    sql: "DELETE FROM notes WHERE id = ? AND user_id = ?",
    args: [id, userId],
  });
  return result.rowsAffected > 0;
}
