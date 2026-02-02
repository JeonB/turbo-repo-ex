import Link from "next/link";
import { Avatar } from "@repo/ui/avatar";
import { Badge } from "@repo/ui/badge";
import { DOCS_BASE } from "../lib/config";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Docs", href: `${DOCS_BASE}/docs` },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-800 bg-neutral-950/80 backdrop-blur supports-backdrop-filter:bg-neutral-950/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-semibold text-white hover:text-neutral-300"
          >
            Turbo Repo
          </Link>
          <ul className="flex items-center gap-4">
            {NAV_LINKS.map(({ label, href }) => (
              <li key={href}>
                {href.startsWith("http") ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-neutral-400 hover:text-white"
                  >
                    {label}
                  </a>
                ) : (
                  <Link
                    href={href}
                    className="text-sm text-neutral-400 hover:text-white"
                  >
                    {label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-3">
          <Badge variant="success">@repo/ui</Badge>
          <Avatar fallback="U" size="sm" />
          <a
            href={`${DOCS_BASE}/docs/getting-started`}
            className="inline-flex items-center justify-center rounded-md bg-blue-1000 px-4 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90"
          >
            Get started
          </a>
        </div>
      </div>
    </header>
  );
}
