export const dynamic = "force-dynamic";

import { getQuestions } from "@/lib/questions";
import { getActiveSession } from "@/lib/sessions";
import FeedbackForm from "@/components/FeedbackForm";
import Logo from "@/components/ui/Logo";

export default async function Home() {
  const questions = getQuestions();
  const activeSession = await getActiveSession();

  if (!activeSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-pale via-white to-primary-soft/40 flex flex-col items-center justify-center p-8 text-center">
        <Logo />
        <div className="mt-12 max-w-md">
          <div className="w-20 h-20 bg-primary-soft rounded-full flex items-center justify-center mx-auto mb-6">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1A13AF" strokeWidth="1.5">
              <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">No active session</h1>
          <p className="text-gray-500">There is no feedback session currently active. Please check with your trainer.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-pale via-white to-primary-soft/40 flex flex-col">
      <header className="py-6 px-6 flex justify-center">
        <Logo />
      </header>

      <div className="text-center px-6 pt-4 pb-10 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 bg-primary-soft text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-4 max-w-sm text-center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          {activeSession.name}
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3 tracking-tight">
          How did we do today?
        </h1>
        <p className="text-base text-gray-500 max-w-md mx-auto">
          Your feedback helps us improve future sessions. It takes less than 2 minutes.
        </p>
      </div>

      <main className="flex-1 px-4 sm:px-6 pb-16">
        <FeedbackForm questions={questions} />
      </main>

      <footer className="py-6 text-center text-xs text-gray-400">
        Responses are anonymous and used only to improve training quality.
      </footer>
    </div>
  );
}
