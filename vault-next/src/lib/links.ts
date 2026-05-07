/**
 * Link CRUD — all queries scoped to userId so data is always owner-only.
 */

import { getDb } from "./db";
import crypto from "node:crypto";

export interface Link {
  id: string;
  user_id: string;
  url: string;
  display_name: string;
  created_at: number;
  updated_at: number;
}

export function getLinks(userId: string): Link[] {
  return getDb()
    .prepare("SELECT * FROM links WHERE user_id = ? ORDER BY created_at DESC")
    .all(userId) as Link[];
}

export function getLinkById(id: string, userId: string): Link | null {
  return (
    (getDb()
      .prepare("SELECT * FROM links WHERE id = ? AND user_id = ?")
      .get(id, userId) as Link | undefined) ?? null
  );
}

export function createLink(
  userId: string,
  data: { url: string; display_name: string }
): Link {
  const id = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);
  getDb()
    .prepare(
      "INSERT INTO links (id, user_id, url, display_name, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .run(id, userId, data.url, data.display_name, now, now);
  return getLinkById(id, userId)!;
}

export function updateLink(
  id: string,
  userId: string,
  data: { url: string; display_name: string }
): Link | null {
  const now = Math.floor(Date.now() / 1000);
  const result = getDb()
    .prepare(
      "UPDATE links SET url = ?, display_name = ?, updated_at = ? WHERE id = ? AND user_id = ?"
    )
    .run(data.url, data.display_name, now, id, userId);
  if (result.changes === 0) return null;
  return getLinkById(id, userId);
}

export function deleteLink(id: string, userId: string): boolean {
  const result = getDb()
    .prepare("DELETE FROM links WHERE id = ? AND user_id = ?")
    .run(id, userId);
  return result.changes > 0;
}
