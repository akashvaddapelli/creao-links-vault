import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { getLinks, createLink } from "@/lib/links";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const links = getLinks(session.userId);
  return NextResponse.json(links);
}

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { url, display_name } = await req.json();
  if (!url || !display_name) {
    return NextResponse.json({ error: "url and display_name are required" }, { status: 400 });
  }

  const link = createLink(session.userId, { url, display_name });
  return NextResponse.json(link, { status: 201 });
}
