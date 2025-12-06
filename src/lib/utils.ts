import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function absoluteUrl(path: string) {
  if (typeof window !== "undefined") return path;
  const base = process.env.BASE_URL ?? `http://localhost:${process.env.PORT ?? 3000}`;
  return `${base}${path}`;
}
