"use client";

import Link from "next/link";
import { useAuth, UserButton } from "@clerk/nextjs";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-card/90 shadow-[0_1px_0_0_rgba(15,23,42,0.04)] backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-[3.75rem] sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-3 font-heading text-base font-semibold tracking-tight text-foreground"
        >
          <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-sm font-bold text-primary-foreground shadow-md ring-1 ring-primary/20 transition group-hover:shadow-lg">
            CT
          </span>
          <span className="hidden sm:inline">CareTriage AI</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm text-muted-foreground sm:gap-2">
          <Link
            href="/pricing"
            className="hidden rounded-xl px-3 py-2 font-medium transition hover:bg-muted hover:text-foreground sm:inline"
          >
            Pricing
          </Link>
          {!isLoaded ? (
            <span className="h-9 w-28 animate-pulse rounded-xl bg-muted" aria-hidden />
          ) : isSignedIn ? (
            <div className="flex items-center gap-3 pl-1">
              <Link
                href="/dashboard"
                className="rounded-xl px-3 py-2 font-medium text-foreground transition hover:bg-muted"
              >
                Dashboard
              </Link>
              <UserButton />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/sign-in"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-muted-foreground")}
              >
                Sign in
              </Link>
              <Link href="/sign-up" className={cn(buttonVariants({ size: "sm" }), "shadow-sm")}>
                Get started
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
