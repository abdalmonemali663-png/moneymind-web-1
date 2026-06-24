// src/app/[locale]/(auth)/forgot-password/page.tsx
import { getDictionary, isValidLocale, type Locale } from "@/i18n/config";
import { notFound } from "next/navigation";
import { ForgotPasswordClient } from "./ForgotPasswordClient";

export default function ForgotPasswordPage({ params }: { params: { locale: string } }) {
  if (!isValidLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  return <ForgotPasswordClient dict={getDictionary(locale)} locale={locale} />;
}
