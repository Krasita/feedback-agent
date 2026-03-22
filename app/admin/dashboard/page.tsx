"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import ResponseList from "@/components/admin/ResponseList";
import ResponseDetail from "@/components/admin/ResponseDetail";
import type { ResponseMeta } from "@/lib/responses";

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
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [responses, setResponses] = useState<ResponseMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/responses")
      .then((r) => r.json())
      .then((data) => {
        setResponses(data.responses ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const sidebar = (
    <div>
      <div className="px-4 py-4 border-b border-primary-soft/60">
        <h2 className="text-sm font-bold text-primary uppercase tracking-wide">
          Responses
        </h2>
        <p className="text-xs text-primary-muted mt-0.5">{responses.length} total</p>
      </div>
      {loading ? (
        <div className="p-6 text-center text-primary-muted text-sm">Loading…</div>
      ) : (
        <ResponseList
          responses={responses}
          selectedFilename={selected}
          onSelect={setSelected}
        />
      )}
    </div>
  );

  return (
    <AdminLayout sidebar={sidebar} title="Dashboard">
      {loading ? (
        <div className="h-full flex items-center justify-center text-primary-muted">
          Loading responses…
        </div>
      ) : (
        <>
          <StatsBar responses={responses} />
          <ResponseDetail filename={selected} />
        </>
      )}
    </AdminLayout>
  );
}
