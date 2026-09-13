import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const isIframe = typeof window !== "undefined" && window.self !== window.top;

export function formatCountApprox(value) {
  const n = Number(value) || 0;
  if (n <= 0) return "0";
  if (n < 10) return `${n}+`;
  if (n < 100) return `${Math.floor(n / 10) * 10}+`;
  if (n < 1000) return `${Math.floor(n / 100) * 100}+`;
  return `${Math.floor(n / 1000)}k+`;
}