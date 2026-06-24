"use client";

// src/app/[locale]/(auth)/forgot-password/ForgotPasswordClient.tsx
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import type { Dictionary } from "@/i18n/dictionaries/ar";
import type { Locale } from "@/i18n/config";

export function ForgotPasswordClient({
  dict,
  locale,
}: {
  dict: Dictionary;
  locale: Locale;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/${locale}/reset-password`,
    });

    if (resetError) {
      setError(resetError.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="text-center">
        <h1 className="font-display text-xl font-bold text-ink-900 dark:text-paper-100">
          {dict.auth.checkYourEmail}
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{email}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-paper-100">
          {dict.auth.resetPassword}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-900 dark:text-paper-100">
            {dict.auth.email}
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-slate-400/20 bg-paper-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 dark:bg-ink-800"
          />
        </div>

        {error && <p className="text-sm text-rose-500">{error}</p>}

        <Button type="submit" className="w-full" isLoading={loading}>
          {dict.auth.sendResetLink}
        </Button>
      </form>

      <p className="text-center text-sm">
        <Link
          href={`/${locale}/login`}
          className="font-medium text-emerald-600 hover:underline"
        >
          {dict.auth.login}
        </Link>
      </p>
    </div>
  );
}
