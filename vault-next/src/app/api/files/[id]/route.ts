import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { getFileById, deleteFileRecord } from "@/lib/files";
import { deleteObject } from "@/lib/storage";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const file = await getFileById(id, session.userId);
  if (!file) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await deleteObject(file.storage_key);
  await deleteFileRecord(id, session.userId);
  return NextResponse.json({ ok: true });
}
