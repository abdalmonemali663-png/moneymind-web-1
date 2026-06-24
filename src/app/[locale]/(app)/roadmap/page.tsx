// src/app/[locale]/(app)/roadmap/page.tsx
import { getDictionary, isValidLocale, type Locale } from "@/i18n/config";
import { notFound } from "next/navigation";
import { RoadmapClient } from "./RoadmapClient";

export default function RoadmapPage({ params }: { params: { locale: string } }) {
  if (!isValidLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  return <RoadmapClient dict={getDictionary(locale)} locale={locale} />;
}
