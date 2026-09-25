# Vault

A single-owner personal vault — store links, notes, passwords, and files, and
reach them from any device, anywhere. Built on Next.js with a libSQL/Turso
database and Cloudflare R2 for file storage.

## How it's designed

- **Disguised entry.** The landing page looks like a generic "Application error"
  crash. Nobody who lands on it sees a login. Typing your secret unlock phrase
  anywhere on the page reveals a plain password field. A wrong password silently
  reverts to the fake-broken screen — no error, no hint that anything is there.
  This is obfuscation, not the security boundary: the real gate is the
  server-verified password.
- **Password-only auth.** No magic link, no email dependency — so a dead phone or
  locked inbox never blocks access. The password is checked server-side; a session
  cookie (httpOnly) keeps you logged in for 7 days.
- **Encrypted password vault.** Stored password secrets are AES-256-GCM encrypted
  at rest with a key derived from your master password. A leaked database file
  alone can't reveal them. (Labels and usernames are stored in the clear so the
  list is searchable.)
- **Files never touch the server.** Uploads/downloads go directly between your
  browser and R2 via short-lived presigned URLs, so file size isn't limited by
  serverless request limits.

## Local development

```bash
cp .env.local.example .env.local   # then edit the values
npm install
npm run dev
```

With `TURSO_DATABASE_URL` unset, the app falls back to a local SQLite file at
`./data/vault.db` — no external services needed to try it. File upload still
needs R2 credentials to work; everything else (links, notes, passwords) works
fully offline.

Open http://localhost:3000, type your `NEXT_PUBLIC_UNLOCK_PHRASE`, then your
`AUTH_PASSWORD`.

## Deploying (free tier, always-on, no card)

1. **Turso** (database): create a free database, copy its URL + auth token into
   `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN`.
2. **Cloudflare R2** (files): create a bucket and an S3-API token; fill in
   `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`.
   Add a CORS rule on the bucket allowing `PUT` and `GET` from your Vercel domain.
3. **Vercel** (hosting): import the repo, set all the env vars from
   `.env.local.example` in the project settings, and deploy.

## Important limitations

- **Changing `AUTH_PASSWORD` breaks existing password entries.** The vault
  encryption key is derived from `AUTH_PASSWORD` + `VAULT_KEY_SALT`. If you change
  either after entries exist, those entries can no longer be decrypted. There is
  no in-app password-change flow because `AUTH_PASSWORD` lives in the host's env
  vars, which the app can't rewrite. Pick your password and salt before storing
  real secrets.
- **Single owner.** Everything is scoped to one hardcoded owner id. There is no
  multi-user support by design.
