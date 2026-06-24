export const dynamic = 'force-dynamic';
// src/app/[locale]/(auth)/login/page.tsx
import { getDictionary, isValidLocale, type Locale } from "@/i18n/config";
import { notFound } from "next/navigation";
import { LoginClient } from "./LoginClient";

export default function LoginPage({ params }: { params: { locale: string } }) {
  if (!isValidLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  return <LoginClient dict={getDictionary(locale)} locale={locale} />;
}
