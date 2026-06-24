"use client";

// src/components/layout/Sidebar.tsx
// شريط التنقل الجانبي (Desktop) — يتحول لشريط سفلي مكثّف على الموبايل
// عبر BottomNav.tsx المنفصل. يحترم اتجاه RTL/LTR تلقائياً بفضل dir
// على عنصر <html> ولا حاجة لمنطق خاص هنا.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  PiggyBank,
  TrendingUp,
  Target,
  Sparkles,
  Map,
  FileText,
  GraduationCap,
  Settings,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Dictionary } from "@/i18n/dictionaries/ar";
import type { Locale } from "@/i18n/config";

interface SidebarProps {
  dict: Dictionary;
  locale: Locale;
}

export function Sidebar({ dict, locale }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { href: `/${locale}/dashboard`, label: dict.nav.dashboard, icon: LayoutDashboard },
    { href: `/${locale}/income`, label: dict.nav.income, icon: Wallet },
    { href: `/${locale}/expenses`, label: dict.nav.expenses, icon: Receipt },
    { href: `/${locale}/savings`, label: dict.nav.savings, icon: PiggyBank },
    { href: `/${locale}/investments`, label: dict.nav.investments, icon: TrendingUp },
    { href: `/${locale}/goals`, label: dict.nav.goals, icon: Target },
    { href: `/${locale}/advisor`, label: dict.nav.advisor, icon: Sparkles },
    { href: `/${locale}/roadmap`, label: dict.nav.roadmap, icon: Map },
    { href: `/${locale}/reports`, label: dict.nav.reports, icon: FileText },
    { href: `/${locale}/academy`, label: dict.nav.academy, icon: GraduationCap },
  ];

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(`/${locale}/login`);
  }

  return (
    <aside className="hidden h-screen w-64 flex-col border-e border-slate-400/10 bg-paper-50 px-4 py-6 dark:bg-ink-800 lg:flex">
      <div className="mb-8 px-2">
        <span className="font-display text-xl font-bold text-ink-900 dark:text-paper-100">
          {dict.common.appName}
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 rounded-pill px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                  : "text-slate-600 hover:bg-paper-200 dark:text-slate-400 dark:hover:bg-ink-700",
              )}
            >
              <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 space-y-1 border-t border-slate-400/10 pt-4">
        <Link
          href={`/${locale}/settings`}
          className="flex items-center gap-3 rounded-pill px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-paper-200 dark:text-slate-400 dark:hover:bg-ink-700"
        >
          <Settings className="h-4.5 w-4.5" strokeWidth={1.75} />
          {dict.nav.settings}
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-pill px-3 py-2.5 text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
        >
          <LogOut className="h-4.5 w-4.5" strokeWidth={1.75} />
          {dict.nav.logout}
        </button>
      </div>
    </aside>
  );
}
