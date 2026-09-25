/**
 * Visitor email log — stores every email submitted on the access screen.
 * Used for security auditing: knowing who attempted access.
 * Data stays local to the browser (localStorage) until a DataStore sync is wired up.
 */

export interface VisitorEntry {
  id: string;
  email: string;
  timestamp: number;
  userAgent: string;
  timezone: string;
}

const STORAGE_KEY = "vault_visitors_v1";

function generateId(): string {
  return `visitor_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function load(): VisitorEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as VisitorEntry[];
  } catch {
    return [];
  }
}

function save(entries: VisitorEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export const visitorLog = {
  /** Record an email submission. Safe to call multiple times — deduplicates by email+day. */
  record(email: string): VisitorEntry {
    const entries = load();
    const entry: VisitorEntry = {
      id: generateId(),
      email: email.trim().toLowerCase(),
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
    entries.push(entry);
    save(entries);
    return entry;
  },

  getAll(): VisitorEntry[] {
    return load();
  },

  count(): number {
    return load().length;
  },
};
