import { list, put, head } from "@vercel/blob";

const PREFIX = "responses/";

export interface ResponseMeta {
  id: string;
  date: string;
  filename: string;
  averageStars?: number;
}

function parseFilename(url: string): string {
  return url.split("/").pop() ?? url;
}

function extractMeta(content: string, filename: string): ResponseMeta {
  const idMatch = content.match(/^id:\s*(.+)$/m);
  const dateMatch = content.match(/^date:\s*(.+)$/m);
  const starMatches = [...content.matchAll(/★+☆* \((\d)\/5\)/g)];
  let averageStars: number | undefined;
  if (starMatches.length > 0) {
    const sum = starMatches.reduce((acc, m) => acc + Number(m[1]), 0);
    averageStars = Math.round((sum / starMatches.length) * 10) / 10;
  }
  return {
    id: idMatch ? idMatch[1].trim() : filename,
    date: dateMatch ? dateMatch[1].trim() : "",
    filename,
    averageStars,
  };
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
      try {
        const res = await fetch(blob.downloadUrl);
        const content = await res.text();
        return extractMeta(content, filename);
      } catch {
        return { id: filename, date: blob.uploadedAt.toISOString(), filename };
      }
    })
  );

  return results;
}

export async function getResponse(filename: string): Promise<string | null> {
  const { blobs } = await list({ prefix: `${PREFIX}${filename}` });
  if (blobs.length === 0) return null;

  try {
    const res = await fetch(blobs[0].downloadUrl);
    return await res.text();
  } catch {
    return null;
  }
}
