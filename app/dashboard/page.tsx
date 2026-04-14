"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Loader2, Plus } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { PatientIdentityBar } from "@/components/PatientIdentityBar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { listReports, type ReportListItem, type TriageLevel } from "@/lib/api";

const triageBadge: Record<TriageLevel, string> = {
  low: "border-emerald-300/80 bg-emerald-50 text-emerald-900",
  medium: "border-amber-300/80 bg-amber-50 text-amber-950",
  high: "border-orange-300/80 bg-orange-50 text-orange-950",
  emergency: "border-red-300/80 bg-red-50 text-red-950",
};

export default function DashboardPage() {
  const { getToken, isLoaded } = useAuth();
  const [reports, setReports] = useState<ReportListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        const data = await listReports(token);
        if (!cancelled) setReports(data);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load reports.");
          setReports([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [getToken, isLoaded]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/15 to-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 font-mono text-xs font-medium text-primary">Workspace</p>
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
              Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">Recent intakes and patient references.</p>
          </div>
          <Link
            href="/intake"
            className={cn(buttonVariants(), "inline-flex h-11 gap-2 px-5 shadow-md")}
          >
            <Plus className="h-4 w-4" />
            New intake
          </Link>
        </div>

        {error ? (
          <p className="mb-6 rounded-xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            {error}{" "}
            <span className="text-muted-foreground">
              Ensure the API is running and{" "}
              <code className="rounded-md bg-card px-1.5 py-0.5 text-xs">NEXT_PUBLIC_API_URL</code> is
              set.
            </span>
          </p>
        ) : null}

        {reports === null ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading reports...
          </div>
        ) : reports.length === 0 ? (
          <Card className="border-dashed border-border/80 bg-muted/10">
            <CardHeader>
              <CardTitle>No reports yet</CardTitle>
              <CardDescription>Start your first intake to see structured triage output here.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/intake" className={cn(buttonVariants(), "inline-flex shadow-sm")}>
                Create intake
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5">
            {reports.map((r) => (
              <Link key={r.id} href={`/reports/${r.id}`}>
                <Card className="border-border/80 transition hover:border-primary/30 hover:shadow-lg">
                  <CardHeader className="space-y-4">
                    <div className="flex flex-row items-start justify-between gap-4">
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="text-xs text-muted-foreground">
                          {new Date(r.created_at).toLocaleString()}
                        </p>
                        <PatientIdentityBar
                          compact
                          patientId={r.patient_id}
                          cardNumber={r.patient_card_number}
                        />
                        <CardDescription className="line-clamp-2 pt-1 text-foreground/80">
                          {r.symptoms_preview}
                        </CardDescription>
                      </div>
                      <Badge className={triageBadge[r.triage_level]} variant="outline">
                        {r.triage_level}
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
