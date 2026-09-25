"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api-client";
import Dashboard from "@/components/Dashboard";

// The unlock phrase is public-ish by nature (it only reveals a password
// field — the real security boundary is the server-verified password).
const UNLOCK_PHRASE = (process.env.NEXT_PUBLIC_UNLOCK_PHRASE || "").toLowerCase();

type View = "loading" | "broken" | "password" | "dashboard";

export default function Page() {
  const [view, setView] = useState<View>("loading");

  // Check for an existing session on load.
  useEffect(() => {
    let alive = true;
    api
      .checkSession()
      .then(({ authenticated }) => {
        if (alive) setView(authenticated ? "dashboard" : "broken");
      })
      .catch(() => {
        if (alive) setView("broken");
      });
    return () => {
      alive = false;
    };
  }, []);

  if (view === "loading" || view === "broken") {
    return <BrokenScreen active={view === "broken"} onUnlock={() => setView("password")} />;
  }
  if (view === "password") {
    return (
      <PasswordScreen
        onSuccess={() => setView("dashboard")}
        onFail={() => setView("broken")}
      />
    );
  }
  return <Dashboard onLogout={() => { api.logout().finally(() => setView("broken")); }} />;
}

/**
 * Disguise screen. Looks like a genuine Next.js production crash so a
 * random visitor assumes the deployment is simply broken. When `active`,
 * it listens for the unlock phrase typed anywhere on the page.
 */
function BrokenScreen({ active, onUnlock }: { active: boolean; onUnlock: () => void }) {
  const buffer = useRef("");

  const handler = useCallback(
    (e: KeyboardEvent) => {
      if (!UNLOCK_PHRASE) return;
      if (e.key.length === 1) {
        buffer.current = (buffer.current + e.key).toLowerCase().slice(-UNLOCK_PHRASE.length);
        if (buffer.current === UNLOCK_PHRASE) {
          buffer.current = "";
          onUnlock();
        }
      }
    },
    [onUnlock]
  );

  useEffect(() => {
    if (!active) return;
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [active, handler]);

  return (
    <div
      style={{
        fontFamily:
          'system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#000",
        background: "#fff",
        textAlign: "center",
        padding: "0 16px",
      }}
    >
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Application error</h1>
        <p style={{ fontSize: 14, color: "#666", marginTop: 8 }}>
          a client-side exception has occurred (see the browser console for more information).
        </p>
      </div>
    </div>
  );
}

/**
 * Password entry. Deliberately plain — no "Sign in" branding. A wrong
 * password reverts to the broken screen with no distinguishing feedback.
 */
function PasswordScreen({ onSuccess, onFail }: { onSuccess: () => void; onFail: () => void }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      await api.login(password);
      onSuccess();
    } catch {
      // No error signal — indistinguishable from an untriggered visitor.
      onFail();
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#fff",
        padding: "0 16px",
      }}
    >
      <form onSubmit={submit} style={{ width: "100%", maxWidth: 320 }}>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 12px",
            fontSize: 14,
            border: "1px solid #ddd",
            borderRadius: 8,
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </form>
    </div>
  );
}
