"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { ReportView } from "@/components/ReportView";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getReport, type ReportDetail } from "@/lib/api";

export default function ReportDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { getToken, isLoaded } = useAuth();
  const [data, setData] = useState<ReportDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !id) return;
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        const res = await getReport(token, id);
        if (!cancelled) setData(res);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load report.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [getToken, id, isLoaded]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/15 to-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="mb-1 font-mono text-xs font-medium text-primary">Report</p>
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
              Intake report
            </h1>
            {data ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {new Date(data.created_at).toLocaleString()}
              </p>
            ) : null}
          </div>
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: "outline" }), "inline-flex shadow-sm")}
          >
            All reports
          </Link>
        </div>

        {error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        ) : null}

        {!data && !error ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading report...
          </div>
        ) : null}

        {data ? (
          <ReportView
            report={data.report}
            patientId={data.patient_id}
            patientCardNumber={data.intake.patient_card_number}
          />
        ) : null}
      </main>
    </div>
  );
}
