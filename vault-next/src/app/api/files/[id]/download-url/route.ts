import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { getFileById } from "@/lib/files";
import { presignDownload, isStorageConfigured, STORAGE_NOT_CONFIGURED_MESSAGE } from "@/lib/storage";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isStorageConfigured()) {
    return NextResponse.json({ error: STORAGE_NOT_CONFIGURED_MESSAGE }, { status: 503 });
  }

  const { id } = await params;
  const file = await getFileById(id, session.userId);
  if (!file) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const download_url = await presignDownload(file.storage_key, file.filename);
  return NextResponse.json({ download_url });
}
