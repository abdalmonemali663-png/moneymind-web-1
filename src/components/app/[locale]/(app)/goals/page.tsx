// src/app/[locale]/(app)/goals/page.tsx
import { getDictionary, isValidLocale, type Locale } from "@/i18n/config";
import { notFound } from "next/navigation";
import { GoalsClient } from "./GoalsClient";

export default function GoalsPage({ params }: { params: { locale: string } }) {
  if (!isValidLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  return <GoalsClient dict={getDictionary(locale)} locale={locale} />;
}
