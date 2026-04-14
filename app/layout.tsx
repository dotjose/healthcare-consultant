import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CareTriage AI — Clinical intake & triage",
  description:
    "Secure healthcare intake and structured triage summaries. Not a diagnostic system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={cn(sans.variable)}>
        <body className={cn("min-h-screen font-sans", sans.className)}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
