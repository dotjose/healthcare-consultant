"use client";

import { Copy, IdCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  patientId: string;
  cardNumber?: string | null;
  className?: string;
  compact?: boolean;
};

export function PatientIdentityBar({ patientId, cardNumber, className, compact }: Props) {
  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
  }

  if (compact) {
    return (
      <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-1 text-xs", className)}>
        <span className="text-muted-foreground">ID</span>
        <span className="font-mono font-semibold text-foreground">{patientId}</span>
        {cardNumber ? (
          <>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">Card</span>
            <span className="font-mono font-medium text-foreground">{cardNumber}</span>
          </>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-4 rounded-2xl border border-border/80 bg-gradient-to-br from-card to-muted/20 p-5 shadow-sm sm:grid-cols-2",
        className,
      )}
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <IdCard className="h-4 w-4" aria-hidden />
          </span>
          Patient intake ID
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="break-all font-mono text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            {patientId}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 shrink-0 gap-1.5 text-xs"
            onClick={() => void copy(patientId)}
          >
            <Copy className="h-3.5 w-3.5" />
            Copy
          </Button>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          System reference for this intake. Not a national identifier.
        </p>
      </div>
      <div className="space-y-2 border-t border-border/60 pt-4 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Card / MRN (optional)
        </p>
        {cardNumber ? (
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-mono text-lg font-semibold text-foreground sm:text-xl">{cardNumber}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 shrink-0 gap-1.5 text-xs"
              onClick={() => void copy(cardNumber)}
            >
              <Copy className="h-3.5 w-3.5" />
              Copy
            </Button>
          </div>
        ) : (
          <p className="text-sm italic text-muted-foreground">None provided at intake.</p>
        )}
      </div>
    </div>
  );
}
