import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("surface-panel p-5", className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h3 className="font-display text-lg font-semibold text-[var(--ink)]">
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-sm text-[var(--ink-muted)]">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
