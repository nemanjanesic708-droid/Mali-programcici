"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

const NAV_ITEMS: NavItem[] = [
  {
    href: "/items/new",
    label: "Novi unos",
    icon: (
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <path d="M10 4v12M4 10h12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    )
  },
  {
    href: "/",
    label: "Moje garancije",
    icon: (
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <rect x="4" y="4" width="12" height="12" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M7 8h6M7 11h6M7 14h4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    )
  },
  {
    href: "/profile",
    label: "Profil",
    icon: (
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <circle cx="10" cy="7" r="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M4.5 16c1.1-2.3 3-3.5 5.5-3.5s4.4 1.2 5.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    )
  }
];

const ADMIN_NAV_ITEM: NavItem = {
  href: "/admin",
  label: "Admin",
  icon: (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M10 3l5.5 2v4.5c0 3.3-2.2 5.7-5.5 7.5C6.7 15.2 4.5 12.8 4.5 9.5V5L10 3Z" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 9.8l1.4 1.4 2.8-3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
};

export function SidebarNav({ showAdminLink = false }: { showAdminLink?: boolean }) {
  const pathname = usePathname();
  const items = showAdminLink ? [...NAV_ITEMS, ADMIN_NAV_ITEM] : NAV_ITEMS;

  return (
    <nav className="sidebar-nav" aria-label="Glavna navigacija">
      {items.map((item) => {
        const isActive =
          item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-link${isActive ? " sidebar-link-active" : ""}`}
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
