import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { getQuestions } from "@/lib/questions";
import { buildMarkdown, type Answers } from "@/lib/markdown";
import { writeResponse } from "@/lib/responses";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { answers } = body as { answers: Answers };

    if (!answers || typeof answers !== "object") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const questions = getQuestions();

    // Validate required fields
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

    const id = nanoid(10);
    const date = new Date();
    const content = buildMarkdown(questions, answers, id, date);

    await writeResponse(id, date, content);

    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("Submit error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
