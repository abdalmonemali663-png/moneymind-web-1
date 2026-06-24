// src/lib/supabase/client.ts
// عميل Supabase للاستخدام داخل Client Components فقط.
// يحترم RLS بالكامل عبر مفتاح anon + جلسة المستخدم المخزنة في الكوكيز.

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
