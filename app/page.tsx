import Link from "next/link";
import { ArrowRight, ClipboardList, Lock, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { FeatureCard } from "@/components/FeatureCard";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Structured triage reports",
    description:
      "AI-assisted summaries with validated JSON, triage bands, and patient-facing notes — with parse retries when the model output needs another pass.",
    icon: Sparkles,
  },
  {
    title: "Verified identity end to end",
    description:
      "Dashboard routes stay behind auth; the API trusts signed session JWTs so user identity is consistent from browser to backend.",
    icon: Lock,
  },
  {
    title: "Patient references on every artifact",
    description:
      "Each intake gets a clear patient intake ID, with an optional card or MRN-style field so teams can align reports with your workflow.",
    icon: ClipboardList,
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(37,99,235,0.12),transparent)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_bottom,transparent,oklch(0.985_0.008_250))]" />
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border/60">
          <div className="absolute inset-0 bg-[linear-gradient(105deg,oklch(0.99_0.01_250)_0%,transparent_45%),linear-gradient(-15deg,rgba(37,99,235,0.04),transparent)]" />
          <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:py-28">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
                Clinical intake · Not diagnostic
              </div>
              <h1 className="font-heading text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem]">
                Intake that clinicians can{" "}
                <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  trust at a glance
                </span>
                .
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
                Structured symptoms, safety-aware triage bands, and a clear patient reference on every
                report — so your team spends less time decoding notes and more time on care.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/sign-up"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "inline-flex h-11 px-6 shadow-lg shadow-primary/25",
                  )}
                >
                  Start free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/pricing"
                  className={cn(
                    buttonVariants({ size: "lg", variant: "outline" }),
                    "inline-flex h-11 border-border/80 bg-card px-6",
                  )}
                >
                  See pricing
                </Link>
              </div>
              <p className="max-w-lg text-xs leading-relaxed text-muted-foreground">
                Educational intake support only. Not for emergencies — call your local emergency number if
                you need immediate help.
              </p>
            </div>
            <div className="relative lg:pl-2">
              <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-2xl shadow-slate-900/10 ring-1 ring-slate-900/[0.04]">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Sample intake header
                </p>
                <div className="mt-4 space-y-3 rounded-2xl border border-dashed border-primary/25 bg-muted/30 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Patient intake ID
                  </p>
                  <p className="font-mono text-lg font-semibold tracking-tight text-foreground">
                    CT-P-20260414-A1B2C3D4
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Card / MRN
                  </p>
                  <p className="font-mono text-sm text-muted-foreground">Optional · e.g. MRN-48291</p>
                </div>
                <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                  Triage band + red flags surfaced in one view
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border/40 bg-muted/15">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Built for real clinical workflows
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                Authentication, structured outputs, and traceable patient references — without decorative
                noise in the UI.
              </p>
            </div>
            <div className="mx-auto mt-14 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {features.map((f) => (
                <FeatureCard key={f.title} {...f} />
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border/60 bg-muted/25 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-col items-start justify-between gap-10 rounded-3xl border border-border/80 bg-card p-8 shadow-xl shadow-slate-900/5 sm:p-10 md:flex-row md:items-center">
              <div className="space-y-3">
                <h3 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
                  Ready to modernize intake?
                </h3>
                <p className="max-w-xl text-muted-foreground leading-relaxed">
                  Create an account, run an intake, and review a formatted report with a patient reference
                  in minutes.
                </p>
              </div>
              <Link
                href="/sign-up"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "inline-flex h-12 shrink-0 px-8 shadow-lg shadow-primary/20",
                )}
              >
                Create account
              </Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-border/60 bg-card py-10 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} CareTriage AI. Intake support only — not for emergency use.
      </footer>
    </div>
  );
}
