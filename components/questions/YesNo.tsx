"use client";

interface YesNoProps {
  value: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function YesNo({ value, onChange, disabled }: YesNoProps) {
  return (
    <div className="flex gap-4">
      {["Yes", "No"].map((option) => {
        const selected = value === option;
        return (
          <button
            key={option}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option)}
            className={`flex-1 max-w-[140px] py-4 rounded-xl border-2 font-semibold text-lg transition-all duration-200 cursor-pointer
              focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
              ${
                selected
                  ? "border-primary bg-primary text-white shadow-md scale-105"
                  : "border-gray-200 text-gray-500 hover:border-primary-muted hover:text-primary hover:bg-primary-soft"
              }
              disabled:cursor-default`}
          >
            {option === "Yes" ? "👍 Yes" : "👎 No"}
          </button>
        );
      })}
    </div>
  );
}
