// src/app/[locale]/(app)/expenses/page.tsx
import { getDictionary, isValidLocale, type Locale } from "@/i18n/config";
import { notFound } from "next/navigation";
import { ExpensesClient } from "./ExpensesClient";

export default function ExpensesPage({ params }: { params: { locale: string } }) {
  if (!isValidLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  return <ExpensesClient dict={getDictionary(locale)} locale={locale} />;
}
