import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = "", hover = false }: CardProps) {
  return (
    <div
      className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-lg dark:shadow-gray-900/20 ${
        hover ? "hover:shadow-xl hover:scale-105 transition-all duration-300" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
