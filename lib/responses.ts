import { list, put } from "@vercel/blob";

const PREFIX = "responses/";

export interface ResponseMeta {
  id: string;
  date: string;
  filename: string;
  averageStars?: number;
}

/** Extract the last path segment from a blob URL */
function parseFilename(url: string): string {
  return url.split("/").pop() ?? url;
}

/** Parse id and date out of the filename instead of fetching content */
function extractIdAndDate(filename: string): { id: string; date: string } {
  // Filename format: YYYY-MM-DD_HH-MM-SS_ID.md
  const match = filename.match(/^(\d{4}-\d{2}-\d{2})_(\d{2}-\d{2}-\d{2})_([^.]+)\.md$/);
  if (!match) return { id: filename, date: "" };
  const [, datePart, timePart, id] = match;
  const isoDate = `${datePart}T${timePart.replace(/-/g, ":")}Z`;
  return { id, date: new Date(isoDate).toISOString() };
}

/** Fetch private blob content using the store token for auth */
async function fetchBlobContent(blobUrl: string): Promise<string | null> {
  try {
    const res = await fetch(blobUrl, {
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
      },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function extractAverageStars(content: string): number | undefined {
  const starMatches = [...content.matchAll(/★+☆* \((\d)\/5\)/g)];
  if (starMatches.length === 0) return undefined;
  const sum = starMatches.reduce((acc, m) => acc + Number(m[1]), 0);
  return Math.round((sum / starMatches.length) * 10) / 10;
}

export async function writeResponse(
  id: string,
  date: Date,
  content: string
): Promise<string> {
  const pad = (n: number) => String(n).padStart(2, "0");
  const filename = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}_${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}_${id}.md`;

  await put(`${PREFIX}${filename}`, content, {
    access: "private",
    contentType: "text/markdown; charset=utf-8",
  });

  return filename;
}

export async function listResponses(): Promise<ResponseMeta[]> {
  const { blobs } = await list({ prefix: PREFIX });

  const sorted = blobs
    .filter((b) => b.pathname.endsWith(".md"))
    .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());

  const results = await Promise.all(
    sorted.map(async (blob) => {
      const filename = parseFilename(blob.url);
      const { id, date } = extractIdAndDate(filename);

      // Fetch content only to extract star ratings
      const content = await fetchBlobContent(blob.url);
      const averageStars = content ? extractAverageStars(content) : undefined;

      return { id, date, filename, averageStars };
    })
  );

  return results;
}

export async function getResponse(filename: string): Promise<string | null> {
  const { blobs } = await list({ prefix: `${PREFIX}${filename}` });
  if (blobs.length === 0) return null;

  return fetchBlobContent(blobs[0].url);
}
