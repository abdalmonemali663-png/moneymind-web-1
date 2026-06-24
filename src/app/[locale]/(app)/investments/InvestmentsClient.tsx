"use client";

// src/app/[locale]/(app)/investments/InvestmentsClient.tsx
// إدارة الاستثمارات: أسهم/عقارات/ذهب/مشاريع/عملات رقمية. الربح/الخسارة
// يُحسب محلياً في الواجهة من current_value - initial_amount الحقيقيين،
// ولا يُخزَّن كحقل منفصل لأنه قيمة مشتقة دائماً من البيانات الفعلية.

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/useUser";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, CURRENCIES } from "@/lib/format";
import type { Dictionary } from "@/i18n/dictionaries/ar";
import type { Locale } from "@/i18n/config";
import type { Investment, InvestmentType, CurrencyCode } from "@/types/database";
import { Plus, Trash2, Pencil, TrendingUp, TrendingDown } from "lucide-react";
import { clsx } from "clsx";

const TYPES: InvestmentType[] = ["stocks", "real_estate", "gold", "business", "crypto"];

interface FormState {
  id?: string;
  type: InvestmentType;
  name: string;
  initial_amount: string;
  current_value: string;
  currency: CurrencyCode;
  purchase_date: string;
  notes: string;
}

function emptyForm(defaultCurrency: CurrencyCode): FormState {
  return {
    type: "stocks",
    name: "",
    initial_amount: "",
    current_value: "",
    currency: defaultCurrency,
    purchase_date: new Date().toISOString().slice(0, 10),
    notes: "",
  };
}

export function InvestmentsClient({
  dict,
  locale,
}: {
  dict: Dictionary;
  locale: Locale;
}) {
  const { user, profile } = useUser();
  const [records, setRecords] = useState<Investment[]>([]);
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
      .from("investments")
      .select("*")
      .eq("user_id", user.id)
      .order("purchase_date", { ascending: false });

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

  function openEditForm(record: Investment) {
    setForm({
      id: record.id,
      type: record.type,
      name: record.name,
      initial_amount: String(record.initial_amount),
      current_value: String(record.current_value),
      currency: record.currency,
      purchase_date: record.purchase_date,
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
      type: form.type,
      name: form.name,
      initial_amount: Number(form.initial_amount),
      current_value: Number(form.current_value),
      currency: form.currency,
      purchase_date: form.purchase_date,
      notes: form.notes || null,
    };

    const { error: saveError } = form.id
      ? await supabase.from("investments").update(payload).eq("id", form.id)
      : await supabase.from("investments").insert(payload);

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
    await supabase.from("investments").delete().eq("id", id);
    await loadRecords();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-paper-100">
          {dict.investments.title}
        </h1>
        <Button onClick={openCreateForm} size="sm">
          <Plus className="h-4 w-4" />
          {dict.investments.addInvestment}
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
                  onChange={(e) =>
                    setForm({ ...form, type: e.target.value as InvestmentType })
                  }
                  className="w-full rounded-xl border border-slate-400/20 bg-paper-50 px-3 py-2.5 text-sm dark:bg-ink-700"
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {dict.investments.types[t]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  {dict.investments.name}
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
                  {dict.investments.initialAmount}
                </label>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  value={form.initial_amount}
                  onChange={(e) => setForm({ ...form, initial_amount: e.target.value })}
                  className="w-full rounded-xl border border-slate-400/20 bg-paper-50 px-3 py-2.5 text-sm dark:bg-ink-700"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  {dict.investments.currentValue}
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={form.current_value}
                  onChange={(e) => setForm({ ...form, current_value: e.target.value })}
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
                  {dict.investments.purchaseDate}
                </label>
                <input
                  type="date"
                  required
                  value={form.purchase_date}
                  onChange={(e) => setForm({ ...form, purchase_date: e.target.value })}
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
        <EmptyState icon={TrendingUp} message={dict.emptyStates.noInvestments} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {records.map((record) => {
            const profitLoss = record.current_value - record.initial_amount;
            const isProfit = profitLoss >= 0;

            return (
              <Card key={record.id}>
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase text-slate-400">
                      {dict.investments.types[record.type]}
                    </p>
                    <h3 className="font-display font-semibold text-ink-900 dark:text-paper-100">
                      {record.name}
                    </h3>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEditForm(record)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-paper-200 dark:hover:bg-ink-700"
                      aria-label={dict.common.edit}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/30"
                      aria-label={dict.common.delete}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <p className="font-tabular text-xl font-semibold text-ink-900 dark:text-paper-100">
                  {formatCurrency(record.current_value, record.currency, locale)}
                </p>

                <div
                  className={clsx(
                    "mt-1 flex items-center gap-1 text-sm font-medium",
                    isProfit ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500",
                  )}
                >
                  {isProfit ? (
                    <TrendingUp className="h-3.5 w-3.5" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5" />
                  )}
                  {formatCurrency(Math.abs(profitLoss), record.currency, locale)}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
