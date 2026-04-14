import type { Metadata } from "next";
import { AppShell } from "@/app/components/app-shell";
import { hasAdminSession } from "@/lib/admin-auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "Garancija +",
  description: "Pregled garancija, racuna i datuma isteka na jednom mestu."
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const showAdminLink = await hasAdminSession();

  return (
    <html lang="sr-Latn" suppressHydrationWarning>
      <body>
        <AppShell showAdminLink={showAdminLink}>{children}</AppShell>
      </body>
    </html>
  );
}
