import { getQuestions } from "@/lib/questions";
import FeedbackForm from "@/components/FeedbackForm";
import Logo from "@/components/ui/Logo";

export default function Home() {
  const questions = getQuestions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-pale via-white to-primary-soft/40 flex flex-col">
      {/* Header */}
      <header className="py-6 px-6 flex justify-center">
        <Logo />
      </header>

      {/* Hero */}
      <div className="text-center px-6 pt-4 pb-10 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 bg-primary-soft text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          Training Session Feedback
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3 tracking-tight">
          How did we do today?
        </h1>
        <p className="text-base text-gray-500 max-w-md mx-auto">
          Your feedback helps us improve future sessions. It takes less than 2 minutes.
        </p>
      </div>

      {/* Form */}
      <main className="flex-1 px-4 sm:px-6 pb-16">
        <FeedbackForm questions={questions} />
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-gray-400">
        Responses are anonymous and used only to improve training quality.
      </footer>
    </div>
  );
}
