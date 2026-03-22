"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Question } from "@/lib/questions";
import type { Answers } from "@/lib/markdown";
import StarRating from "./questions/StarRating";
import YesNo from "./questions/YesNo";
import MultipleChoice from "./questions/MultipleChoice";
import OpenText from "./questions/OpenText";
import Button from "./ui/Button";

interface FeedbackFormProps {
  questions: Question[];
}

export default function FeedbackForm({ questions }: FeedbackFormProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answers>(() =>
    Object.fromEntries(questions.map((q) => [q.id, q.type === "open_text" ? "" : null]))
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setAnswer = (id: string, value: Answers[string]) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const isComplete = questions
    .filter((q) => q.required)
    .every((q) => {
      const a = answers[q.id];
      return a !== null && a !== "" && a !== undefined;
    });

  const handleSubmit = async () => {
    if (!isComplete || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Submission failed");
      }
      router.push("/thank-you");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  const progress =
    (questions.filter((q) => {
      const a = answers[q.id];
      return a !== null && a !== "" && a !== undefined;
    }).length /
      questions.length) *
    100;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm font-medium text-primary-muted mb-2">
          <span>Your Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-primary-soft rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((q, i) => (
          <div
            key={q.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-fade-in-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-start gap-3 mb-5">
              <div className="w-7 h-7 rounded-full bg-primary-soft text-primary text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </div>
              <div>
                <p className="text-base font-semibold text-foreground leading-snug">
                  {q.question}
                </p>
                {q.required && (
                  <span className="text-xs text-primary-muted mt-0.5 inline-block">
                    Required
                  </span>
                )}
              </div>
            </div>

            <div className="pl-10">
              {q.type === "star" && (
                <StarRating
                  value={answers[q.id] as number | null}
                  onChange={(v) => setAnswer(q.id, v)}
                  disabled={submitting}
                />
              )}
              {q.type === "yesno" && (
                <YesNo
                  value={answers[q.id] as string | null}
                  onChange={(v) => setAnswer(q.id, v)}
                  disabled={submitting}
                />
              )}
              {q.type === "multiple_choice" && (
                <MultipleChoice
                  options={q.options ?? []}
                  value={answers[q.id] as string | null}
                  onChange={(v) => setAnswer(q.id, v)}
                  disabled={submitting}
                />
              )}
              {q.type === "open_text" && (
                <OpenText
                  value={(answers[q.id] as string) ?? ""}
                  onChange={(v) => setAnswer(q.id, v)}
                  disabled={submitting}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Submit */}
      <div className="mt-8 flex justify-center animate-fade-in-up delay-500">
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={!isComplete}
          loading={submitting}
          className="min-w-[200px]"
        >
          {submitting ? "Submitting…" : "Submit Feedback"}
        </Button>
      </div>

      {!isComplete && (
        <p className="text-center text-sm text-muted mt-3 animate-fade-in">
          Please answer all required questions to continue.
        </p>
      )}
    </div>
  );
}
