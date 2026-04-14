import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto flex max-w-lg flex-col items-center px-4 py-16">
        <SignUp
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-lg border border-slate-200",
            },
          }}
          signInUrl="/sign-in"
          forceRedirectUrl="/dashboard"
        />
        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </main>
    </div>
  );
}
