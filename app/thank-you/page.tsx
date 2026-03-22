import Logo from "@/components/ui/Logo";
import Link from "next/link";

export default function ThankYou() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-pale via-white to-primary-soft/40 flex flex-col items-center justify-center px-6">
      <header className="absolute top-0 left-0 right-0 py-6 px-6 flex justify-center">
        <Logo />
      </header>

      <div className="text-center max-w-md animate-scale-in">
        {/* Success icon */}
        <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-3">
          Thank you!
        </h1>
        <p className="text-gray-500 text-base leading-relaxed mb-8">
          Your feedback has been submitted successfully. We appreciate you taking the time to help us improve.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-2.5 bg-primary text-white font-semibold rounded-full hover:bg-primary-dark transition-colors shadow-sm"
          >
            Submit another response
          </Link>
        </div>
      </div>
    </div>
  );
}
