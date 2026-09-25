/**
 * Object storage — Cloudflare R2 via the S3-compatible API.
 * Files are uploaded/downloaded directly between the browser and R2 using
 * short-lived presigned URLs, so file bytes never pass through the
 * Next.js server (avoids serverless body-size and timeout limits).
 */

import { S3Client, DeleteObjectCommand, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "node:crypto";

const UPLOAD_URL_TTL_S = 5 * 60; // 5 minutes to start the upload
const DOWNLOAD_URL_TTL_S = 5 * 60; // 5 minutes to fetch

let _client: S3Client | null = null;

function getClient(): S3Client {
  if (!_client) {
    const accountId = requireEnv("R2_ACCOUNT_ID");
    _client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
        secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
      },
    });
  }
  return _client;
}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set — R2 storage is not configured`);
  return v;
}

function bucket(): string {
  return requireEnv("R2_BUCKET_NAME");
}

/** Generate a unique, user-scoped object key for a new upload. */
export function makeStorageKey(userId: string, filename: string): string {
  const safe = filename.replace(/[^\w.\-]+/g, "_").slice(0, 120);
  return `${userId}/${crypto.randomUUID()}-${safe}`;
}

export async function presignUpload(storageKey: string, mimeType: string): Promise<string> {
  const cmd = new PutObjectCommand({
    Bucket: bucket(),
    Key: storageKey,
    ContentType: mimeType,
  });
  return getSignedUrl(getClient(), cmd, { expiresIn: UPLOAD_URL_TTL_S });
}

export async function presignDownload(storageKey: string, filename: string): Promise<string> {
  const cmd = new GetObjectCommand({
    Bucket: bucket(),
    Key: storageKey,
    ResponseContentDisposition: `attachment; filename="${filename.replace(/"/g, "")}"`,
  });
  return getSignedUrl(getClient(), cmd, { expiresIn: DOWNLOAD_URL_TTL_S });
}

export async function deleteObject(storageKey: string): Promise<void> {
  await getClient().send(new DeleteObjectCommand({ Bucket: bucket(), Key: storageKey }));
}
