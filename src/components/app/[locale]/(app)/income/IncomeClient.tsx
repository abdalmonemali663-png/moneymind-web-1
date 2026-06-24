"use client";

// src/app/[locale]/(app)/income/IncomeClient.tsx
// إدارة الدخل: إضافة/تعديل/حذف. كل العمليات تذهب مباشرة لجدول income
// في Supabase (محمي بـ RLS)، ولا توجد بيانات أولية محشوة هنا.

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/useUser";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Dictionary } from "@/i18n/dictionaries/ar";
import type { Locale } from "@/i18n/config";
import type { Income, IncomeSource, CurrencyCode } from "@/types/database";
import { Plus, Trash2, Pencil, Wallet } from "lucide-react";
import { CURRENCIES } from "@/lib/format";

const SOURCES: IncomeSource[] = ["salary", "freelance", "investment", "bonus", "custom"];

interface FormState {
  id?: string;
  source: IncomeSource;
  custom_label: string;
  amount: string;
  currency: CurrencyCode;
  received_at: string;
  notes: string;
}

function emptyForm(defaultCurrency: CurrencyCode): FormState {
  return {
    source: "salary",
    custom_label: "",
    amount: "",
    currency: defaultCurrency,
    received_at: new Date().toISOString().slice(0, 10),
    notes: "",
  };
}

export function IncomeClient({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const { user, profile } = useUser();
  const [records, setRecords] = useState<Income[]>([]);
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
      .from("income")
      .select("*")
      .eq("user_id", user.id)
      .order("received_at", { ascending: false });

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

  function openEditForm(record: Income) {
    setForm({
      id: record.id,
      source: record.source,
      custom_label: record.custom_label ?? "",
      amount: String(record.amount),
      currency: record.currency,
      received_at: record.received_at,
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
      source: form.source,
      custom_label: form.source === "custom" ? form.custom_label : null,
      amount: Number(form.amount),
      currency: form.currency,
      received_at: form.received_at,
      notes: form.notes || null,
    };

    const { error: saveError } = form.id
      ? await supabase.from("income").update(payload).eq("id", form.id)
      : await supabase.from("income").insert(payload);

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
    await supabase.from("income").delete().eq("id", id);
    await loadRecords();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-paper-100">
          {dict.income.title}
        </h1>
        <Button onClick={openCreateForm} size="sm">
          <Plus className="h-4 w-4" />
          {dict.income.addIncome}
        </Button>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  {dict.income.source}
                </label>
                <select
                  value={form.source}
                  onChange={(e) =>
                    setForm({ ...form, source: e.target.value as IncomeSource })
                  }
                  className="w-full rounded-xl border border-slate-400/20 bg-paper-50 px-3 py-2.5 text-sm dark:bg-ink-700"
                >
                  {SOURCES.map((s) => (
                    <option key={s} value={s}>
                      {dict.income.sources[s]}
                    </option>
                  ))}
                </select>
              </div>

              {form.source === "custom" && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    {dict.income.customLabel}
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
                  {dict.income.receivedAt}
                </label>
                <input
                  type="date"
                  required
                  value={form.received_at}
                  onChange={(e) => setForm({ ...form, received_at: e.target.value })}
                  className="w-full rounded-xl border border-slate-400/20 bg-paper-50 px-3 py-2.5 text-sm dark:bg-ink-700"
                />
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
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowForm(false)}
              >
                {dict.common.cancel}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="h-40 animate-pulse rounded-card bg-paper-200 dark:bg-ink-700" />
      ) : records.length === 0 ? (
        <EmptyState icon={Wallet} message={dict.emptyStates.noIncome} />
      ) : (
        <div className="space-y-2">
          {records.map((record) => (
            <Card key={record.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-ink-900 dark:text-paper-100">
                  {record.source === "custom"
                    ? record.custom_label
                    : dict.income.sources[record.source]}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {formatDate(record.received_at, locale)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-tabular font-semibold text-emerald-600 dark:text-emerald-400">
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
