// src/app/[locale]/(app)/savings/page.tsx
import { getDictionary, isValidLocale, type Locale } from "@/i18n/config";
import { notFound } from "next/navigation";
import { SavingsClient } from "./SavingsClient";

export default function SavingsPage({ params }: { params: { locale: string } }) {
  if (!isValidLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  return <SavingsClient dict={getDictionary(locale)} locale={locale} />;
}
