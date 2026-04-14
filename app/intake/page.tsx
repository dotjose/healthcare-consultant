import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { IntakeForm } from "@/components/IntakeForm";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function IntakePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/15 to-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="mb-1 font-mono text-xs font-medium text-primary">Intake</p>
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
              New intake
            </h1>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
              Submit symptoms for a structured, non-diagnostic report. A unique patient intake ID is
              created when you generate the report.
            </p>
          </div>
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: "outline" }), "inline-flex h-10 shrink-0 shadow-sm")}
          >
            Back
          </Link>
        </div>

        <Card className="border-border/80 shadow-xl shadow-slate-900/5">
          <CardHeader className="space-y-2 border-b border-border/50 bg-muted/15 pb-6">
            <CardTitle className="font-heading text-xl">Clinical intake</CardTitle>
            <CardDescription className="text-base leading-relaxed">
              Be specific about onset, quality, and context. This tool does not replace emergency care —
              call emergency services if you have an emergency.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <IntakeForm />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
