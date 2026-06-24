"use client";

// src/app/[locale]/(app)/settings/SettingsClient.tsx
// الإعدادات: الملف الشخصي، اللغة (يُعيد التوجيه لمسار /en أو /ar)،
// المظهر (عبر useTheme)، العملة المفضلة، وحد الميزانية الشهرية
// (settings.monthly_budget_limit الذي تستخدمه generate-notifications).

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/useUser";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CURRENCIES } from "@/lib/format";
import type { Dictionary } from "@/i18n/dictionaries/ar";
import type { Locale } from "@/i18n/config";
import type { AppTheme, CurrencyCode, Settings } from "@/types/database";
import { clsx } from "clsx";

export function SettingsClient({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const { user, profile, refresh } = useUser();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [currency, setCurrency] = useState<CurrencyCode>("EGP");
  const [settings, setSettings] = useState<Settings | null>(null);
  const [budgetLimit, setBudgetLimit] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setAge(profile.age ? String(profile.age) : "");
      setJobTitle(profile.job_title ?? "");
      setCurrency(profile.preferred_currency);
    }
  }, [profile]);

  useEffect(() => {
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  async function loadSettings() {
    if (!user) return;
    const { data } = await supabase
      .from("settings")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (data) {
      setSettings(data);
      setBudgetLimit(data.monthly_budget_limit ? String(data.monthly_budget_limit) : "");
    }
  }

  async function handleSaveProfile() {
    if (!user) return;
    setSaving(true);
    setSaved(false);

    await supabase
      .from("profiles")
      .update({
        full_name: fullName || null,
        age: age ? Number(age) : null,
        job_title: jobTitle || null,
        preferred_currency: currency,
      })
      .eq("id", user.id);

    await supabase
      .from("settings")
      .update({ monthly_budget_limit: budgetLimit ? Number(budgetLimit) : null })
      .eq("user_id", user.id);

    await refresh();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleLanguageChange(newLocale: Locale) {
    const pathWithoutLocale = window.location.pathname.replace(/^\/(ar|en)/, "");
    router.push(`/${newLocale}${pathWithoutLocale}`);
  }

  async function toggleNotificationSetting(
    key: "notifications_enabled" | "budget_alerts_enabled" | "goal_alerts_enabled",
  ) {
    if (!user || !settings) return;
    const newValue = !settings[key];
    setSettings({ ...settings, [key]: newValue });
    await supabase.from("settings").update({ [key]: newValue }).eq("user_id", user.id);
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-paper-100">
        {dict.settings.title}
      </h1>

      <Card>
        <h2 className="mb-4 font-display text-base font-semibold text-ink-900 dark:text-paper-100">
          {dict.settings.profile}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              {dict.auth.fullName}
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border border-slate-400/20 bg-paper-50 px-3 py-2.5 text-sm dark:bg-ink-700"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">العمر / Age</label>
            <input
              type="number"
              min="1"
              max="119"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full rounded-xl border border-slate-400/20 bg-paper-50 px-3 py-2.5 text-sm dark:bg-ink-700"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium">
              الوظيفة / Job title
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-400/20 bg-paper-50 px-3 py-2.5 text-sm dark:bg-ink-700"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              {dict.settings.preferredCurrency}
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
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
              {dict.settings.budgetLimit} ({dict.common.optional})
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={budgetLimit}
              onChange={(e) => setBudgetLimit(e.target.value)}
              className="w-full rounded-xl border border-slate-400/20 bg-paper-50 px-3 py-2.5 text-sm dark:bg-ink-700"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Button onClick={handleSaveProfile} isLoading={saving}>
            {dict.common.save}
          </Button>
          {saved && (
            <span className="text-sm text-emerald-600 dark:text-emerald-400">✓</span>
          )}
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 font-display text-base font-semibold text-ink-900 dark:text-paper-100">
          {dict.settings.language}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => handleLanguageChange("ar")}
            className={clsx(
              "rounded-pill px-4 py-2 text-sm font-medium",
              locale === "ar"
                ? "bg-emerald-600 text-white"
                : "bg-paper-200 text-slate-600 dark:bg-ink-700 dark:text-slate-300",
            )}
          >
            العربية
          </button>
          <button
            onClick={() => handleLanguageChange("en")}
            className={clsx(
              "rounded-pill px-4 py-2 text-sm font-medium",
              locale === "en"
                ? "bg-emerald-600 text-white"
                : "bg-paper-200 text-slate-600 dark:bg-ink-700 dark:text-slate-300",
            )}
          >
            English
          </button>
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 font-display text-base font-semibold text-ink-900 dark:text-paper-100">
          {dict.settings.theme}
        </h2>
        <div className="flex gap-2">
          {(["light", "dark", "system"] as AppTheme[]).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={clsx(
                "rounded-pill px-4 py-2 text-sm font-medium",
                theme === t
                  ? "bg-emerald-600 text-white"
                  : "bg-paper-200 text-slate-600 dark:bg-ink-700 dark:text-slate-300",
              )}
            >
              {dict.settings.themes[t]}
            </button>
          ))}
        </div>
      </Card>

      {settings && (
        <Card>
          <h2 className="mb-4 font-display text-base font-semibold text-ink-900 dark:text-paper-100">
            {dict.settings.notifications}
          </h2>
          <div className="space-y-3">
            {(
              [
                ["notifications_enabled", dict.settings.notifications],
                ["budget_alerts_enabled", dict.common.amount],
                ["goal_alerts_enabled", dict.goals.title],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex items-center justify-between text-sm">
                <span className="text-ink-900 dark:text-paper-100">{label}</span>
                <input
                  type="checkbox"
                  checked={settings[key]}
                  onChange={() => toggleNotificationSetting(key)}
                  className="h-4 w-4 rounded accent-emerald-600"
                />
              </label>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
