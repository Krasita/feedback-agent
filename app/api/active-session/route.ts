import { NextResponse } from "next/server";
import { getActiveSession } from "@/lib/sessions";

/** Public endpoint — returns the currently active session (for the feedback form) */
export async function GET() {
  const session = await getActiveSession();
  return NextResponse.json({ session });
}
