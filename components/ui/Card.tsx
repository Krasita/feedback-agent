import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = "", hover = false }: CardProps) {
  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${
        hover ? "hover:shadow-md hover:-translate-y-0.5 transition-all duration-200" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
