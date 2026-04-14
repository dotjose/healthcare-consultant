import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto flex max-w-lg flex-col items-center px-4 py-16">
        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-lg border border-slate-200",
            },
          }}
          signUpUrl="/sign-up"
          forceRedirectUrl="/dashboard"
        />
        <p className="mt-6 text-center text-sm text-slate-600">
          No account?{" "}
          <Link href="/sign-up" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </main>
    </div>
  );
}
