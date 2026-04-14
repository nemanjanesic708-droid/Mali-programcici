import type { Metadata } from "next";
import Link from "next/link";
import { SidebarNav } from "@/app/components/sidebar-nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Warranty Tracker",
  description: "Pregled garancija, racuna i datuma isteka na jednom mestu."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sr-Latn">
      <body>
        <div className="app-shell">
          <aside className="sidebar">
            <div className="sidebar-inner">
              <div className="sidebar-brand">
                <Link href="/" className="brand-mark">
                  Warranty Tracker
                </Link>
                <p className="brand-subtitle">Jednostavan pregled garancija i racuna.</p>
              </div>
              <SidebarNav />
            </div>
          </aside>
          <main className="content-shell">
            <div className="content-inner">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
