"use client";

// src/app/[locale]/(app)/savings/SavingsClient.tsx
// أهداف الادخار + المساهمات. current_amount في savings_goals يُحسب
// تلقائياً بواسطة trigger في القاعدة عند كل مساهمة (انظر
// moneymind-db/01_schema.sql: recalc_savings_goal_amount) — لذلك لا نكتب
// current_amount يدوياً هنا أبداً، فقط نعرضه بعد إعادة الجلب.

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/useUser";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatPercentage, CURRENCIES } from "@/lib/format";
import type { Dictionary } from "@/i18n/dictionaries/ar";
import type { Locale } from "@/i18n/config";
import type { SavingsGoal, CurrencyCode } from "@/types/database";
import { Plus, Trash2, PiggyBank, CirclePlus } from "lucide-react";

interface GoalFormState {
  name: string;
  target_amount: string;
  currency: CurrencyCode;
  target_date: string;
}

function emptyGoalForm(defaultCurrency: CurrencyCode): GoalFormState {
  return { name: "", target_amount: "", currency: defaultCurrency, target_date: "" };
}

export function SavingsClient({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const { user, profile } = useUser();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<GoalFormState>(emptyGoalForm("EGP"));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contributingTo, setContributingTo] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState("");

  const supabase = createClient();
  const defaultCurrency = profile?.preferred_currency ?? "EGP";

  const loadGoals = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from("savings_goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (fetchError) setError(fetchError.message);
    setGoals(data ?? []);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  function openCreateForm() {
    setForm(emptyGoalForm(defaultCurrency));
    setShowForm(true);
  }

  async function handleCreateGoal(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError(null);

    const { error: saveError } = await supabase.from("savings_goals").insert({
      user_id: user.id,
      name: form.name,
      target_amount: Number(form.target_amount),
      currency: form.currency,
      target_date: form.target_date || null,
      current_amount: 0, // قيمة بداية حقيقية وليست وهمية — كل ادخار جديد يبدأ من صفر
    });

    if (saveError) {
      setError(saveError.message);
      setSaving(false);
      return;
    }

    setShowForm(false);
    setSaving(false);
    await loadGoals();
  }

  async function handleDeleteGoal(id: string) {
    await supabase.from("savings_goals").delete().eq("id", id);
    await loadGoals();
  }

  async function handleAddContribution(goalId: string) {
    if (!user || !contributionAmount) return;

    await supabase.from("savings_contributions").insert({
      user_id: user.id,
      savings_goal_id: goalId,
      amount: Number(contributionAmount),
      contributed_at: new Date().toISOString().slice(0, 10),
    });

    setContributingTo(null);
    setContributionAmount("");
    await loadGoals(); // يعيد current_amount المُحدَّث تلقائياً من الـ trigger
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-paper-100">
          {dict.savings.title}
        </h1>
        <Button onClick={openCreateForm} size="sm">
          <Plus className="h-4 w-4" />
          {dict.savings.addGoal}
        </Button>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={handleCreateGoal} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium">
                  {dict.savings.goalName}
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-400/20 bg-paper-50 px-3 py-2.5 text-sm dark:bg-ink-700"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  {dict.savings.targetAmount}
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  value={form.target_amount}
                  onChange={(e) => setForm({ ...form, target_amount: e.target.value })}
                  className="w-full rounded-xl border border-slate-400/20 bg-paper-50 px-3 py-2.5 text-sm dark:bg-ink-700"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  {dict.common.currency}
                </label>
                <select
                  value={form.currency}
                  onChange={(e) =>
                    setForm({ ...form, currency: e.target.value as CurrencyCode })
                  }
                  className="w-full rounded-xl border border-slate-400/20 bg-paper-50 px-3 py-2.5 text-sm dark:bg-ink-700"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium">
                  {dict.savings.targetDate} ({dict.common.optional})
                </label>
                <input
                  type="date"
                  value={form.target_date}
                  onChange={(e) => setForm({ ...form, target_date: e.target.value })}
                  className="w-full rounded-xl border border-slate-400/20 bg-paper-50 px-3 py-2.5 text-sm dark:bg-ink-700"
                />
              </div>
            </div>

            {error && <p className="text-sm text-rose-500">{error}</p>}

            <div className="flex gap-2">
              <Button type="submit" isLoading={saving}>
                {dict.common.save}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                {dict.common.cancel}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="h-40 animate-pulse rounded-card bg-paper-200 dark:bg-ink-700" />
      ) : goals.length === 0 ? (
        <EmptyState icon={PiggyBank} message={dict.emptyStates.noSavings} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {goals.map((goal) => {
            const progress =
              goal.target_amount > 0
                ? Math.min(100, (goal.current_amount / goal.target_amount) * 100)
                : 0;

            return (
              <Card key={goal.id}>
                <div className="mb-3 flex items-start justify-between">
                  <h3 className="font-display font-semibold text-ink-900 dark:text-paper-100">
                    {goal.name}
                  </h3>
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="text-slate-400 hover:text-rose-500"
                    aria-label={dict.common.delete}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mb-2 h-2 w-full overflow-hidden rounded-pill bg-paper-200 dark:bg-ink-700">
                  <div
                    className="h-full rounded-pill bg-emerald-600 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="font-tabular font-medium text-ink-900 dark:text-paper-100">
                    {formatCurrency(goal.current_amount, goal.currency, locale)}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {formatCurrency(goal.target_amount, goal.currency, locale)}
                  </span>
                </div>

                <p className="mb-3 text-xs text-emerald-600 dark:text-emerald-400">
                  {formatPercentage(progress, locale)} {dict.savings.progress}
                </p>

                {contributingTo === goal.id ? (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      autoFocus
                      value={contributionAmount}
                      onChange={(e) => setContributionAmount(e.target.value)}
                      className="w-full rounded-xl border border-slate-400/20 bg-paper-50 px-3 py-2 text-sm dark:bg-ink-700"
                      placeholder={dict.common.amount}
                    />
                    <Button size="sm" onClick={() => handleAddContribution(goal.id)}>
                      {dict.common.add}
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => setContributingTo(goal.id)}
                  >
                    <CirclePlus className="h-4 w-4" />
                    {dict.savings.addContribution}
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
