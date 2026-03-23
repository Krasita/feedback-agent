"use client";

import { useState, useRef } from "react";

type Status = "idle" | "loading" | "streaming" | "done" | "error";

/** Very lightweight markdown → JSX renderer for the subset Claude produces */
function renderMarkdown(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      elements.push(
        <h2
          key={key++}
          className="text-lg font-bold text-primary mt-6 mb-2 pb-1 border-b border-primary-soft"
        >
          {line.slice(3)}
        </h2>
      );
      i++;
    } else if (line.startsWith("### ")) {
      elements.push(
        <h3 key={key++} className="text-base font-semibold text-foreground mt-4 mb-1">
          {line.slice(4)}
        </h3>
      );
      i++;
    } else if (/^\d+\.\s/.test(line)) {
      // Numbered list item
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ""));
        i++;
      }
      elements.push(
        <ol key={key++} className="list-decimal list-outside ml-5 space-y-1 my-2">
          {items.map((item, idx) => (
            <li key={idx} className="text-sm text-gray-700 leading-relaxed">
              {item}
            </li>
          ))}
        </ol>
      );
    } else if (line.startsWith("- ") || line.startsWith("• ")) {
      // Bullet list
      const items: string[] = [];
      while (i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("• "))) {
        items.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={key++} className="list-disc list-outside ml-5 space-y-1 my-2">
          {items.map((item, idx) => (
            <li key={idx} className="text-sm text-gray-700 leading-relaxed">
              {item}
            </li>
          ))}
        </ul>
      );
    } else if (line.trim() === "" || line.trim() === "---") {
      i++;
    } else {
      elements.push(
        <p key={key++} className="text-sm text-gray-700 leading-relaxed my-1">
          {line}
        </p>
      );
      i++;
    }
  }

  return elements;
}

export default function SummaryPanel({ responseCount }: { responseCount: number }) {
  const [status, setStatus] = useState<Status>("idle");
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  async function generate() {
    if (status === "loading" || status === "streaming") return;

    setText("");
    setError("");
    setStatus("loading");

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/summary", { signal: abortRef.current.signal });

      if (!res.ok) {
        const body = await res.text();
        let msg = `HTTP ${res.status}`;
        try { msg = (JSON.parse(body) as { error?: string }).error ?? msg; } catch { /* non-JSON body */ }
        throw new Error(msg);
      }

      setStatus("streaming");

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setText((prev) => prev + decoder.decode(value, { stream: true }));
      }

      setStatus("done");
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        setStatus("idle");
        return;
      }
      setError(err instanceof Error ? err.message : String(err));
      setStatus("error");
    }
  }

  function stop() {
    abortRef.current?.abort();
    setStatus("done");
  }

  const isRunning = status === "loading" || status === "streaming";

  return (
    <div className="max-w-3xl animate-scale-in">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">AI Analysis</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Powered by Gemini · {responseCount} response{responseCount !== 1 ? "s" : ""} analysed
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isRunning && (
            <button
              onClick={stop}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Stop
            </button>
          )}
          <button
            onClick={generate}
            disabled={isRunning}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-150 shadow-sm
              ${isRunning
                ? "bg-primary/60 text-white cursor-not-allowed"
                : "bg-primary text-white hover:bg-primary-dark active:scale-95"
              }`}
          >
            {isRunning ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                {status === "loading" ? "Preparing…" : "Analysing…"}
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                {status === "done" ? "Regenerate" : "Generate Analysis"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {status === "error" && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Idle placeholder */}
      {status === "idle" && (
        <div className="bg-primary-pale border border-primary-soft rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-primary-soft rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1A13AF" strokeWidth="1.5">
              <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-sm font-medium text-primary mb-1">Ready to analyse {responseCount} response{responseCount !== 1 ? "s" : ""}</p>
          <p className="text-xs text-primary-muted">Claude will summarise the feedback, identify patterns, and suggest concrete next steps for your training programme.</p>
        </div>
      )}

      {/* Streaming / done content */}
      {(status === "streaming" || status === "done") && text && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <div className="prose-sm">
            {renderMarkdown(text)}
          </div>

          {status === "streaming" && (
            <span className="inline-block w-1.5 h-4 bg-primary rounded-sm ml-1 animate-pulse" />
          )}
        </div>
      )}
    </div>
  );
}
