// src/app/[locale]/(app)/dashboard/page.tsx
import { getDictionary, isValidLocale, type Locale } from "@/i18n/config";
import { notFound } from "next/navigation";
import { DashboardClient } from "./DashboardClient";

export default function DashboardPage({ params }: { params: { locale: string } }) {
  if (!isValidLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const dict = getDictionary(locale);

  return <DashboardClient dict={dict} locale={locale} />;
}
