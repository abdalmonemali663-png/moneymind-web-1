// src/app/[locale]/(app)/settings/page.tsx
import { getDictionary, isValidLocale, type Locale } from "@/i18n/config";
import { notFound } from "next/navigation";
import { SettingsClient } from "./SettingsClient";

export default function SettingsPage({ params }: { params: { locale: string } }) {
  if (!isValidLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  return <SettingsClient dict={getDictionary(locale)} locale={locale} />;
}
