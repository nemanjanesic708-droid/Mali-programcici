"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SidebarNav } from "@/app/components/sidebar-nav";

export function AppShell({
  children,
  showAdminLink = false
}: {
  children: React.ReactNode;
  showAdminLink?: boolean;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const root = document.documentElement;
    const savedTheme = window.localStorage.getItem("garancija-theme");
    const preferredTheme =
      savedTheme === "light" || savedTheme === "dark"
        ? savedTheme
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";

    root.dataset.theme = preferredTheme;
    setTheme(preferredTheme);
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("garancija-theme", nextTheme);
    setTheme(nextTheme);
  }

  if (isAuthPage) {
    return (
      <div className="auth-shell">
        <main className="auth-main">
          <div className="auth-brand">
            <div className="shell-topbar">
              <Link href="/" className="brand-mark">
                Garancija +
              </Link>
              <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label="Promeni temu">
                <span className="theme-toggle-icon" aria-hidden="true">
                  {theme === "dark" ? "☀" : "☾"}
                </span>
                <span>{theme === "dark" ? "Svetla tema" : "Tamna tema"}</span>
              </button>
            </div>
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
            <div className="shell-topbar">
              <Link href="/" className="brand-mark">
                Garancija +
              </Link>
              <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label="Promeni temu">
                <span className="theme-toggle-icon" aria-hidden="true">
                  {theme === "dark" ? "☀" : "☾"}
                </span>
                <span>{theme === "dark" ? "Svetla" : "Tamna"}</span>
              </button>
            </div>
            <p className="brand-subtitle">Jednostavan pregled garancija i racuna.</p>
          </div>
          <SidebarNav showAdminLink={showAdminLink} />
        </div>
      </aside>
      <main className="content-shell">
        <div className="content-inner">{children}</div>
      </main>
    </div>
  );
}
