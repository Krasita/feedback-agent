"use client";

import { useState } from "react";

interface StarRatingProps {
  value: number | null;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export default function StarRating({ value, onChange, disabled }: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const active = hovered ?? value ?? 0;

  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(null)}
          className="focus:outline-none transition-transform duration-100 hover:scale-110 active:scale-95 cursor-pointer disabled:cursor-default"
          aria-label={`${star} star${star !== 1 ? "s" : ""}`}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            className="transition-all duration-150"
          >
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill={star <= active ? "#1A13AF" : "none"}
              stroke={star <= active ? "#1A13AF" : "#D1D5DB"}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ))}
      {value !== null && (
        <span className="ml-1 text-sm font-medium text-primary-muted">
          {value}/5
        </span>
      )}
    </div>
  );
}
