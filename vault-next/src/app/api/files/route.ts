import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { getFiles, createFileRecord } from "@/lib/files";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const files = await getFiles(session.userId);
  return NextResponse.json(files);
}

// Record metadata after the browser has uploaded the bytes directly to R2.
export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { filename, mime_type, size_bytes, storage_key } = await req.json();
  if (!filename || !mime_type || !storage_key || typeof size_bytes !== "number") {
    return NextResponse.json(
      { error: "filename, mime_type, size_bytes and storage_key are required" },
      { status: 400 }
    );
  }

  // Guard: storage_key must belong to this user's namespace (set at presign time).
  if (!storage_key.startsWith(`${session.userId}/`)) {
    return NextResponse.json({ error: "Invalid storage_key" }, { status: 400 });
  }

  const record = await createFileRecord(session.userId, {
    filename,
    mime_type,
    size_bytes,
    storage_key,
  });
  return NextResponse.json(record, { status: 201 });
}
