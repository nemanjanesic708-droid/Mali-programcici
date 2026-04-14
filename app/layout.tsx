import type { Metadata } from "next";
import { AppShell } from "@/app/components/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Garancija +",
  description: "Pregled garancija, racuna i datuma isteka na jednom mestu."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sr-Latn">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
