import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  getSessions,
  createSession,
  setActiveSession,
} from "@/lib/sessions";

async function isAdmin() {
  const session = await getSession();
  return session.isAdmin === true;
}

/** List all sessions */
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sessions = await getSessions();
  return NextResponse.json({ sessions });
}

/** Create a new session: { name } */
export async function POST(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name } = await request.json() as { name: string };
  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  const session = await createSession(name);
  return NextResponse.json({ session });
}

/** Set active session: { id } */
export async function PATCH(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await request.json() as { id: string };
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  await setActiveSession(id);
  return NextResponse.json({ success: true });
}
