// src/app/auth/callback/route.ts
// Route Handler يُستدعى بعد عودة المستخدم من Google/Apple OAuth أو من رابط
// تأكيد البريد. يُحوّل "code" إلى جلسة حقيقية عبر Supabase، ثم يُعيد التوجيه.

import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectTo = searchParams.get("redirect_to") ?? "/ar/dashboard";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  }

  return NextResponse.redirect(`${origin}/ar/login?error=auth_callback_failed`);
}
