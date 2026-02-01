import Link from "next/link";

const DOC_LINKS = [
  { label: "Introduction", href: "/docs" },
  { label: "Getting started", href: "/docs/getting-started" },
  { label: "Monorepo", href: "/docs/monorepo" },
  { label: "Packages / UI", href: "/docs/packages/ui" },
  { label: "Component reference", href: "/docs/components" },
  { label: "Apps", href: "/docs/apps" },
];

export function DocsSidebar() {
  return (
    <aside className="w-56 shrink-0 border-r border-neutral-800 bg-neutral-950 py-6">
      <nav className="px-4">
        <ul className="space-y-1">
          {DOC_LINKS.map(({ label, href }) => (
            <li key={href}>
              <Link
                href={href}
                className="block rounded-md px-3 py-2 text-sm text-neutral-400 hover:bg-neutral-800 hover:text-white"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
