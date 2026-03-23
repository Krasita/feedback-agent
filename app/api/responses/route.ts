import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listResponses, getResponse } from "@/lib/responses";

async function isAuthenticated() {
  const session = await getSession();
  return session.isAdmin === true;
}

export async function GET(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const sessionId = searchParams.get("sessionId");
  const filename = searchParams.get("filename");

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
  }

  if (filename) {
    if (filename.includes("/") || filename.includes("\\") || filename.includes("..")) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }
    const content = await getResponse(sessionId, filename);
    if (!content) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ content });
  }

  const responses = await listResponses(sessionId);
  return NextResponse.json({ responses });
}
