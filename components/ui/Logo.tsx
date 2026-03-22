export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"
            fill="white"
          />
          <path
            d="M8 10h2v4H8v-4zm6 0h2v4h-2v-4z"
            fill="rgba(255,255,255,0.5)"
          />
          <circle cx="12" cy="12" r="3" fill="rgba(255,255,255,0.3)" />
          <path d="M9 11l3-3 3 3-3 3-3-3z" fill="white" />
        </svg>
      </div>
      <span className="font-semibold text-primary text-lg tracking-tight">
        Feedback<span className="text-primary-light">·</span>Agent
      </span>
    </div>
  );
}
