"use client";

// src/hooks/useUser.ts
// يجلب المستخدم الحالي وملفه الشخصي من Supabase. لا توجد بيانات افتراضية:
// إن لم يوجد ملف شخصي مكتمل، تُرجع profile = null والمكوّن المستهلك
// يقرر ماذا يعرض (مثلاً توجيه لإكمال onboarding).

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";
import type { User } from "@supabase/supabase-js";

interface UseUserResult {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useUser(): UseUserResult {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  async function load() {
    setLoading(true);
    setError(null);

    const { data: { user: currentUser }, error: userError } = await supabase.auth
      .getUser();

    if (userError || !currentUser) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    setUser(currentUser);

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", currentUser.id)
      .maybeSingle();

    if (profileError) {
      setError(profileError.message);
    } else {
      setProfile(profileData);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();

    const { data: subscription } = supabase.auth.onAuthStateChange(() => {
      load();
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { user, profile, loading, error, refresh: load };
}
