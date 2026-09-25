"use client";

import { useEffect, useRef, useState } from "react";
import {
  api,
  uploadFile,
  type Link,
  type Note,
  type PasswordEntry,
  type FileRecord,
} from "@/lib/api-client";

type Tab = "links" | "notes" | "passwords" | "files";

export default function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>("files");

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 px-4 py-3 flex items-center justify-between sticky top-0 bg-zinc-950/90 backdrop-blur z-10">
        <h1 className="text-lg font-semibold tracking-tight">Vault</h1>
        <button
          onClick={onLogout}
          className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          Lock
        </button>
      </header>

      <nav className="flex gap-1 px-4 pt-4 flex-wrap">
        {(["files", "notes", "passwords", "links"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              tab === t ? "bg-zinc-100 text-zinc-900" : "bg-zinc-900 text-zinc-400 hover:text-zinc-100"
            }`}
          >
            {t}
          </button>
        ))}
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {tab === "links" && <LinksSection />}
        {tab === "notes" && <NotesSection />}
        {tab === "passwords" && <PasswordsSection />}
        {tab === "files" && <FilesSection />}
      </main>
    </div>
  );
}

function useList<T>(loader: () => Promise<T[]>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await loader());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    reload();
  }, []);

  return { items, setItems, loading, error, reload };
}

const inputCls =
  "w-full rounded-lg bg-zinc-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-600 placeholder:text-zinc-600";
const btnCls =
  "rounded-lg bg-zinc-100 text-zinc-900 px-4 py-2 text-sm font-medium hover:bg-white disabled:opacity-50 transition-colors";
const cardCls = "rounded-xl bg-zinc-900 p-4 flex flex-col gap-2";

function SectionShell({
  children,
  loading,
  error,
  empty,
  emptyText,
}: {
  children: React.ReactNode;
  loading: boolean;
  error: string | null;
  empty: boolean;
  emptyText: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      {children}
      {loading && <p className="text-sm text-zinc-500">Loading…</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}
      {!loading && !error && empty && <p className="text-sm text-zinc-500">{emptyText}</p>}
    </div>
  );
}

/* ---------- Links ---------- */
function LinksSection() {
  const { items, loading, error, reload } = useList<Link>(api.listLinks);
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !name) return;
    setBusy(true);
    try {
      await api.createLink({ url, display_name: name });
      setUrl("");
      setName("");
      await reload();
    } finally {
      setBusy(false);
    }
  };

  return (
    <SectionShell loading={loading} error={error} empty={items.length === 0} emptyText="No links yet.">
      <form onSubmit={add} className="flex flex-col gap-2 sm:flex-row">
        <input className={inputCls} placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className={inputCls} placeholder="https://…" value={url} onChange={(e) => setUrl(e.target.value)} />
        <button className={btnCls} disabled={busy}>Add</button>
      </form>
      {items.map((l) => (
        <div key={l.id} className={cardCls}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <a href={l.url} target="_blank" rel="noreferrer" className="font-medium hover:underline break-words">
                {l.display_name}
              </a>
              <p className="text-xs text-zinc-500 break-all">{l.url}</p>
            </div>
            <button onClick={() => api.deleteLink(l.id).then(reload)} className="text-xs text-zinc-500 hover:text-red-400">
              Delete
            </button>
          </div>
        </div>
      ))}
    </SectionShell>
  );
}

/* ---------- Notes ---------- */
function NotesSection() {
  const { items, loading, error, reload } = useList<Note>(api.listNotes);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    setBusy(true);
    try {
      await api.createNote({ title, body });
      setTitle("");
      setBody("");
      await reload();
    } finally {
      setBusy(false);
    }
  };

  return (
    <SectionShell loading={loading} error={error} empty={items.length === 0} emptyText="No notes yet.">
      <form onSubmit={add} className="flex flex-col gap-2">
        <input className={inputCls} placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className={`${inputCls} min-h-24 resize-y`} placeholder="Write…" value={body} onChange={(e) => setBody(e.target.value)} />
        <button className={`${btnCls} self-start`} disabled={busy}>Add note</button>
      </form>
      {items.map((n) => (
        <div key={n.id} className={cardCls}>
          <div className="flex items-start justify-between gap-3">
            <p className="font-medium">{n.title}</p>
            <button onClick={() => api.deleteNote(n.id).then(reload)} className="text-xs text-zinc-500 hover:text-red-400">
              Delete
            </button>
          </div>
          {n.body && <p className="text-sm text-zinc-400 whitespace-pre-wrap">{n.body}</p>}
        </div>
      ))}
    </SectionShell>
  );
}

/* ---------- Passwords ---------- */
function PasswordsSection() {
  const { items, loading, error, reload } = useList<PasswordEntry>(api.listPasswords);
  const [label, setLabel] = useState("");
  const [username, setUsername] = useState("");
  const [secret, setSecret] = useState("");
  const [busy, setBusy] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, string>>({});

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label || !secret) return;
    setBusy(true);
    try {
      await api.createPassword({ label, username, secret, notes: "" });
      setLabel("");
      setUsername("");
      setSecret("");
      await reload();
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (id: string) => {
    if (revealed[id] !== undefined) {
      setRevealed((r) => {
        const next = { ...r };
        delete next[id];
        return next;
      });
      return;
    }
    const { secret } = await api.revealPassword(id);
    setRevealed((r) => ({ ...r, [id]: secret }));
  };

  return (
    <SectionShell loading={loading} error={error} empty={items.length === 0} emptyText="No passwords yet.">
      <form onSubmit={add} className="flex flex-col gap-2">
        <input className={inputCls} placeholder="Label (e.g. Gmail)" value={label} onChange={(e) => setLabel(e.target.value)} />
        <input className={inputCls} placeholder="Username / email" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input className={inputCls} type="password" placeholder="Secret" value={secret} onChange={(e) => setSecret(e.target.value)} />
        <button className={`${btnCls} self-start`} disabled={busy}>Add password</button>
      </form>
      {items.map((p) => (
        <div key={p.id} className={cardCls}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medium">{p.label}</p>
              {p.username && <p className="text-xs text-zinc-500 break-all">{p.username}</p>}
            </div>
            <button onClick={() => api.deletePassword(p.id).then(reload)} className="text-xs text-zinc-500 hover:text-red-400">
              Delete
            </button>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm font-mono text-zinc-300">
              {revealed[p.id] !== undefined ? revealed[p.id] : "••••••••••"}
            </code>
            <button onClick={() => toggle(p.id)} className="text-xs text-zinc-400 hover:text-zinc-100">
              {revealed[p.id] !== undefined ? "Hide" : "Reveal"}
            </button>
            {revealed[p.id] !== undefined && (
              <button
                onClick={() => navigator.clipboard?.writeText(revealed[p.id])}
                className="text-xs text-zinc-400 hover:text-zinc-100"
              >
                Copy
              </button>
            )}
          </div>
        </div>
      ))}
    </SectionShell>
  );
}

/* ---------- Files ---------- */
function FilesSection() {
  const { items, loading, error, reload } = useList<FileRecord>(api.listFiles);
  const [busy, setBusy] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setUploadError(null);
    try {
      await uploadFile(file);
      await reload();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const download = async (id: string) => {
    const { download_url } = await api.downloadUrl(id);
    window.open(download_url, "_blank");
  };

  return (
    <SectionShell loading={loading} error={error} empty={items.length === 0} emptyText="No files yet.">
      <div className="flex items-center gap-3">
        <input ref={fileRef} type="file" onChange={onPick} className="hidden" id="file-upload" />
        <label htmlFor="file-upload" className={`${btnCls} cursor-pointer`}>
          {busy ? "Uploading…" : "Upload file"}
        </label>
      </div>
      {uploadError && <p className="text-sm text-red-400">{uploadError}</p>}
      {items.map((f) => (
        <div key={f.id} className={cardCls}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medium break-all">{f.filename}</p>
              <p className="text-xs text-zinc-500">
                {f.mime_type} · {formatBytes(f.size_bytes)}
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <button onClick={() => download(f.id)} className="text-xs text-zinc-400 hover:text-zinc-100">
                Download
              </button>
              <button onClick={() => api.deleteFile(f.id).then(reload)} className="text-xs text-zinc-500 hover:text-red-400">
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </SectionShell>
  );
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
