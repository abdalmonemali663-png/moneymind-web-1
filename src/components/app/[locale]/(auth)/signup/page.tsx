// src/app/[locale]/(auth)/signup/page.tsx
import { getDictionary, isValidLocale, type Locale } from "@/i18n/config";
import { notFound } from "next/navigation";
import { SignupClient } from "./SignupClient";

export default function SignupPage({ params }: { params: { locale: string } }) {
  if (!isValidLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  return <SignupClient dict={getDictionary(locale)} locale={locale} />;
}
