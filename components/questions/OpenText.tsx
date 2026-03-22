"use client";

const MAX_CHARS = 500;

interface OpenTextProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function OpenText({ value, onChange, disabled }: OpenTextProps) {
  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, MAX_CHARS))}
        disabled={disabled}
        rows={4}
        placeholder="Share your thoughts here..."
        className={`w-full resize-none rounded-xl border-2 px-4 py-3 text-base transition-all duration-200
          placeholder:text-gray-400 text-foreground
          border-gray-200 hover:border-primary-muted
          focus:border-primary focus:outline-none focus:ring-0
          bg-white disabled:bg-gray-50 disabled:cursor-default`}
      />
      <div
        className={`absolute bottom-3 right-3 text-xs font-medium transition-colors ${
          value.length >= MAX_CHARS * 0.9
            ? "text-amber-500"
            : "text-gray-400"
        }`}
      >
        {value.length}/{MAX_CHARS}
      </div>
    </div>
  );
}
