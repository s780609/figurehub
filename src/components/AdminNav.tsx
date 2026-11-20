"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", label: "模型", icon: "box" },
  { href: "/admin/preorders", label: "預購", icon: "clock" },
  { href: "/admin/generate", label: "刊登", icon: "file-text" },
] as const;

function NavIcon({ name }: { name: string }) {
  switch (name) {
    case "box":
      return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      );
    case "clock":
      return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6l4 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "file-text":
      return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function AdminNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin" || pathname.startsWith("/admin/figures");
    return pathname.startsWith(href);
  };

  return (
    <nav className="mb-6 flex items-center gap-2 rounded-xl bg-[var(--card-bg)] px-4 py-2.5">
      <span className="mr-auto text-base font-bold">
        <span className="text-[var(--accent)]">Figure</span>Hub
      </span>
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--foreground)]/60 hover:bg-[var(--foreground)]/5"
            }`}
          >
            <NavIcon name={item.icon} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
