import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { makeStorageKey, presignUpload } from "@/lib/storage";

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { filename, mime_type } = await req.json();
  if (!filename || !mime_type) {
    return NextResponse.json({ error: "filename and mime_type are required" }, { status: 400 });
  }

  const storage_key = makeStorageKey(session.userId, filename);
  const upload_url = await presignUpload(storage_key, mime_type);
  return NextResponse.json({ upload_url, storage_key });
}
