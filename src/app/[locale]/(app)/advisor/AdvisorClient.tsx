"use client";

// src/app/[locale]/(app)/advisor/AdvisorClient.tsx
// واجهة المحادثة مع المستشار المالي الذكي. تستدعي Edge Function الحقيقية
// "ai-financial-advisor" (انظر moneymind-functions) عبر fetch مباشر مع
// JWT المستخدم — لا توجد أي ردود مكتوبة مسبقاً أو محاكاة محلية للذكاء
// الاصطناعي في هذا الملف.

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Dictionary } from "@/i18n/dictionaries/ar";
import type { Locale } from "@/i18n/config";
import type { AiChatMessage } from "@/types/database";
import { Send, Sparkles } from "lucide-react";
import { clsx } from "clsx";

const FUNCTIONS_BASE_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1`;

export function AdvisorClient({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const supabase = createClient();

  useEffect(() => {
    loadLatestSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  async function loadLatestSession() {
    setLoadingHistory(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoadingHistory(false);
      return;
    }

    const { data: sessions } = await supabase
      .from("ai_chat_sessions")
      .select("id")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1);

    const latestSessionId = sessions?.[0]?.id ?? null;
    setSessionId(latestSessionId);

    if (latestSessionId) {
      const { data: history } = await supabase
        .from("ai_chat_messages")
        .select("*")
        .eq("session_id", latestSessionId)
        .order("created_at", { ascending: true });
      setMessages(history ?? []);
    }

    setLoadingHistory(false);
  }

  function startNewChat() {
    setSessionId(null);
    setMessages([]);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    setError(null);
    setSending(true);
    setInput("");

    // إضافة فورية للرسالة في الواجهة (optimistic) — الرسالة الحقيقية
    // تُحفظ في القاعدة من داخل الـ Edge Function نفسها.
    const optimisticMessage: AiChatMessage = {
      id: `optimistic-${Date.now()}`,
      session_id: sessionId ?? "",
      user_id: "",
      role: "user",
      content: trimmed,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("UNAUTHORIZED");

      const res = await fetch(`${FUNCTIONS_BASE_URL}/ai-financial-advisor`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ session_id: sessionId, message: trimmed }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error ?? `HTTP ${res.status}`);
      }

      const data: { session_id: string; reply: string } = await res.json();
      setSessionId(data.session_id);

      setMessages((prev) => [
        ...prev,
        {
          id: `reply-${Date.now()}`,
          session_id: data.session_id,
          user_id: "",
          role: "assistant",
          content: data.reply,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.common.error);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col lg:h-[calc(100vh-4rem)]">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-paper-100">
          {dict.advisor.title}
        </h1>
        <Button variant="secondary" size="sm" onClick={startNewChat}>
          {dict.advisor.newChat}
        </Button>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto pb-4">
        {loadingHistory ? (
          <div className="h-32 animate-pulse rounded-card bg-paper-200 dark:bg-ink-700" />
        ) : messages.length === 0 ? (
          <EmptyState icon={Sparkles} message={dict.advisor.insufficientData} />
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={clsx(
                "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                msg.role === "user"
                  ? "ms-auto bg-emerald-600 text-white"
                  : "me-auto bg-paper-200 text-ink-900 dark:bg-ink-700 dark:text-paper-100",
              )}
            >
              {msg.content}
            </div>
          ))
        )}

        {sending && (
          <div className="me-auto max-w-[85%] rounded-2xl bg-paper-200 px-4 py-2.5 text-sm text-slate-500 dark:bg-ink-700 dark:text-slate-400">
            {dict.advisor.thinking}
          </div>
        )}
      </div>

      {error && <p className="mb-2 text-sm text-rose-500">{error}</p>}

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={dict.advisor.placeholder}
          disabled={sending}
          className="flex-1 rounded-pill border border-slate-400/20 bg-paper-50 px-4 py-3 text-sm outline-none focus:border-emerald-500 dark:bg-ink-800"
        />
        <Button type="submit" size="md" isLoading={sending} disabled={!input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
