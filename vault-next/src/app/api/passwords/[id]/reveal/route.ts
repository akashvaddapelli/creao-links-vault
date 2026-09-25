import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { getPasswordSecret } from "@/lib/passwords";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const secret = await getPasswordSecret(id, session.userId);
  if (secret === null) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ secret });
}
