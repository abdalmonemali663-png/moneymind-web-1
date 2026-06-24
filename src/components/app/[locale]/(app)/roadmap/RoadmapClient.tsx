"use client";

// src/app/[locale]/(app)/roadmap/RoadmapClient.tsx
// خريطة بناء الثروة. تستدعي Edge Function "generate-wealth-roadmap"
// الحقيقية. إذا رفضت الدالة التوليد (422 INSUFFICIENT_DATA)، نعرض رسالة
// واضحة تطلب من المستخدم استكمال بياناته — لا نولّد خريطة محلياً كبديل.

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/format";
import { useUser } from "@/hooks/useUser";
import type { Dictionary } from "@/i18n/dictionaries/ar";
import type { Locale } from "@/i18n/config";
import type { WealthRoadmap } from "@/types/database";
import { Map, AlertTriangle, Lightbulb, Flag } from "lucide-react";
import { clsx } from "clsx";

const FUNCTIONS_BASE_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1`;
const HORIZONS: Array<1 | 3 | 5 | 10> = [1, 3, 5, 10];

export function RoadmapClient({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const { profile } = useUser();
  const [horizon, setHorizon] = useState<1 | 3 | 5 | 10>(5);
  const [roadmap, setRoadmap] = useState<WealthRoadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();
  const currency = profile?.preferred_currency ?? "EGP";

  useEffect(() => {
    loadExistingRoadmap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [horizon]);

  async function loadExistingRoadmap() {
    setLoading(true);
    setError(null);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("wealth_roadmaps")
      .select("*")
      .eq("user_id", user.id)
      .eq("horizon_years", horizon)
      .eq("is_current", true)
      .maybeSingle();

    setRoadmap(data ?? null);
    setLoading(false);
  }

  async function handleGenerate() {
    setGenerating(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("UNAUTHORIZED");

      const res = await fetch(`${FUNCTIONS_BASE_URL}/generate-wealth-roadmap`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ horizon_years: horizon }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        if (res.status === 422) {
          setError(dict.roadmap.insufficientData);
        } else {
          setError(errBody.error ?? dict.common.error);
        }
        setGenerating(false);
        return;
      }

      const data: WealthRoadmap = await res.json();
      setRoadmap(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.common.error);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-paper-100">
          {dict.roadmap.title}
        </h1>
        <Button onClick={handleGenerate} isLoading={generating} size="sm">
          {roadmap ? dict.roadmap.regenerate : dict.roadmap.generate}
        </Button>
      </div>

      <div className="flex gap-2">
        {HORIZONS.map((h) => (
          <button
            key={h}
            onClick={() => setHorizon(h)}
            className={clsx(
              "rounded-pill px-4 py-2 text-sm font-medium transition-colors",
              horizon === h
                ? "bg-emerald-600 text-white"
                : "bg-paper-200 text-slate-600 hover:bg-paper-300 dark:bg-ink-700 dark:text-slate-300",
            )}
          >
            {dict.roadmap[`horizon${h}` as "horizon1" | "horizon3" | "horizon5" | "horizon10"]}
          </button>
        ))}
      </div>

      {error && (
        <Card className="border-amber-500/30 bg-amber-50 dark:bg-amber-950/20">
          <p className="text-sm text-amber-700 dark:text-amber-400">{error}</p>
        </Card>
      )}

      {loading ? (
        <div className="h-60 animate-pulse rounded-card bg-paper-200 dark:bg-ink-700" />
      ) : !roadmap ? (
        <EmptyState icon={Map} message={dict.roadmap.insufficientData} />
      ) : (
        <div className="space-y-4">
          <Card>
            <p className="text-sm leading-relaxed text-ink-900 dark:text-paper-100">
              {roadmap.roadmap_json.summary}
            </p>
          </Card>

          <div>
            <h2 className="mb-3 flex items-center gap-2 font-display text-base font-semibold text-ink-900 dark:text-paper-100">
              <Flag className="h-4 w-4 text-emerald-600" />
              {dict.roadmap.milestones}
            </h2>
            <div className="space-y-3">
              {roadmap.roadmap_json.milestones.map((m) => (
                <Card key={m.year}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      {locale === "ar" ? `السنة ${m.year}` : `Year ${m.year}`}
                    </span>
                    <span className="font-tabular text-sm font-medium text-ink-900 dark:text-paper-100">
                      {formatCurrency(m.target_net_worth_estimate, currency, locale)}
                    </span>
                  </div>
                  <h3 className="mb-2 font-medium text-ink-900 dark:text-paper-100">
                    {m.title}
                  </h3>
                  <ul className="list-inside list-disc space-y-1 text-sm text-slate-500 dark:text-slate-400">
                    {m.key_actions.map((action, i) => (
                      <li key={i}>{action}</li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <h2 className="mb-3 flex items-center gap-2 font-display text-base font-semibold text-ink-900 dark:text-paper-100">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                {dict.roadmap.risks}
              </h2>
              <ul className="list-inside list-disc space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
                {roadmap.roadmap_json.risks.map((risk, i) => (
                  <li key={i}>{risk}</li>
                ))}
              </ul>
            </Card>

            <Card>
              <h2 className="mb-3 flex items-center gap-2 font-display text-base font-semibold text-ink-900 dark:text-paper-100">
                <Lightbulb className="h-4 w-4 text-emerald-600" />
                {dict.roadmap.recommendations}
              </h2>
              <ul className="list-inside list-disc space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
                {roadmap.roadmap_json.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
