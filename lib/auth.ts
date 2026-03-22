import { SessionOptions, IronSession } from "iron-session";

export interface SessionData {
  isAdmin?: boolean;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: "feedback_agent_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
  },
};

export async function getSession(
  cookieStore: Awaited<ReturnType<typeof import("next/headers")["cookies"]>>
): Promise<IronSession<SessionData>> {
  const { getIronSession } = await import("iron-session");
  return getIronSession<SessionData>(cookieStore as never, sessionOptions);
}
