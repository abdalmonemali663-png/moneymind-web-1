// src/lib/supabase/server.ts
// عميل Supabase للاستخدام داخل Server Components, Route Handlers, و
// Server Actions. يقرأ/يكتب الجلسة عبر كوكيز Next.js، ويحترم RLS بالكامل
// (مفتاح anon فقط — لا يُستخدم service_role هنا أبداً).

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

export function createClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // يحدث عند الاستدعاء من Server Component بدون إمكانية الكتابة؛
            // middleware.ts يتولى تحديث الجلسة في هذه الحالة.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // نفس الملاحظة أعلاه.
          }
        },
      },
    },
  );
}
