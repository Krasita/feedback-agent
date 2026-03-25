"use client";

import { useState, useEffect } from "react";

interface ResponseDetailProps {
  sessionId: string;
  filename: string | null;
  onDeleted?: (filename: string) => void;
}

function renderMarkdownSection(content: string) {
  const withoutFront = content.replace(/^---[\s\S]*?---\n*/m, "");
  const withoutTitle = withoutFront.replace(/^# .+\n*/m, "");
  const lines = withoutTitle.split("\n");

  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("### ")) {
      const question = line.replace("### ", "");
      const answersLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("###") && !lines[i].startsWith("##")) {
        if (lines[i].trim()) answersLines.push(lines[i]);
        i++;
      }
      const answer = answersLines.join("\n").trim();
      elements.push(
        <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs font-semibold text-primary-muted uppercase tracking-wide mb-2">{question}</p>
          <p className="text-base text-foreground whitespace-pre-wrap">{answer || "—"}</p>
        </div>
      );
    } else if (line.startsWith("**Submitted:**")) {
      elements.push(
        <p key={i} className="text-sm text-gray-500 mb-4">
          {line.replace("**Submitted:**", "").trim()}
        </p>
      );
      i++;
    } else {
      i++;
    }
  }
  return elements;
}

export default function ResponseDetail({ sessionId, filename, onDeleted }: ResponseDetailProps) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!filename || !sessionId) { setContent(null); return; }
    setLoading(true);
    fetch(`/api/responses?sessionId=${encodeURIComponent(sessionId)}&filename=${encodeURIComponent(filename)}`)
      .then((r) => r.json())
      .then((data: { content?: string }) => { setContent(data.content ?? null); setLoading(false); })
      .catch(() => setLoading(false));
  }, [filename, sessionId]);

  if (!filename) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <div className="w-20 h-20 bg-primary-soft rounded-full flex items-center justify-center mb-4">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1A13AF" strokeWidth="1.5">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">Select a response</h3>
        <p className="text-sm text-gray-500">Choose a response from the list to view its details.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex items-center gap-3 text-primary-muted">
          <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          Loading…
        </div>
      </div>
    );
  }

  async function handleDelete() {
    if (!filename || !window.confirm("Delete this response? This cannot be undone.")) return;
    setDeleting(true);
    await fetch(`/api/responses?sessionId=${encodeURIComponent(sessionId)}&filename=${encodeURIComponent(filename)}`, { method: "DELETE" });
    setDeleting(false);
    onDeleted?.(filename);
  }

  if (!content) return <div className="p-8 text-center text-gray-500">Response not found.</div>;

  return (
    <div className="max-w-2xl animate-scale-in">
      <div className="flex justify-end mb-3">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </div>
      <div className="space-y-4">{renderMarkdownSection(content)}</div>
    </div>
  );
}
