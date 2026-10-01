import { cn, statusColors, statusLabels } from "@/lib/utils";

export function Badge({
  status,
  label,
}: {
  status: string;
  label?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold tracking-wide",
        statusColors[status] || "bg-gray-100 text-gray-800",
      )}
    >
      {label || statusLabels[status] || status}
    </span>
  );
}
