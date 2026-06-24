// src/lib/format.ts
// أدوات تنسيق العملة والأرقام والتواريخ — حساسة للغة (ar/en) ولا تحتوي
// على أي قيم مالية ثابتة، فقط منطق عرض.

import type { CurrencyCode } from "@/types/database";
import type { Locale } from "@/i18n/config";

const CURRENCY_LOCALE_MAP: Record<CurrencyCode, string> = {
  EGP: "ar-EG",
  USD: "en-US",
  EUR: "de-DE",
  GBP: "en-GB",
  SAR: "ar-SA",
  AED: "ar-AE",
};

export function formatCurrency(
  amount: number,
  currency: CurrencyCode,
  uiLocale: Locale = "ar",
): string {
  const formatLocale = uiLocale === "ar" ? "ar-EG" : "en-US";
  try {
    return new Intl.NumberFormat(formatLocale, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(amount);
  } catch {
    // fallback آمن إن لم يدعم المتصفح رمز العملة
    return `${amount.toLocaleString(formatLocale)} ${currency}`;
  }
}

export function formatNumber(value: number, uiLocale: Locale = "ar"): string {
  const formatLocale = uiLocale === "ar" ? "ar-EG" : "en-US";
  return new Intl.NumberFormat(formatLocale, {
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercentage(value: number, uiLocale: Locale = "ar"): string {
  const formatLocale = uiLocale === "ar" ? "ar-EG" : "en-US";
  return new Intl.NumberFormat(formatLocale, {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value / 100);
}

export function formatDate(dateStr: string, uiLocale: Locale = "ar"): string {
  const formatLocale = uiLocale === "ar" ? "ar-EG" : "en-US";
  return new Intl.DateTimeFormat(formatLocale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(dateStr));
}

export function formatMonthLabel(dateStr: string, uiLocale: Locale = "ar"): string {
  const formatLocale = uiLocale === "ar" ? "ar-EG" : "en-US";
  return new Intl.DateTimeFormat(formatLocale, {
    year: "numeric",
    month: "short",
  }).format(new Date(dateStr));
}

export const CURRENCIES: CurrencyCode[] = ["EGP", "USD", "EUR", "GBP", "SAR", "AED"];
