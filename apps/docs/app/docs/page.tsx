import Link from "next/link";
import { Badge } from "@repo/ui/badge";

const SECTIONS = [
  { title: "Getting started", href: "/docs/getting-started", description: "Installation, pnpm, and running with Turbo." },
  { title: "Monorepo", href: "/docs/monorepo", description: "Package structure, workspace, and dependencies." },
  { title: "Packages / UI", href: "/docs/packages/ui", description: "Overview and usage of @repo/ui." },
  { title: "Component reference", href: "/docs/components", description: "API and examples for each @repo/ui component." },
  { title: "Apps", href: "/docs/apps", description: "Web, Docs, and Storybook apps." },
];

export default function DocsIntroPage() {
  return (
    <>
      <Badge variant="success" className="mb-4">
        Documentation
      </Badge>
      <h1 className="text-3xl font-bold text-white">Documentation</h1>
      <p className="mt-2 text-neutral-400">
        Welcome to the Turbo Repo monorepo documentation. Use the sidebar to
        navigate.
      </p>
      <section className="mt-10">
        <h2 className="text-xl font-semibold text-white">Sections</h2>
        <ul className="mt-4 space-y-3">
          {SECTIONS.map(({ title, href, description }) => (
            <li key={href}>
              <Link
                href={href}
                className="block rounded-lg border border-transparent px-4 py-3 text-neutral-300 transition-colors hover:border-neutral-700 hover:bg-neutral-800/30 hover:text-white"
              >
                <span className="font-medium">{title}</span>
                <span className="mt-1 block text-sm text-neutral-400">
                  {description}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
