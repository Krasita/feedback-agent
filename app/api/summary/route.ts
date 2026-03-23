import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSession } from "@/lib/auth";
import { listResponses, getResponse } from "@/lib/responses";

export const maxDuration = 120;

export async function GET() {
  const session = await getSession();
  if (!session.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const responses = await listResponses();
  if (responses.length === 0) {
    return NextResponse.json({ error: "No responses to analyse yet." }, { status: 400 });
  }

  // Fetch full markdown content of every response
  const contents = (
    await Promise.all(responses.map((r) => getResponse(r.filename)))
  ).filter((c): c is string => !!c);

  if (contents.length === 0) {
    return NextResponse.json({ error: "Could not read response content." }, { status: 500 });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const stream = client.messages.stream({
    model: "claude-opus-4-6",
    max_tokens: 4000,
    thinking: { type: "adaptive" },
    system: `You are an expert learning & development analyst. Your job is to analyse post-training feedback and produce an insightful report for trainers.

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

Write in a professional but direct tone. Reference specific patterns in the data wherever possible.`,
    messages: [
      {
        role: "user",
        content: `Please analyse the following ${contents.length} feedback response(s) from our training session and produce a report:\n\n${contents.map((c, i) => `### Response ${i + 1}\n${c}`).join("\n\n---\n\n")}`,
      },
    ],
  });

  // Stream only text deltas (skip thinking blocks)
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
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
