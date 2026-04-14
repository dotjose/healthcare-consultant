import Link from "next/link";
import { Shield, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { PricingCards } from "@/components/PricingCards";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_100%_60%_at_50%_-10%,rgba(37,99,235,0.08),transparent)]" />
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-16">
          <header className="mx-auto max-w-2xl text-center">
            <h1 className="font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Simple, transparent pricing
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Start free. Move up when you need more volume, API access, or team features. No surprise
              tiers — cancel or change any time.
            </p>
          </header>

          <div className="mt-14 sm:mt-16">
            <PricingCards />
          </div>

          <div className="mx-auto mt-12 flex max-w-2xl flex-col gap-4 rounded-2xl border border-border/80 bg-muted/20 px-5 py-5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-center sm:gap-8 sm:py-4">
            <div className="flex items-center justify-center gap-2">
              <Shield className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span>JWT-verified sessions · HTTPS everywhere</span>
            </div>
            <div className="hidden h-4 w-px bg-border sm:block" aria-hidden />
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span>Structured reports · Not a diagnostic device</span>
            </div>
          </div>

          <section className="mx-auto mt-16 max-w-3xl rounded-2xl border border-border/80 bg-card p-8 shadow-sm sm:p-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <h2 className="font-heading text-xl font-semibold text-foreground">Enterprise & health systems</h2>
                <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                  Need HIPAA-aligned deployment, custom SLAs, SSO, or a dedicated success partner? We work
                  with security and clinical ops teams to fit your environment.
                </p>
              </div>
              <Link
                href="/sign-up"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "inline-flex h-11 shrink-0 self-start px-6",
                )}
              >
                Talk to us
              </Link>
            </div>
          </section>
        </div>
      </main>
      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} CareTriage AI · Intake support only
      </footer>
    </div>
  );
}
