/**
 * Vault secret encryption — AES-256-GCM with a key derived from the
 * master password (AUTH_PASSWORD). The key is computed on demand and
 * never persisted, so a leaked database file alone cannot reveal stored
 * passwords without also knowing AUTH_PASSWORD.
 *
 * NOTE: rotating AUTH_PASSWORD without re-encrypting existing rows will
 * make previously stored secrets undecryptable. See change-password route.
 */

import crypto from "node:crypto";

export interface EncryptedPayload {
  ciphertext: string; // base64
  iv: string; // base64
  authTag: string; // base64
}

function deriveVaultKey(): Buffer {
  const password = process.env.AUTH_PASSWORD;
  const salt = process.env.VAULT_KEY_SALT;
  if (!password) throw new Error("AUTH_PASSWORD is not set — cannot derive vault key");
  if (!salt) throw new Error("VAULT_KEY_SALT is not set — cannot derive vault key");
  return crypto.scryptSync(password, salt, 32);
}

export function encryptSecret(plaintext: string): EncryptedPayload {
  const key = deriveVaultKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    ciphertext: ciphertext.toString("base64"),
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
  };
}

export function decryptSecret(payload: EncryptedPayload): string {
  const key = deriveVaultKey();
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(payload.iv, "base64")
  );
  decipher.setAuthTag(Buffer.from(payload.authTag, "base64"));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(payload.ciphertext, "base64")),
    decipher.final(),
  ]);
  return plaintext.toString("utf8");
}
