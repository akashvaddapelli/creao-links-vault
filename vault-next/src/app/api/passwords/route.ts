import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { getPasswordEntries, createPasswordEntry } from "@/lib/passwords";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const entries = await getPasswordEntries(session.userId);
  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { label, username, secret, notes } = await req.json();
  if (!label || !secret) {
    return NextResponse.json({ error: "label and secret are required" }, { status: 400 });
  }

  const entry = await createPasswordEntry(session.userId, {
    label,
    username: username ?? "",
    secret,
    notes: notes ?? "",
  });
  return NextResponse.json(entry, { status: 201 });
}
