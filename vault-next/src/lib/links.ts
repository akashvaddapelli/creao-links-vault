/**
 * Link CRUD — all queries scoped to userId so data is always owner-only.
 */

import { db } from "./db";
import crypto from "node:crypto";
import type { Row } from "@libsql/client";

export interface Link {
  id: string;
  user_id: string;
  url: string;
  display_name: string;
  created_at: number;
  updated_at: number;
}

function toLink(row: Row): Link {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    url: String(row.url),
    display_name: String(row.display_name),
    created_at: Number(row.created_at),
    updated_at: Number(row.updated_at),
  };
}

export async function getLinks(userId: string): Promise<Link[]> {
  const client = await db();
  const result = await client.execute({
    sql: "SELECT * FROM links WHERE user_id = ? ORDER BY created_at DESC",
    args: [userId],
  });
  return result.rows.map(toLink);
}

export async function getLinkById(id: string, userId: string): Promise<Link | null> {
  const client = await db();
  const result = await client.execute({
    sql: "SELECT * FROM links WHERE id = ? AND user_id = ?",
    args: [id, userId],
  });
  return result.rows[0] ? toLink(result.rows[0]) : null;
}

export async function createLink(
  userId: string,
  data: { url: string; display_name: string }
): Promise<Link> {
  const client = await db();
  const id = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);
  await client.execute({
    sql: "INSERT INTO links (id, user_id, url, display_name, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
    args: [id, userId, data.url, data.display_name, now, now],
  });
  return (await getLinkById(id, userId))!;
}

export async function updateLink(
  id: string,
  userId: string,
  data: { url: string; display_name: string }
): Promise<Link | null> {
  const client = await db();
  const now = Math.floor(Date.now() / 1000);
  const result = await client.execute({
    sql: "UPDATE links SET url = ?, display_name = ?, updated_at = ? WHERE id = ? AND user_id = ?",
    args: [data.url, data.display_name, now, id, userId],
  });
  if (result.rowsAffected === 0) return null;
  return getLinkById(id, userId);
}

export async function deleteLink(id: string, userId: string): Promise<boolean> {
  const client = await db();
  const result = await client.execute({
    sql: "DELETE FROM links WHERE id = ? AND user_id = ?",
    args: [id, userId],
  });
  return result.rowsAffected > 0;
}
