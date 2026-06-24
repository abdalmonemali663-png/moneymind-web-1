// src/app/[locale]/(app)/income/page.tsx
import { getDictionary, isValidLocale, type Locale } from "@/i18n/config";
import { notFound } from "next/navigation";
import { IncomeClient } from "./IncomeClient";

export default function IncomePage({ params }: { params: { locale: string } }) {
  if (!isValidLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  return <IncomeClient dict={getDictionary(locale)} locale={locale} />;
}
