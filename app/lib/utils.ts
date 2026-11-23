import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export type Tone = "success" | "warning" | "danger";

export function scoreTone(score: number): Tone {
  if (score >= 75) return "success";
  if (score >= 55) return "warning";
  return "danger";
}

export function scoreLabel(score: number): string {
  if (score >= 75) return "Strong match";
  if (score >= 55) return "Good potential";
  return "Needs work";
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}
