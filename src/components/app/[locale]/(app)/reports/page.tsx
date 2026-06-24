// src/app/[locale]/(app)/reports/page.tsx
import { getDictionary, isValidLocale, type Locale } from "@/i18n/config";
import { notFound } from "next/navigation";
import { ReportsClient } from "./ReportsClient";

export default function ReportsPage({ params }: { params: { locale: string } }) {
  if (!isValidLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  return <ReportsClient dict={getDictionary(locale)} locale={locale} />;
}
