import Link from "next/link";
import { DOCS_BASE } from "../lib/config";

const FOOTER_LINKS = [
  { label: "Docs", href: `${DOCS_BASE}/docs`, external: !!DOCS_BASE },
  { label: "Getting started", href: `${DOCS_BASE}/docs/getting-started`, external: !!DOCS_BASE },
  { label: "Turborepo", href: "https://turborepo.com/docs", external: true },
];

export function Footer() {
  return (
    <footer className="border-t border-neutral-800 bg-neutral-950">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-neutral-400">
            Built with Turborepo · Monorepo example
          </p>
          <ul className="flex flex-wrap items-center gap-4">
            {FOOTER_LINKS.map(({ label, href, external }) => (
              <li key={href}>
                {external ? (
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
        </div>
      </div>
    </footer>
  );
}
