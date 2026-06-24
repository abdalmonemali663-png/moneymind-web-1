"use client";

// src/app/[locale]/(app)/reports/ReportsClient.tsx
// إنشاء وعرض التقارير المالية. تستدعي Edge Function "generate-report"
// الحقيقية التي تنتج PDF فعلياً وترفعه لـ Supabase Storage.

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/format";
import type { Dictionary } from "@/i18n/dictionaries/ar";
import type { Locale } from "@/i18n/config";
import type { Report } from "@/types/database";
import { FileText, Download } from "lucide-react";

const FUNCTIONS_BASE_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1`;

function firstDayOfMonth(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ReportsClient({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodStart, setPeriodStart] = useState(firstDayOfMonth());
  const [periodEnd, setPeriodEnd] = useState(today());
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadReports() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("reports")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setReports(data ?? []);
    setLoading(false);
  }

  async function handleGenerate() {
    setGenerating(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("UNAUTHORIZED");

      const res = await fetch(`${FUNCTIONS_BASE_URL}/generate-report`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ period_start: periodStart, period_end: periodEnd }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error ?? dict.common.error);
      }

      const data: { download_url: string } = await res.json();
      window.open(data.download_url, "_blank");
      await loadReports();
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.common.error);
    } finally {
      setGenerating(false);
    }
  }

  async function handleDownload(report: Report) {
    if (!report.file_path) return;
    const { data } = await supabase.storage
      .from("reports")
      .createSignedUrl(report.file_path, 3600);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-paper-100">
        {dict.reports.title}
      </h1>

      <Card>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              {dict.reports.periodStart}
            </label>
            <input
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              className="w-full rounded-xl border border-slate-400/20 bg-paper-50 px-3 py-2.5 text-sm dark:bg-ink-700"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              {dict.reports.periodEnd}
            </label>
            <input
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              className="w-full rounded-xl border border-slate-400/20 bg-paper-50 px-3 py-2.5 text-sm dark:bg-ink-700"
            />
          </div>
          <div className="flex items-end">
            <Button onClick={handleGenerate} isLoading={generating} className="w-full">
              {dict.reports.generateReport}
            </Button>
          </div>
        </div>
        {error && <p className="mt-3 text-sm text-rose-500">{error}</p>}
      </Card>

      {loading ? (
        <div className="h-32 animate-pulse rounded-card bg-paper-200 dark:bg-ink-700" />
      ) : reports.length === 0 ? (
        <EmptyState icon={FileText} message={dict.reports.noReports} />
      ) : (
        <div className="space-y-2">
          {reports.map((report) => (
            <Card key={report.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-ink-900 dark:text-paper-100">
                  {report.title}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {formatDate(report.period_start, locale)} —{" "}
                  {formatDate(report.period_end, locale)}
                </p>
              </div>
              <button
                onClick={() => handleDownload(report)}
                className="flex items-center gap-1.5 rounded-pill bg-paper-200 px-3 py-1.5 text-sm font-medium text-ink-900 hover:bg-paper-300 dark:bg-ink-700 dark:text-paper-100"
              >
                <Download className="h-3.5 w-3.5" />
                {dict.reports.download}
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
