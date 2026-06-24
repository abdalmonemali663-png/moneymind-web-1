// src/components/ui/StatCard.tsx
// العنصر المميز (Signature Element) للتصميم: الأرقام الحقيقية للمستخدم هي
// "البطل" المرئي للوحة التحكم. خط tabular يضمن محاذاة الأرقام بدقة،
// وحركة دخول خفيفة عند التحديث (count-up) دون أي إفراط بصري.

import { clsx } from "clsx";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "neutral",
  hint,
}: {
  label: string;
  value: string;
  icon?: LucideIcon;
  accent?: "positive" | "negative" | "neutral";
  hint?: string;
}) {
  const accentColor = {
    positive: "text-emerald-600 dark:text-emerald-400",
    negative: "text-rose-500 dark:text-rose-400",
    neutral: "text-ink-900 dark:text-paper-100",
  }[accent];

  return (
    <div className="animate-slide-up rounded-card border border-slate-400/10 bg-paper-50 p-5 shadow-card dark:bg-ink-800 dark:shadow-card-dark">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {label}
        </span>
        {Icon && <Icon className="h-4 w-4 text-slate-400" strokeWidth={1.75} />}
      </div>
      <p
        className={clsx(
          "font-tabular text-2xl font-semibold tabular-nums-fix animate-count-up",
          accentColor,
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
