"use client";

import type { ResponseMeta } from "@/lib/responses";

interface ResponseListProps {
  responses: ResponseMeta[];
  selectedFilename: string | null;
  onSelect: (filename: string) => void;
}

function formatDate(isoDate: string) {
  try {
    return new Date(isoDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoDate;
  }
}

function StarBadge({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary text-white text-xs font-bold rounded-full">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      {value.toFixed(1)}
    </span>
  );
}

export default function ResponseList({
  responses,
  selectedFilename,
  onSelect,
}: ResponseListProps) {
  if (responses.length === 0) {
    return (
      <div className="p-6 text-center text-primary-muted text-sm">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B65DC" strokeWidth="1.5">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        No responses yet
      </div>
    );
  }

  return (
    <div className="divide-y divide-primary-soft">
      {responses.map((r) => {
        const selected = selectedFilename === r.filename;
        return (
          <button
            key={r.filename}
            onClick={() => onSelect(r.filename)}
            className={`w-full text-left px-4 py-4 transition-all duration-150 cursor-pointer
              ${selected ? "bg-white shadow-sm" : "hover:bg-white/60"}
            `}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className={`text-sm font-semibold truncate ${selected ? "text-primary" : "text-foreground"}`}>
                  Response #{r.id.slice(-6)}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {r.date ? formatDate(r.date) : "—"}
                </p>
              </div>
              {r.averageStars !== undefined && (
                <StarBadge value={r.averageStars} />
              )}
            </div>
            {selected && (
              <div className="mt-1.5 w-6 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}
