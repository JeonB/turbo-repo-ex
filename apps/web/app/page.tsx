import { Alert } from "@repo/ui/alert";
import { Badge } from "@repo/ui/badge";
import { Card } from "@repo/ui/card";
import { Gradient } from "@repo/ui/gradient";
import { DOCS_BASE } from "../lib/config";

const FEATURE_LINKS = [
  {
    title: "Docs",
    href: "https://turborepo.com/docs",
    description:
      "Find in-depth information about Turborepo features and API.",
  },
  {
    title: "Learn",
    href: "https://turborepo.com/docs/handbook",
    description: "Learn more about monorepos with our handbook.",
  },
  {
    title: "Templates",
    href: "https://turborepo.com/docs/getting-started/from-example",
    description: "Choose from over 15 examples and deploy with a single click.",
  },
  {
    title: "Deploy",
    href: "https://vercel.com/new",
    description: "Instantly deploy your Turborepo to a shareable URL with Vercel.",
  },
];

export default function Page() {
  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden border-b border-neutral-800 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <Gradient
          className="left-1/2 top-[-300px] h-[600px] w-[600px] -translate-x-1/2 opacity-20"
          conic
        />
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <div className="mb-4">
            <Badge variant="success">@repo/ui</Badge>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Build with a shared design system
          </h1>
          <p className="mt-4 text-lg text-neutral-400">
            This app uses components from the shared <code>@repo/ui</code>{" "}
            package. One monorepo, consistent UI across web and docs.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href={`${DOCS_BASE}/docs/getting-started`}
              className="inline-flex items-center justify-center rounded-md bg-blue-1000 px-4 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90"
            >
              Get started
            </a>
            <a
              href={`${DOCS_BASE}/docs/components`}
              className="inline-flex items-center justify-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
            >
              Components
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <Alert variant="info" title="Monorepo">
          All UI comes from <code>packages/ui</code>. Change a component once,
          see it everywhere in web and docs.
        </Alert>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-white">Resources</h2>
        <p className="mt-1 text-sm text-neutral-400">
          Links and guides powered by shared @repo/ui Card components.
        </p>
        <div className="mt-8 grid gap-6 text-left sm:grid-cols-2 lg:grid-cols-4">
          {FEATURE_LINKS.map(({ title, href, description }) => (
            <Card href={href} key={title} title={title}>
              {description}
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
