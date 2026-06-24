// src/app/[locale]/layout.tsx
import type { Metadata } from "next";
import { isValidLocale, localeDirection, locales, type Locale } from "@/i18n/config";
import { notFound } from "next/navigation";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "MoneyMind AI",
  description: "Your AI-powered financial freedom platform",
};

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!isValidLocale(params.locale)) {
    notFound();
  }

  const locale = params.locale as Locale;
  const dir = localeDirection[locale];

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
