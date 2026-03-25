"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import SessionsManager from "@/components/admin/SessionsManager";
import ResponseList from "@/components/admin/ResponseList";
import ResponseDetail from "@/components/admin/ResponseDetail";
import SummaryPanel from "@/components/admin/SummaryPanel";
import type { Session } from "@/lib/sessions";
import type { ResponseMeta } from "@/lib/responses";

type Tab = "responses" | "summary";

function StatsBar({ responses }: { responses: ResponseMeta[] }) {
  const withStars = responses.filter((r) => r.averageStars !== undefined);
  const overallAvg =
    withStars.length > 0
      ? (withStars.reduce((s, r) => s + (r.averageStars ?? 0), 0) / withStars.length).toFixed(1)
      : "—";

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-xs font-semibold text-primary-muted uppercase tracking-wide mb-1">Total Responses</p>
        <p className="text-3xl font-bold text-primary">{responses.length}</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-xs font-semibold text-primary-muted uppercase tracking-wide mb-1">Avg. Rating</p>
        <div className="flex items-center gap-2">
          <p className="text-3xl font-bold text-primary">{overallAvg}</p>
          {overallAvg !== "—" && (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#1A13AF">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  const [responses, setResponses] = useState<ResponseMeta[]>([]);
  const [responsesLoading, setResponsesLoading] = useState(false);
  const [selectedFilename, setSelectedFilename] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("responses");

  // Load sessions on mount
  useEffect(() => {
    fetch("/api/sessions")
      .then((r) => r.json())
      .then((data: { sessions?: Session[] }) => {
        const loaded = data.sessions ?? [];
        setSessions(loaded);
        setSessionsLoading(false);
        // Auto-select the active session
        const active = loaded.find((s) => s.isActive);
        if (active) setSelectedSessionId(active.id);
      })
      .catch(() => setSessionsLoading(false));
  }, []);

  // Load responses when selected session changes
  useEffect(() => {
    if (!selectedSessionId) {
      setResponses([]);
      return;
    }
    setResponsesLoading(true);
    setSelectedFilename(null);
    fetch(`/api/responses?sessionId=${encodeURIComponent(selectedSessionId)}`)
      .then((r) => r.json())
      .then((data: { responses?: ResponseMeta[] }) => {
        setResponses(data.responses ?? []);
        setResponsesLoading(false);
      })
      .catch(() => setResponsesLoading(false));
  }, [selectedSessionId]);

  const selectedSession = sessions.find((s) => s.id === selectedSessionId) ?? null;

  const sidebar = sessionsLoading ? (
    <div className="p-6 text-center text-primary-muted text-sm">Loading…</div>
  ) : (
    <SessionsManager
      sessions={sessions}
      selectedId={selectedSessionId}
      onSelect={(id) => {
        setSelectedSessionId(id);
        setTab("responses");
      }}
      onSessionsChange={setSessions}
    />
  );

  return (
    <AdminLayout sidebar={sidebar} title="Dashboard">
      {!selectedSession ? (
        <div className="h-full flex flex-col items-center justify-center text-center p-8">
          <div className="w-20 h-20 bg-primary-soft rounded-full flex items-center justify-center mb-4">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1A13AF" strokeWidth="1.5">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Select a session</h3>
          <p className="text-sm text-gray-500">Choose a session from the sidebar to view its responses and AI analysis.</p>
        </div>
      ) : (
        <>
          {/* Session header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl font-bold text-foreground">{selectedSession.name}</h2>
              {selectedSession.isActive && (
                <span className="text-xs font-bold text-white bg-primary px-2.5 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </div>
          </div>

          {/* Stats */}
          {!responsesLoading && <StatsBar responses={responses} />}

          {/* Tab bar */}
          <div className="flex gap-1 mb-6 bg-primary-pale rounded-xl p-1 w-fit">
            <button
              onClick={() => setTab("responses")}
              className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all duration-150
                ${tab === "responses"
                  ? "bg-white text-primary shadow-sm"
                  : "text-primary-muted hover:text-primary"
                }`}
            >
              Responses
            </button>
            <button
              onClick={() => setTab("summary")}
              className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold rounded-lg transition-all duration-150
                ${tab === "summary"
                  ? "bg-white text-primary shadow-sm"
                  : "text-primary-muted hover:text-primary"
                }`}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              AI Analysis
            </button>
          </div>

          {/* Tab content */}
          {tab === "responses" && (
            responsesLoading ? (
              <div className="flex items-center justify-center py-16 text-primary-muted gap-3">
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Loading responses…
              </div>
            ) : (
              <div className="flex gap-6" style={{ minHeight: "420px" }}>
                {/* Response list */}
                <div className="w-72 flex-shrink-0 bg-primary-soft/50 rounded-2xl overflow-y-auto border border-primary-soft">
                  <ResponseList
                    responses={responses}
                    selectedFilename={selectedFilename}
                    onSelect={setSelectedFilename}
                  />
                </div>

                {/* Response detail */}
                <div className="flex-1 overflow-y-auto">
                  <ResponseDetail
                    sessionId={selectedSessionId!}
                    filename={selectedFilename}
                    onDeleted={(deleted) => {
                      setResponses((prev) => prev.filter((r) => r.filename !== deleted));
                      setSelectedFilename(null);
                    }}
                  />
                </div>
              </div>
            )
          )}

          {tab === "summary" && (
            <SummaryPanel
              sessionId={selectedSessionId!}
              responseCount={responses.length}
            />
          )}
        </>
      )}
    </AdminLayout>
  );
}
