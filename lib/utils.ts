import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined, formatString = "MMM d, yyyy"): string {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatTime(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function getBloodGroupColor(group: string): { bg: string; text: string; border: string } {
  switch (group) {
    case "O-":
      return { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-700 dark:text-amber-400", border: "border-amber-300 dark:border-amber-700" };
    case "O+":
      return { bg: "bg-red-50 dark:bg-red-950/40", text: "text-red-700 dark:text-red-400", border: "border-red-300 dark:border-red-700" };
    case "A+":
    case "A-":
      return { bg: "bg-rose-50 dark:bg-rose-950/40", text: "text-rose-700 dark:text-rose-400", border: "border-rose-300 dark:border-rose-700" };
    case "B+":
    case "B-":
      return { bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-300 dark:border-emerald-700" };
    case "AB+":
    case "AB-":
      return { bg: "bg-purple-50 dark:bg-purple-950/40", text: "text-purple-700 dark:text-purple-400", border: "border-purple-300 dark:border-purple-700" };
    default:
      return { bg: "bg-slate-50 dark:bg-slate-900", text: "text-slate-700 dark:text-slate-300", border: "border-slate-300 dark:border-slate-700" };
  }
}

export function getUrgencyBadge(urgency: string): { label: string; className: string } {
  switch (urgency) {
    case "CRITICAL":
      return { label: "Critical Urgent", className: "bg-red-600 text-white animate-pulse font-bold" };
    case "HIGH":
      return { label: "High Priority", className: "bg-amber-600 text-white font-semibold" };
    case "MEDIUM":
      return { label: "Moderate", className: "bg-blue-600 text-white" };
    default:
      return { label: "Standard", className: "bg-slate-600 text-white" };
  }
}
