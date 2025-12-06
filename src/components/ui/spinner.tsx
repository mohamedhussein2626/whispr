"use client";

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={`animate-spin rounded-full border-4 border-t-transparent border-gray-700 ${className}`}
    ></div>
  );
}