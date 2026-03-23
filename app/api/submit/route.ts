import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getQuestions } from "@/lib/questions";
import { buildMarkdown, type Answers } from "@/lib/markdown";
import { writeResponse } from "@/lib/responses";
import { getActiveSession } from "@/lib/sessions";

export async function POST(request: NextRequest) {
  try {
    const activeSession = await getActiveSession();
    if (!activeSession) {
      return NextResponse.json(
        { error: "No active session. Please ask the trainer to activate a session." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { answers } = body as { answers: Answers };

    if (!answers || typeof answers !== "object") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const questions = getQuestions();

    for (const q of questions) {
      if (q.required) {
        const a = answers[q.id];
        if (a === null || a === undefined || a === "") {
          return NextResponse.json(
            { error: `Missing required answer for question: ${q.id}` },
            { status: 400 }
          );
        }
      }
    }

    const id = randomUUID().replace(/-/g, "").slice(0, 10);
    const date = new Date();
    const content = buildMarkdown(questions, answers, id, date);

    await writeResponse(activeSession.id, id, date, content);

    return NextResponse.json({ success: true, id });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Submit error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
