// src/components/ui/Card.tsx
import { clsx } from "clsx";

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "rounded-card border border-slate-400/10 bg-paper-50 p-5 shadow-card",
        "dark:bg-ink-800 dark:shadow-card-dark",
        className,
      )}
    >
      {children}
    </div>
  );
}
