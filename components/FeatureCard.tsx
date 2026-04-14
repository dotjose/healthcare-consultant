import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type FeatureItem = {
  title: string;
  description: string;
  icon: LucideIcon;
};

type Props = FeatureItem & {
  className?: string;
};

/**
 * Compact capability card — icon, title, copy only. No decorative numbers or overlapping layers.
 */
export function FeatureCard({ title, description, icon: Icon, className }: Props) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition-colors",
        "hover:border-border hover:bg-card hover:shadow-md",
        className,
      )}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/10">
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <div className="space-y-2">
        <h3 className="font-heading text-base font-semibold leading-snug tracking-tight text-foreground">
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
