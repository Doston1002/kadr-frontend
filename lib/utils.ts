import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(date: string | Date | undefined) {
  if (!date) return "-";
  return new Date(date).toLocaleTimeString("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(date: string | Date | undefined) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("uz-UZ");
}

export const statusLabels: Record<string, string> = {
  present: "Keldi",
  late: "Kechikdi",
  checked_out: "Ketdi",
  absent: "Kelmadi",
  on_leave: "Ta'tilda",
  sick: "Kasallik",
  business_trip: "Xizmat safari",
  active: "Faol",
  inactive: "Nofaol",
};

export const commentReasonLabels: Record<string, string> = {
  late: "Kech qolaman",
  absent: "Ishga kela olmayman",
  business_trip: "Xizmat safarida",
  sick: "Kasal",
  other: "Boshqa sabab",
};

export const statusColors: Record<string, string> = {
  present: "bg-[var(--success-soft)] text-[var(--success)]",
  late: "bg-[var(--warning-soft)] text-[var(--warning)]",
  checked_out: "bg-[var(--info-soft)] text-[var(--info)]",
  absent: "bg-[var(--danger-soft)] text-[var(--danger)]",
  on_leave: "bg-[var(--accent-soft)] text-[var(--accent)]",
  sick: "bg-[var(--warning-soft)] text-[var(--warning)]",
  business_trip: "bg-[var(--info-soft)] text-[var(--info)]",
  active: "bg-[var(--success-soft)] text-[var(--success)]",
  inactive: "bg-[var(--surface-muted)] text-[var(--ink-muted)]",
};
