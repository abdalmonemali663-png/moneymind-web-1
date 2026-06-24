"use client";

// src/app/[locale]/(auth)/login/LoginClient.tsx
// تسجيل الدخول الحقيقي عبر Supabase Auth: Email/Password + Google + Apple.
// لا توجد بيانات اعتماد تجريبية مكتوبة هنا — كل شيء يُرسل لـ Supabase Auth.

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import type { Dictionary } from "@/i18n/dictionaries/ar";
import type { Locale } from "@/i18n/config";

export function LoginClient({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "apple" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect_to") ?? `/${locale}/dashboard`;

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  async function handleOAuth(provider: "google" | "apple") {
    setOauthLoading(provider);
    setError(null);

    const supabase = createClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect_to=${redirectTo}`,
      },
    });

    if (oauthError) {
      setError(oauthError.message);
      setOauthLoading(null);
    }
    // عند النجاح، Supabase يعيد التوجيه تلقائياً لصفحة المزوّد ثم للـ callback
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-paper-100">
          {dict.auth.welcomeBack}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {dict.auth.welcomeBackSubtitle}
        </p>
      </div>

      <div className="space-y-3">
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => handleOAuth("google")}
          isLoading={oauthLoading === "google"}
          disabled={oauthLoading !== null}
        >
          {dict.auth.continueWithGoogle}
        </Button>
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => handleOAuth("apple")}
          isLoading={oauthLoading === "apple"}
          disabled={oauthLoading !== null}
        >
          {dict.auth.continueWithApple}
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-400/20" />
        <span className="text-xs text-slate-400">OR</span>
        <div className="h-px flex-1 bg-slate-400/20" />
      </div>

      <form onSubmit={handleEmailLogin} className="space-y-3">
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
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="block text-sm font-medium text-ink-900 dark:text-paper-100">
              {dict.auth.password}
            </label>
            <Link
              href={`/${locale}/forgot-password`}
              className="text-xs font-medium text-emerald-600 hover:underline"
            >
              {dict.auth.forgotPassword}
            </Link>
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-400/20 bg-paper-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 dark:bg-ink-800"
          />
        </div>

        {error && <p className="text-sm text-rose-500">{error}</p>}

        <Button type="submit" className="w-full" isLoading={loading}>
          {dict.auth.login}
        </Button>
      </form>

      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        {dict.auth.noAccount}{" "}
        <Link
          href={`/${locale}/signup`}
          className="font-medium text-emerald-600 hover:underline"
        >
          {dict.auth.createAccount}
        </Link>
      </p>
    </div>
  );
}
