import Link from "next/link";
import { Check } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "per month",
    description: "Explore structured intake and triage reports on your own.",
    features: [
      "20 intakes per month",
      "Structured triage report & patient ID",
      "Dashboard & report history",
    ],
    cta: "Start free",
    href: "/sign-up",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    description: "Higher volume and API access for clinicians and builders.",
    features: [
      "500 intakes per month",
      "REST API access",
      "Email support",
      "Everything in Free",
    ],
    cta: "Get Pro",
    href: "/sign-up",
    highlighted: true,
  },
  {
    name: "Clinic",
    price: "$99",
    period: "per month",
    description: "Small teams that need shared workflows and priority help.",
    features: [
      "Multi-seat workspace",
      "Usage & analytics",
      "Priority support",
      "Everything in Pro",
    ],
    cta: "Contact sales",
    href: "/sign-up",
    highlighted: false,
  },
];

export function PricingCards() {
  return (
    <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3 md:gap-5 lg:gap-6">
      {tiers.map((tier) => (
        <div
          key={tier.name}
          className={cn(
            "flex flex-col rounded-2xl border p-6 sm:p-8",
            tier.highlighted
              ? "relative border-primary/30 bg-gradient-to-b from-primary/[0.05] to-card shadow-xl shadow-primary/[0.12] ring-1 ring-primary/20 md:scale-[1.02] md:py-9"
              : "border-border/80 bg-card shadow-sm",
          )}
        >
          {tier.highlighted ? (
            <span className="mb-4 inline-flex w-fit rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-primary">
              Recommended
            </span>
          ) : (
            <span className="mb-4 block h-[26px]" aria-hidden />
          )}

          <h2 className="font-heading text-xl font-semibold text-foreground">{tier.name}</h2>
          <p className="mt-2 min-h-[3rem] text-sm leading-relaxed text-muted-foreground">{tier.description}</p>

          <div className="mt-6 border-b border-border/70 pb-6">
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-[2.75rem]">
                {tier.price}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{tier.period}</p>
          </div>

          <ul className="mt-6 flex flex-1 flex-col gap-3 text-sm text-foreground/90">
            {tier.features.map((f) => (
              <li key={f} className="flex gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Check className="h-3 w-3 text-primary" strokeWidth={2.5} aria-hidden />
                </span>
                <span className="leading-snug">{f}</span>
              </li>
            ))}
          </ul>

          <Link
            href={tier.href}
            className={cn(
              buttonVariants({ variant: tier.highlighted ? "default" : "outline" }),
              "mt-8 inline-flex h-11 w-full justify-center font-medium",
            )}
          >
            {tier.cta}
          </Link>
        </div>
      ))}
    </div>
  );
}
