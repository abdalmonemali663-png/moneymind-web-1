"use client";

// src/hooks/useFinancialSummary.ts
// يجلب ملخص البيانات المالية الحقيقية للمستخدم من Supabase مباشرة
// (آخر 30/90 يوم + إجماليات الادخار/الاستثمار/صافي الثروة).
// لا توجد بيانات Mock: إذا لم توجد سجلات، تُرجع كل القيم 0 وقوائم فارغة،
// والمكوّنات المستهلكة هي من تعرض "لا توجد بيانات حتى الآن".

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type {
  Income,
  Expense,
  UserNetWorthView,
  ExpensesByCategoryView,
} from "@/types/database";

export interface FinancialSummary {
  totalIncome30d: number;
  totalExpenses30d: number;
  recentIncome: Income[];
  recentExpenses: Expense[];
  netWorth: UserNetWorthView | null;
  expensesByCategory: ExpensesByCategoryView[];
  hasAnyData: boolean;
}

const EMPTY_SUMMARY: FinancialSummary = {
  totalIncome30d: 0,
  totalExpenses30d: 0,
  recentIncome: [],
  recentExpenses: [],
  netWorth: null,
  expensesByCategory: [],
  hasAnyData: false,
};

export function useFinancialSummary() {
  const [summary, setSummary] = useState<FinancialSummary>(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSummary(EMPTY_SUMMARY);
      setLoading(false);
      return;
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    const [incomeRes, expensesRes, netWorthRes, categoryRes] = await Promise.all([
      supabase
        .from("income")
        .select("*")
        .eq("user_id", user.id)
        .gte("received_at", thirtyDaysAgo)
        .order("received_at", { ascending: false }),
      supabase
        .from("expenses")
        .select("*")
        .eq("user_id", user.id)
        .gte("spent_at", thirtyDaysAgo)
        .order("spent_at", { ascending: false }),
      supabase.from("v_user_net_worth").select("*").eq("user_id", user.id)
        .maybeSingle(),
      supabase.from("v_expenses_by_category").select("*").eq("user_id", user.id),
    ]);

    if (incomeRes.error || expensesRes.error) {
      setError(incomeRes.error?.message ?? expensesRes.error?.message ?? "خطأ غير متوقع");
      setLoading(false);
      return;
    }

    const recentIncome = incomeRes.data ?? [];
    const recentExpenses = expensesRes.data ?? [];

    setSummary({
      totalIncome30d: sum(recentIncome.map((i) => Number(i.amount))),
      totalExpenses30d: sum(recentExpenses.map((e) => Number(e.amount))),
      recentIncome,
      recentExpenses,
      netWorth: netWorthRes.data ?? null,
      expensesByCategory: categoryRes.data ?? [],
      hasAnyData: recentIncome.length > 0 || recentExpenses.length > 0,
    });

    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { summary, loading, error, refresh: load };
}

function sum(arr: number[]): number {
  return arr.reduce((acc, v) => acc + v, 0);
}
