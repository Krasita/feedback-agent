import { list, put } from "@vercel/blob";

export interface ResponseMeta {
  id: string;
  date: string;
  filename: string;
  averageStars?: number;
}

function prefix(sessionId: string) {
  return `responses/${sessionId}/`;
}

function parseFilename(url: string): string {
  return url.split("/").pop() ?? url;
}

function extractIdAndDate(filename: string): { id: string; date: string } {
  const match = filename.match(/^(\d{4}-\d{2}-\d{2})_(\d{2}-\d{2}-\d{2})_([^.]+)\.md$/);
  if (!match) return { id: filename, date: "" };
  const [, datePart, timePart, id] = match;
  const isoDate = `${datePart}T${timePart.replace(/-/g, ":")}Z`;
  return { id, date: new Date(isoDate).toISOString() };
}

async function fetchBlobContent(blobUrl: string): Promise<string | null> {
  try {
    const res = await fetch(blobUrl, {
      headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function extractAverageStars(content: string): number | undefined {
  const matches = [...content.matchAll(/★+☆* \((\d)\/5\)/g)];
  if (matches.length === 0) return undefined;
  const sum = matches.reduce((acc, m) => acc + Number(m[1]), 0);
  return Math.round((sum / matches.length) * 10) / 10;
}

export async function writeResponse(
  sessionId: string,
  id: string,
  date: Date,
  content: string
): Promise<string> {
  const pad = (n: number) => String(n).padStart(2, "0");
  const filename = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}_${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}_${id}.md`;
  await put(`${prefix(sessionId)}${filename}`, content, {
    access: "private",
    contentType: "text/markdown; charset=utf-8",
  });
  return filename;
}

export async function listResponses(sessionId: string): Promise<ResponseMeta[]> {
  const { blobs } = await list({ prefix: prefix(sessionId) });
  const sorted = blobs
    .filter((b) => b.pathname.endsWith(".md"))
    .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());

  return Promise.all(
    sorted.map(async (blob) => {
      const filename = parseFilename(blob.url);
      const { id, date } = extractIdAndDate(filename);
      const content = await fetchBlobContent(blob.url);
      const averageStars = content ? extractAverageStars(content) : undefined;
      return { id, date, filename, averageStars };
    })
  );
}

export async function getResponse(
  sessionId: string,
  filename: string
): Promise<string | null> {
  const { blobs } = await list({ prefix: `${prefix(sessionId)}${filename}` });
  if (blobs.length === 0) return null;
  return fetchBlobContent(blobs[0].url);
}

export async function countResponses(sessionId: string): Promise<number> {
  const { blobs } = await list({ prefix: prefix(sessionId) });
  return blobs.filter((b) => b.pathname.endsWith(".md")).length;
}
