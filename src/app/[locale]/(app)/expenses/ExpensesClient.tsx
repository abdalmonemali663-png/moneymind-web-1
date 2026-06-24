"use client";

// src/app/[locale]/(app)/expenses/ExpensesClient.tsx
// إدارة المصروفات: نفس نمط صفحة الدخل، بتصنيفات المصروفات الثمانية
// المحددة في الجدول، وخيار "مصروف متكرر" لدعم كاشف التسرب المالي لاحقاً.

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/useUser";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDate, CURRENCIES } from "@/lib/format";
import type { Dictionary } from "@/i18n/dictionaries/ar";
import type { Locale } from "@/i18n/config";
import type { Expense, ExpenseCategory, CurrencyCode } from "@/types/database";
import { Plus, Trash2, Pencil, Receipt, Repeat } from "lucide-react";

const CATEGORIES: ExpenseCategory[] = [
  "housing",
  "food",
  "transportation",
  "bills",
  "education",
  "health",
  "entertainment",
  "shopping",
  "custom",
];

interface FormState {
  id?: string;
  category: ExpenseCategory;
  custom_label: string;
  amount: string;
  currency: CurrencyCode;
  spent_at: string;
  is_recurring: boolean;
  notes: string;
}

function emptyForm(defaultCurrency: CurrencyCode): FormState {
  return {
    category: "food",
    custom_label: "",
    amount: "",
    currency: defaultCurrency,
    spent_at: new Date().toISOString().slice(0, 10),
    is_recurring: false,
    notes: "",
  };
}

export function ExpensesClient({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const { user, profile } = useUser();
  const [records, setRecords] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm("EGP"));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();
  const defaultCurrency = profile?.preferred_currency ?? "EGP";

  const loadRecords = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", user.id)
      .order("spent_at", { ascending: false });

    if (fetchError) setError(fetchError.message);
    setRecords(data ?? []);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  function openCreateForm() {
    setForm(emptyForm(defaultCurrency));
    setShowForm(true);
  }

  function openEditForm(record: Expense) {
    setForm({
      id: record.id,
      category: record.category,
      custom_label: record.custom_label ?? "",
      amount: String(record.amount),
      currency: record.currency,
      spent_at: record.spent_at,
      is_recurring: record.is_recurring,
      notes: record.notes ?? "",
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError(null);

    const payload = {
      user_id: user.id,
      category: form.category,
      custom_label: form.category === "custom" ? form.custom_label : null,
      amount: Number(form.amount),
      currency: form.currency,
      spent_at: form.spent_at,
      is_recurring: form.is_recurring,
      notes: form.notes || null,
    };

    const { error: saveError } = form.id
      ? await supabase.from("expenses").update(payload).eq("id", form.id)
      : await supabase.from("expenses").insert(payload);

    if (saveError) {
      setError(saveError.message);
      setSaving(false);
      return;
    }

    setShowForm(false);
    setSaving(false);
    await loadRecords();
  }

  async function handleDelete(id: string) {
    await supabase.from("expenses").delete().eq("id", id);
    await loadRecords();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-paper-100">
          {dict.expenses.title}
        </h1>
        <Button onClick={openCreateForm} size="sm">
          <Plus className="h-4 w-4" />
          {dict.expenses.addExpense}
        </Button>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  {dict.expenses.category}
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value as ExpenseCategory })
                  }
                  className="w-full rounded-xl border border-slate-400/20 bg-paper-50 px-3 py-2.5 text-sm dark:bg-ink-700"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {dict.expenses.categories[c]}
                    </option>
                  ))}
                </select>
              </div>

              {form.category === "custom" && (
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

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  {dict.common.amount}
                </label>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
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

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  {dict.expenses.spentAt}
                </label>
                <input
                  type="date"
                  required
                  value={form.spent_at}
                  onChange={(e) => setForm({ ...form, spent_at: e.target.value })}
                  className="w-full rounded-xl border border-slate-400/20 bg-paper-50 px-3 py-2.5 text-sm dark:bg-ink-700"
                />
              </div>

              <div className="flex items-center gap-2 self-end pb-2.5">
                <input
                  type="checkbox"
                  id="is_recurring"
                  checked={form.is_recurring}
                  onChange={(e) => setForm({ ...form, is_recurring: e.target.checked })}
                  className="h-4 w-4 rounded accent-emerald-600"
                />
                <label htmlFor="is_recurring" className="text-sm font-medium">
                  {dict.expenses.isRecurring}
                </label>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium">
                  {dict.common.notes} ({dict.common.optional})
                </label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
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
      ) : records.length === 0 ? (
        <EmptyState icon={Receipt} message={dict.emptyStates.noExpenses} />
      ) : (
        <div className="space-y-2">
          {records.map((record) => (
            <Card key={record.id} className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-ink-900 dark:text-paper-100">
                    {record.category === "custom"
                      ? record.custom_label
                      : dict.expenses.categories[record.category]}
                  </p>
                  {record.is_recurring && (
                    <Repeat className="h-3.5 w-3.5 text-slate-400" />
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {formatDate(record.spent_at, locale)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-tabular font-semibold text-rose-500">
                  {formatCurrency(record.amount, record.currency, locale)}
                </span>
                <button
                  onClick={() => openEditForm(record)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-paper-200 dark:hover:bg-ink-700"
                  aria-label={dict.common.edit}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(record.id)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/30"
                  aria-label={dict.common.delete}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
