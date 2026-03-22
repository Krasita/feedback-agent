import fs from "fs";
import path from "path";

const RESPONSES_DIR = path.join(process.cwd(), "responses");

function ensureDir() {
  if (!fs.existsSync(RESPONSES_DIR)) {
    fs.mkdirSync(RESPONSES_DIR, { recursive: true });
  }
}

export interface ResponseMeta {
  id: string;
  date: string;
  filename: string;
  averageStars?: number;
}

export async function writeResponse(
  id: string,
  date: Date,
  content: string
): Promise<string> {
  ensureDir();
  const pad = (n: number) => String(n).padStart(2, "0");
  const filename = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}_${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}_${id}.md`;
  const filepath = path.join(RESPONSES_DIR, filename);
  fs.writeFileSync(filepath, content, "utf-8");
  return filename;
}

export async function listResponses(): Promise<ResponseMeta[]> {
  ensureDir();
  const files = fs
    .readdirSync(RESPONSES_DIR)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .reverse();

  return files.map((filename) => {
    const content = fs.readFileSync(path.join(RESPONSES_DIR, filename), "utf-8");
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
  });
}

export async function getResponse(filename: string): Promise<string | null> {
  ensureDir();
  const filepath = path.join(RESPONSES_DIR, filename);
  if (!fs.existsSync(filepath)) return null;
  return fs.readFileSync(filepath, "utf-8");
}
