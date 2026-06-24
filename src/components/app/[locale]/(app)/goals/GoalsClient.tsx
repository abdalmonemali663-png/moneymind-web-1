"use client";

// src/app/[locale]/(app)/goals/GoalsClient.tsx
// الأهداف المالية (سيارة/منزل/مشروع/سفر). نسبة الإنجاز والوقت المتوقع
// محسوبة هنا من saved_amount/target_amount الحقيقيين، أو عبر
// v_goal_progress إن احتجنا قراءة سريعة بدون منطق إضافي.

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/useUser";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatPercentage, formatDate, CURRENCIES } from "@/lib/format";
import type { Dictionary } from "@/i18n/dictionaries/ar";
import type { Locale } from "@/i18n/config";
import type { FinancialGoal, GoalType, CurrencyCode } from "@/types/database";
import { Plus, Trash2, Target } from "lucide-react";

const TYPES: GoalType[] = ["car", "house", "business", "travel", "custom"];

interface FormState {
  type: GoalType;
  custom_label: string;
  title: string;
  target_amount: string;
  currency: CurrencyCode;
  target_date: string;
}

function emptyForm(defaultCurrency: CurrencyCode): FormState {
  return {
    type: "car",
    custom_label: "",
    title: "",
    target_amount: "",
    currency: defaultCurrency,
    target_date: "",
  };
}

export function GoalsClient({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const { user, profile } = useUser();
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm("EGP"));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();
  const defaultCurrency = profile?.preferred_currency ?? "EGP";

  const loadGoals = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from("financial_goals")
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
    setForm(emptyForm(defaultCurrency));
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError(null);

    const { error: saveError } = await supabase.from("financial_goals").insert({
      user_id: user.id,
      type: form.type,
      custom_label: form.type === "custom" ? form.custom_label : null,
      title: form.title,
      target_amount: Number(form.target_amount),
      saved_amount: 0,
      currency: form.currency,
      target_date: form.target_date || null,
      status: "active",
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

  async function handleDelete(id: string) {
    await supabase.from("financial_goals").delete().eq("id", id);
    await loadGoals();
  }

  function estimateTimeRemaining(goal: FinancialGoal): string | null {
    // تقدير بسيط وشفاف: لا يوجد رقم وهمي. إذا لم يوجد target_date ولا
    // بيانات كافية لتقدير معدل الادخار، لا نعرض أي وقت متوقع.
    if (!goal.target_date) return null;
    return formatDate(goal.target_date, locale);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-paper-100">
          {dict.goals.title}
        </h1>
        <Button onClick={openCreateForm} size="sm">
          <Plus className="h-4 w-4" />
          {dict.goals.addGoal}
        </Button>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  {dict.investments.typeLabel}
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as GoalType })}
                  className="w-full rounded-xl border border-slate-400/20 bg-paper-50 px-3 py-2.5 text-sm dark:bg-ink-700"
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {dict.goals.types[t]}
                    </option>
                  ))}
                </select>
              </div>

              {form.type === "custom" && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    {dict.expenses.customLabel}
                  </label>
                  <input
                    type="text"
                    required
                    value={form.custom_label}
                    onChange={(e) => setForm({ ...form, custom_label: e.target.value })}
                    className="w-full rounded-xl border border-slate-400/20 bg-paper-50 px-3 py-2.5 text-sm dark:bg-ink-700"
                  />
                </div>
              )}

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium">
                  {dict.investments.name}
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
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
        <EmptyState icon={Target} message={dict.emptyStates.noGoals} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {goals.map((goal) => {
            const progress =
              goal.target_amount > 0
                ? Math.min(100, (goal.saved_amount / goal.target_amount) * 100)
                : 0;
            const remaining = Math.max(0, goal.target_amount - goal.saved_amount);
            const estimatedTime = estimateTimeRemaining(goal);

            return (
              <Card key={goal.id}>
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase text-slate-400">
                      {goal.type === "custom" ? goal.custom_label : dict.goals.types[goal.type]}
                    </p>
                    <h3 className="font-display font-semibold text-ink-900 dark:text-paper-100">
                      {goal.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => handleDelete(goal.id)}
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

                <div className="flex items-center justify-between text-sm">
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {formatPercentage(progress, locale)}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {dict.goals.remainingAmount}: {formatCurrency(remaining, goal.currency, locale)}
                  </span>
                </div>

                {estimatedTime && (
                  <p className="mt-2 text-xs text-slate-400">
                    {dict.goals.estimatedTime}: {estimatedTime}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
