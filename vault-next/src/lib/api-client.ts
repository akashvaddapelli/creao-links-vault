/**
 * Client-side typed fetch helpers for the vault API.
 * All requests are same-origin and rely on the httpOnly session cookie.
 */

export interface Link {
  id: string;
  url: string;
  display_name: string;
  created_at: number;
  updated_at: number;
}

export interface Note {
  id: string;
  title: string;
  body: string;
  created_at: number;
  updated_at: number;
}

export interface PasswordEntry {
  id: string;
  label: string;
  username: string;
  notes: string;
  created_at: number;
  updated_at: number;
}

export interface FileRecord {
  id: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  storage_key: string;
  created_at: number;
  updated_at: number;
}

async function req<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export const api = {
  // auth
  checkSession: () => req<{ authenticated: boolean }>("/api/auth/session"),
  login: (password: string) =>
    req<{ ok: true }>("/api/auth/login", { method: "POST", body: JSON.stringify({ password }) }),
  logout: () => req<{ ok: true }>("/api/auth/logout", { method: "POST" }),

  // links
  listLinks: () => req<Link[]>("/api/links"),
  createLink: (data: { url: string; display_name: string }) =>
    req<Link>("/api/links", { method: "POST", body: JSON.stringify(data) }),
  updateLink: (id: string, data: { url: string; display_name: string }) =>
    req<Link>(`/api/links/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteLink: (id: string) => req<{ ok: true }>(`/api/links/${id}`, { method: "DELETE" }),

  // notes
  listNotes: () => req<Note[]>("/api/notes"),
  createNote: (data: { title: string; body: string }) =>
    req<Note>("/api/notes", { method: "POST", body: JSON.stringify(data) }),
  updateNote: (id: string, data: { title: string; body: string }) =>
    req<Note>(`/api/notes/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteNote: (id: string) => req<{ ok: true }>(`/api/notes/${id}`, { method: "DELETE" }),

  // passwords
  listPasswords: () => req<PasswordEntry[]>("/api/passwords"),
  createPassword: (data: { label: string; username: string; secret: string; notes: string }) =>
    req<PasswordEntry>("/api/passwords", { method: "POST", body: JSON.stringify(data) }),
  updatePassword: (
    id: string,
    data: { label: string; username: string; secret: string; notes: string }
  ) => req<PasswordEntry>(`/api/passwords/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deletePassword: (id: string) => req<{ ok: true }>(`/api/passwords/${id}`, { method: "DELETE" }),
  revealPassword: (id: string) => req<{ secret: string }>(`/api/passwords/${id}/reveal`),

  // files
  listFiles: () => req<FileRecord[]>("/api/files"),
  presignUpload: (data: { filename: string; mime_type: string }) =>
    req<{ upload_url: string; storage_key: string }>("/api/files/presign-upload", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  recordFile: (data: { filename: string; mime_type: string; size_bytes: number; storage_key: string }) =>
    req<FileRecord>("/api/files", { method: "POST", body: JSON.stringify(data) }),
  downloadUrl: (id: string) => req<{ download_url: string }>(`/api/files/${id}/download-url`),
  deleteFile: (id: string) => req<{ ok: true }>(`/api/files/${id}`, { method: "DELETE" }),
};

/** Upload a file: presign → PUT bytes to R2 → record metadata. */
export async function uploadFile(file: File): Promise<FileRecord> {
  const mime = file.type || "application/octet-stream";
  const { upload_url, storage_key } = await api.presignUpload({
    filename: file.name,
    mime_type: mime,
  });
  const put = await fetch(upload_url, {
    method: "PUT",
    headers: { "Content-Type": mime },
    body: file,
  });
  if (!put.ok) throw new Error(`Upload to storage failed (${put.status})`);
  return api.recordFile({
    filename: file.name,
    mime_type: mime,
    size_bytes: file.size,
    storage_key,
  });
}
