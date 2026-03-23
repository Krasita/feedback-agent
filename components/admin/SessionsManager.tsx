"use client";

import { useState } from "react";
import type { Session } from "@/lib/sessions";

interface Props {
  sessions: Session[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onSessionsChange: (sessions: Session[]) => void;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch { return iso; }
}

export default function SessionsManager({ sessions, selectedId, onSelect, onSessionsChange }: Props) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [activating, setActivating] = useState<string | null>(null);

  async function handleCreate() {
    if (!newName.trim() || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const data = await res.json() as { session?: Session; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to create session");
      onSessionsChange([...sessions, data.session!]);
      setNewName("");
      setCreating(false);
      onSelect(data.session!.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  async function handleSetActive(id: string) {
    if (activating) return;
    setActivating(id);
    try {
      await fetch("/api/sessions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      onSessionsChange(sessions.map((s) => ({ ...s, isActive: s.id === id })));
    } catch {
      alert("Failed to set active session");
    } finally {
      setActivating(null);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-4 border-b border-primary-soft/60">
        <h2 className="text-sm font-bold text-primary uppercase tracking-wide">Sessions</h2>
        <p className="text-xs text-primary-muted mt-0.5">{sessions.length} total</p>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-primary-soft">
        {sessions.length === 0 && (
          <p className="p-6 text-sm text-center text-primary-muted">No sessions yet.</p>
        )}
        {sessions.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={`w-full text-left px-4 py-4 transition-all duration-150 cursor-pointer
              ${selectedId === s.id ? "bg-white shadow-sm" : "hover:bg-white/60"}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className={`text-sm font-semibold truncate ${selectedId === s.id ? "text-primary" : "text-foreground"}`}>
                  {s.name}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{formatDate(s.createdAt)}</p>
              </div>
              {s.isActive && (
                <span className="flex-shrink-0 text-xs font-bold text-white bg-primary px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </div>
            {selectedId === s.id && !s.isActive && (
              <button
                onClick={(e) => { e.stopPropagation(); handleSetActive(s.id); }}
                disabled={activating === s.id}
                className="mt-2 text-xs text-primary font-semibold hover:underline disabled:opacity-50"
              >
                {activating === s.id ? "Activating…" : "Set as Active →"}
              </button>
            )}
            {selectedId === s.id && (
              <div className="mt-1.5 w-6 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* New session */}
      <div className="p-4 border-t border-primary-soft/60">
        {creating ? (
          <div className="space-y-2">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") { setCreating(false); setNewName(""); } }}
              placeholder="Session name…"
              className="w-full text-sm border border-primary-soft rounded-lg px-3 py-2 outline-none focus:border-primary"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                disabled={!newName.trim() || saving}
                className="flex-1 text-xs font-semibold bg-primary text-white rounded-lg py-1.5 disabled:opacity-50"
              >
                {saving ? "Creating…" : "Create"}
              </button>
              <button
                onClick={() => { setCreating(false); setNewName(""); }}
                className="flex-1 text-xs font-semibold border border-gray-200 rounded-lg py-1.5 text-gray-500 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setCreating(true)}
            className="w-full text-sm font-semibold text-primary flex items-center justify-center gap-2 py-2 rounded-xl border-2 border-dashed border-primary-soft hover:border-primary hover:bg-primary-pale transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
            </svg>
            New Session
          </button>
        )}
      </div>
    </div>
  );
}
