"use client";

interface MultipleChoiceProps {
  options: string[];
  value: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function MultipleChoice({
  options,
  value,
  onChange,
  disabled,
}: MultipleChoiceProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {options.map((option) => {
        const selected = value === option;
        return (
          <button
            key={option}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option)}
            className={`w-full text-left px-5 py-4 rounded-xl border-2 font-medium transition-all duration-200 cursor-pointer
              focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
              ${
                selected
                  ? "border-primary bg-primary-soft text-primary shadow-sm"
                  : "border-gray-200 text-gray-600 hover:border-primary-muted hover:bg-primary-pale"
              }
              disabled:cursor-default`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all duration-150 ${
                  selected
                    ? "border-primary bg-primary"
                    : "border-gray-300"
                }`}
              >
                {selected && (
                  <svg viewBox="0 0 20 20" fill="white" className="w-full h-full p-0.5">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <span>{option}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
