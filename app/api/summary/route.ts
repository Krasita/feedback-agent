import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getSession } from "@/lib/auth";
import { listResponses, getResponse } from "@/lib/responses";
import { getSessions } from "@/lib/sessions";

export const maxDuration = 120;

const SYSTEM_PROMPT = `You are an expert learning & development analyst. Your job is to analyse post-training feedback and produce an insightful report for trainers.

Structure your response exactly as follows (use these exact markdown headings):

## Executive Summary
2–3 sentences capturing the overall sentiment and quality of the session.

## Key Findings
Bullet points covering the main themes that appear across multiple responses.

## Strengths
What participants specifically praised or rated highly.

## Areas for Improvement
Honest, specific weaknesses or gaps identified in the feedback.

## Actionable Suggestions for Next Steps
Numbered list of concrete, practical actions the training team should take before or during the next session. Be specific — not generic advice.

Write in a professional but direct tone. Reference specific patterns in the data wherever possible.`;

export async function GET(request: NextRequest) {
  const authSession = await getSession();
  if (!authSession.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessionId = request.nextUrl.searchParams.get("sessionId");
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
  }

  // Verify session exists
  const sessions = await getSessions();
  const trainingSession = sessions.find((s) => s.id === sessionId);
  if (!trainingSession) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const responses = await listResponses(sessionId);
  if (responses.length === 0) {
    return NextResponse.json({ error: "No responses to analyse yet for this session." }, { status: 400 });
  }

  const contents = (
    await Promise.all(responses.map((r) => getResponse(sessionId, r.filename)))
  ).filter((c): c is string => !!c);

  if (contents.length === 0) {
    return NextResponse.json({ error: "Could not read response content." }, { status: 500 });
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const prompt = `${SYSTEM_PROMPT}\n\nSession: "${trainingSession.name}"\n\nPlease analyse the following ${contents.length} feedback response(s) and produce a report:\n\n${contents.map((c, i) => `### Response ${i + 1}\n${c}`).join("\n\n---\n\n")}`;

  let result: AsyncIterable<{ text: string }>;
  try {
    result = await ai.models.generateContentStream({
      model: "gemini-2.0-flash-lite",
      contents: prompt,
    }) as AsyncIterable<{ text: string }>;
  } catch (err) {
    let msg = err instanceof Error ? err.message : String(err);
    for (let i = 0; i < 4; i++) {
      try {
        const parsed = JSON.parse(msg);
        const next: unknown = parsed?.error?.message ?? parsed?.message;
        if (typeof next === "string") { msg = next; } else { break; }
      } catch { break; }
    }
    msg = msg.split(/\\n|\n/)[0].trim() || msg;
    if (msg.includes("quota") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("429")) {
      msg = "Gemini free-tier quota exceeded. Please create a new API key at aistudio.google.com/app/apikey linked to a project with billing enabled, or wait and try again.";
    }
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of result) {
          const text = chunk.text;
          if (text) controller.enqueue(encoder.encode(text));
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        controller.enqueue(encoder.encode(`\n\n[Error: ${msg}]`));
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
