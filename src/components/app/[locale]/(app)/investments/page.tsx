// src/app/[locale]/(app)/investments/page.tsx
import { getDictionary, isValidLocale, type Locale } from "@/i18n/config";
import { notFound } from "next/navigation";
import { InvestmentsClient } from "./InvestmentsClient";

export default function InvestmentsPage({ params }: { params: { locale: string } }) {
  if (!isValidLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  return <InvestmentsClient dict={getDictionary(locale)} locale={locale} />;
}
