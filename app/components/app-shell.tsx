"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarNav } from "@/app/components/sidebar-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isAuthPage) {
    return (
      <div className="auth-shell">
        <main className="auth-main">
          <div className="auth-brand">
            <Link href="/" className="brand-mark">
              Garancija +
            </Link>
            <p className="brand-subtitle">Prijava i registracija za tvoje garancije.</p>
          </div>
          <div className="auth-card">{children}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-inner">
          <div className="sidebar-brand">
            <Link href="/" className="brand-mark">
              Garancija +
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
  );
}
