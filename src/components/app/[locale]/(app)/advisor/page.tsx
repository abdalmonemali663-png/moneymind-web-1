// src/app/[locale]/(app)/advisor/page.tsx
import { getDictionary, isValidLocale, type Locale } from "@/i18n/config";
import { notFound } from "next/navigation";
import { AdvisorClient } from "./AdvisorClient";

export default function AdvisorPage({ params }: { params: { locale: string } }) {
  if (!isValidLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  return <AdvisorClient dict={getDictionary(locale)} locale={locale} />;
}
