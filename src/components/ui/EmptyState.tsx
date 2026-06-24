// src/components/ui/EmptyState.tsx
// المكوّن الموحّد لعرض "لا توجد بيانات حتى الآن" في كل أنحاء التطبيق.
// هذا يضمن عدم وجود أي بيانات Mock أو Placeholder تُعرض بدلاً منه.

import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

export function EmptyState({
  message,
  actionLabel,
  onAction,
  icon: Icon = Inbox,
}: {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: LucideIcon;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-slate-400/25 px-6 py-12 text-center">
      <Icon className="h-9 w-9 text-slate-400" strokeWidth={1.5} />
      <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2 rounded-pill bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
