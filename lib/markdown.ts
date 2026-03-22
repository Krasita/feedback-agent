import { Question } from "./questions";

export type AnswerValue = string | number | null;

export interface Answers {
  [questionId: string]: AnswerValue;
}

function starDisplay(value: number): string {
  return "★".repeat(value) + "☆".repeat(5 - value) + ` (${value}/5)`;
}

export function buildMarkdown(
  questions: Question[],
  answers: Answers,
  id: string,
  date: Date
): string {
  const formattedDate = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  let md = `---\nid: ${id}\ndate: ${date.toISOString()}\n---\n\n`;
  md += `# Training Session Feedback\n\n`;
  md += `**Submitted:** ${formattedDate}\n\n---\n\n`;

  for (const q of questions) {
    const answer = answers[q.id];
    md += `### ${q.question}\n`;

    if (answer === null || answer === undefined || answer === "") {
      md += `_No answer provided_\n\n`;
      continue;
    }

    if (q.type === "star") {
      md += `${starDisplay(Number(answer))}\n\n`;
    } else if (q.type === "yesno") {
      md += `${answer}\n\n`;
    } else if (q.type === "multiple_choice") {
      md += `${answer}\n\n`;
    } else if (q.type === "open_text") {
      md += `${answer}\n\n`;
    }
  }

  return md;
}
