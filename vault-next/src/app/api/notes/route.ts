import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { getNotes, createNote } from "@/lib/notes";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const notes = await getNotes(session.userId);
  return NextResponse.json(notes);
}

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, body } = await req.json();
  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const note = await createNote(session.userId, { title, body: body ?? "" });
  return NextResponse.json(note, { status: 201 });
}
