import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import { listResponses, getResponse } from "@/lib/responses";

async function isAuthenticated() {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore);
  return session.isAdmin === true;
}

export async function GET(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const filename = searchParams.get("filename");

  if (filename) {
    // Security: prevent path traversal
    if (filename.includes("/") || filename.includes("\\") || filename.includes("..")) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }
    const content = await getResponse(filename);
    if (!content) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ content });
  }

  const responses = await listResponses();
  return NextResponse.json({ responses });
}
