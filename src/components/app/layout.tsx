// src/app/layout.tsx
// Layout الجذري — لا يعرض شيئاً مباشرة، فقط يمرر children.
// التوجيه الفعلي للغة يتم عبر middleware + [locale] segment.

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MoneyMind AI",
  description: "منصة مالية ذكية لإدارة دخلك، مصروفاتك، ادخارك واستثماراتك",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
