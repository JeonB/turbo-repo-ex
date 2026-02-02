"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const DOC_LINKS = [
  { label: "Introduction", href: "/docs" },
  { label: "Getting started", href: "/docs/getting-started" },
  { label: "Monorepo", href: "/docs/monorepo" },
  { label: "Packages / UI", href: "/docs/packages/ui" },
  { label: "Component reference", href: "/docs/components" },
  { label: "Apps", href: "/docs/apps" },
];

export function DocsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-neutral-800 bg-neutral-950 py-6">
      <nav aria-label="Documentation" className="px-4">
        <ul className="space-y-1">
          {DOC_LINKS.map(({ label, href }) => {
            const isActive = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-neutral-800 text-white"
                      : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                  }`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
