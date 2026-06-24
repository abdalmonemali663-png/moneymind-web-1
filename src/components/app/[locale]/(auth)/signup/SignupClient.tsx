"use client";

// src/app/[locale]/(auth)/signup/SignupClient.tsx
// إنشاء حساب حقيقي عبر Supabase Auth. عند النجاح، الـ trigger
// handle_new_user في قاعدة البيانات يُنشئ profile + settings تلقائياً.

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import type { Dictionary } from "@/i18n/dictionaries/ar";
import type { Locale } from "@/i18n/config";

export function SignupClient({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(dict.auth.confirmPassword);
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback?redirect_to=/${locale}/dashboard`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // إذا كانت قاعدة Supabase لا تتطلب تأكيد بريد، يكون المستخدم مسجلاً
    // ولديه جلسة فعلياً؛ وإن تطلبت تأكيداً، نعرض رسالة "تحقق من بريدك".
    setSuccess(true);
    setLoading(false);
  }

  if (success) {
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
          {dict.auth.createAccount}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {dict.auth.createAccountSubtitle}
        </p>
      </div>

      <form onSubmit={handleSignup} className="space-y-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-900 dark:text-paper-100">
            {dict.auth.fullName}
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-xl border border-slate-400/20 bg-paper-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 dark:bg-ink-800"
          />
        </div>
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
          <label className="mb-1.5 block text-sm font-medium text-ink-900 dark:text-paper-100">
            {dict.auth.password}
          </label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-400/20 bg-paper-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 dark:bg-ink-800"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-900 dark:text-paper-100">
            {dict.auth.confirmPassword}
          </label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-400/20 bg-paper-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 dark:bg-ink-800"
          />
        </div>

        {error && <p className="text-sm text-rose-500">{error}</p>}

        <Button type="submit" className="w-full" isLoading={loading}>
          {dict.auth.signup}
        </Button>
      </form>

      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        {dict.auth.haveAccount}{" "}
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
