/**
 * Magic Link Authentication
 * Single-owner: only VITE_ALLOWED_EMAIL can request a magic link.
 * Tokens are stored in localStorage with a 15-minute expiry.
 */

const ALLOWED_EMAIL = "vaddapelliakash862@gmail.com";
const TOKEN_KEY = "vault_magic_token";
const TOKEN_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes

interface MagicToken {
  token: string;
  email: string;
  expiresAt: number;
  used: boolean;
}

function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function isAllowedEmail(email: string): boolean {
  return email.trim().toLowerCase() === ALLOWED_EMAIL.toLowerCase();
}

export function createMagicToken(email: string): string | null {
  if (!isAllowedEmail(email)) return null;

  const token = generateToken();
  const record: MagicToken = {
    token,
    email,
    expiresAt: Date.now() + TOKEN_EXPIRY_MS,
    used: false,
  };
  localStorage.setItem(TOKEN_KEY, JSON.stringify(record));
  return token;
}

export function verifyMagicToken(token: string): boolean {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return false;

    const record: MagicToken = JSON.parse(raw);

    if (record.used) return false;
    if (record.token !== token) return false;
    if (Date.now() > record.expiresAt) {
      localStorage.removeItem(TOKEN_KEY);
      return false;
    }

    // Mark as used (single-use)
    record.used = true;
    localStorage.setItem(TOKEN_KEY, JSON.stringify(record));
    return true;
  } catch {
    return false;
  }
}

export function clearMagicToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function hasPendingToken(): boolean {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return false;
    const record: MagicToken = JSON.parse(raw);
    return !record.used && Date.now() < record.expiresAt;
  } catch {
    return false;
  }
}

/**
 * Send magic link email via EmailJS.
 * Requires VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, VITE_EMAILJS_PUBLIC_KEY in .env
 */
export async function sendMagicLinkEmail(email: string, token: string): Promise<void> {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  if (!serviceId || !templateId || !publicKey) {
    throw new Error("EmailJS environment variables are not configured.");
  }

  const magicUrl = `${window.location.origin}${window.location.pathname}?magic_token=${token}`;

  const payload = {
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey,
    template_params: {
      to_email: email,
      magic_link: magicUrl,
      expires_in: "15 minutes",
    },
  };

  const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("EmailJS error:", res.status, body);
    throw new Error(`EmailJS error ${res.status}: ${body || "Check your service/template/key values."}`);
  }
}
