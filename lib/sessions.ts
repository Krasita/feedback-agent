import { list, put } from "@vercel/blob";

export interface Session {
  id: string;
  name: string;
  createdAt: string;
  isActive: boolean;
}

const SESSIONS_BLOB = "sessions/index.json";

const INITIAL_SESSION: Session = {
  id: "discover-ai-market-research",
  name: "Discover - AI powered market & user research",
  createdAt: new Date().toISOString(),
  isActive: true,
};

async function fetchSessionsRaw(): Promise<string | null> {
  const { blobs } = await list({ prefix: SESSIONS_BLOB });
  if (blobs.length === 0) return null;
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const res = await fetch(blobs[0].url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) return null;
  return res.text();
}

export async function getSessions(): Promise<Session[]> {
  const raw = await fetchSessionsRaw();
  if (!raw) {
    // First boot: seed with initial session
    await saveSessions([INITIAL_SESSION]);
    return [INITIAL_SESSION];
  }
  try {
    return JSON.parse(raw) as Session[];
  } catch {
    return [];
  }
}

export async function saveSessions(sessions: Session[]): Promise<void> {
  await put(SESSIONS_BLOB, JSON.stringify(sessions, null, 2), {
    access: "private",
    contentType: "application/json",
  });
}

export async function getActiveSession(): Promise<Session | null> {
  const sessions = await getSessions();
  return sessions.find((s) => s.isActive) ?? null;
}

export async function createSession(name: string): Promise<Session> {
  const sessions = await getSessions();
  const session: Session = {
    id: `session-${Date.now()}`,
    name: name.trim(),
    createdAt: new Date().toISOString(),
    isActive: false,
  };
  await saveSessions([...sessions, session]);
  return session;
}

export async function setActiveSession(id: string): Promise<void> {
  const sessions = await getSessions();
  await saveSessions(sessions.map((s) => ({ ...s, isActive: s.id === id })));
}
