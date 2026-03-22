import questionsData from "@/config/questions.json";

export type QuestionType = "star" | "yesno" | "multiple_choice" | "open_text";

export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  required: boolean;
}

export function getQuestions(): Question[] {
  return questionsData as Question[];
}
