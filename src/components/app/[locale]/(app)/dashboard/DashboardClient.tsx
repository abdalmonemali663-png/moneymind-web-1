"use client";

// src/app/[locale]/(app)/dashboard/DashboardClient.tsx
// لوحة التحكم الرئيسية. كل القيم المعروضة مصدرها مباشرة useFinancialSummary
// (يقرأ من Supabase الحقيقي). لا توجد أي بيانات Mock/Sample في هذا الملف.
// عند عدم وجود بيانات، يُعرض EmptyState بنص "لا توجد بيانات حتى الآن"
// بدل أي رسم بياني أو رقم وهمي.

import { useFinancialSummary } from "@/hooks/useFinancialSummary";
import { useUser } from "@/hooks/useUser";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { Dictionary } from "@/i18n/dictionaries/ar";
import type { Locale } from "@/i18n/config";
import { Wallet, Receipt, PiggyBank, TrendingUp, Activity } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useMemo } from "react";

const CATEGORY_COLORS: Record<string, string> = {
  housing: "#0F9D6E",
  food: "#34D399",
  transportation: "#FBBF24",
  bills: "#F59E0B",
  education: "#60A5FA",
  health: "#F43F5E",
  entertainment: "#A78BFA",
  shopping: "#FB7185",
  custom: "#94A3B8",
};

export function DashboardClient({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const { profile } = useUser();
  const { summary, loading } = useFinancialSummary();
  const currency = profile?.preferred_currency ?? "EGP";

  const categoryChartData = useMemo(
    () =>
      summary.expensesByCategory.map((c) => ({
        name: dict.expenses.categories[c.category] ?? c.category,
        value: Number(c.total_amount),
        key: c.category,
      })),
    [summary.expensesByCategory, dict],
  );

  const incomeVsExpenseData = useMemo(
    () => [
      {
        name: dict.dashboard.last30Days,
        [dict.dashboard.totalIncome]: summary.totalIncome30d,
        [dict.dashboard.totalExpenses]: summary.totalExpenses30d,
      },
    ],
    [summary, dict],
  );

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-card bg-paper-200 dark:bg-ink-700"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-paper-100">
          {dict.dashboard.title}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {dict.dashboard.last30Days}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label={dict.dashboard.totalIncome}
          value={formatCurrency(summary.totalIncome30d, currency, locale)}
          icon={Wallet}
          accent="positive"
        />
        <StatCard
          label={dict.dashboard.totalExpenses}
          value={formatCurrency(summary.totalExpenses30d, currency, locale)}
          icon={Receipt}
          accent="negative"
        />
        <StatCard
          label={dict.dashboard.totalSavings}
          value={formatCurrency(summary.netWorth?.total_savings ?? 0, currency, locale)}
          icon={PiggyBank}
        />
        <StatCard
          label={dict.dashboard.netWorth}
          value={formatCurrency(summary.netWorth?.net_worth ?? 0, currency, locale)}
          icon={TrendingUp}
          accent={
            (summary.netWorth?.net_worth ?? 0) >= 0 ? "positive" : "negative"
          }
        />
      </div>

      {!summary.hasAnyData ? (
        <EmptyState
          icon={Activity}
          message={dict.common.noData}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <h2 className="mb-4 font-display text-base font-semibold text-ink-900 dark:text-paper-100">
              {dict.dashboard.incomeVsExpenses}
            </h2>
            {summary.totalIncome30d === 0 && summary.totalExpenses30d === 0 ? (
              <EmptyState message={dict.common.noData} />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={incomeVsExpenseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94A3B81A" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) => formatNumber(v, locale)}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value, currency, locale)}
                  />
                  <Bar
                    dataKey={dict.dashboard.totalIncome}
                    fill="#0F9D6E"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey={dict.dashboard.totalExpenses}
                    fill="#F43F5E"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card>
            <h2 className="mb-4 font-display text-base font-semibold text-ink-900 dark:text-paper-100">
              {dict.dashboard.expensesByCategory}
            </h2>
            {categoryChartData.length === 0 ? (
              <EmptyState message={dict.common.noData} />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                  >
                    {categoryChartData.map((entry) => (
                      <Cell
                        key={entry.key}
                        fill={CATEGORY_COLORS[entry.key] ?? "#94A3B8"}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value, currency, locale)}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
