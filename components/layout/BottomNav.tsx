"use client";

// src/components/layout/BottomNav.tsx
// شريط تنقل سفلي للموبايل (Mobile First) — يظهر فقط دون lg breakpoint.
// يحتوي على أهم 5 وجهات؛ باقي الوجهات متاحة من الإعدادات/القائمة الكاملة.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { LayoutDashboard, Wallet, Receipt, Sparkles, Target } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries/ar";
import type { Locale } from "@/i18n/config";

export function BottomNav({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const pathname = usePathname();

  const items = [
    { href: `/${locale}/dashboard`, label: dict.nav.dashboard, icon: LayoutDashboard },
    { href: `/${locale}/income`, label: dict.nav.income, icon: Wallet },
    { href: `/${locale}/expenses`, label: dict.nav.expenses, icon: Receipt },
    { href: `/${locale}/goals`, label: dict.nav.goals, icon: Target },
    { href: `/${locale}/advisor`, label: dict.nav.advisor, icon: Sparkles },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-slate-400/10 bg-paper-50/95 px-2 py-2 backdrop-blur-md dark:bg-ink-800/95 lg:hidden">
      {items.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-medium",
              isActive
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-slate-500 dark:text-slate-400",
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={isActive ? 2.25 : 1.75} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
