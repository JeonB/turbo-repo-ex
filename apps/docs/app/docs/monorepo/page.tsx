import { Alert } from "@repo/ui/alert";
import { Badge } from "@repo/ui/badge";

export default function MonorepoPage() {
  return (
    <>
      <h1 className="text-3xl font-bold text-white">Monorepo</h1>
      <p className="mt-2 text-neutral-400">
        This repo is a Turborepo monorepo with shared packages and multiple
        apps.
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-white">Structure</h2>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-neutral-900 p-4 text-sm text-neutral-300">
          {`turbo-repo-ex/
├── apps/
│   ├── web/        # Main web app
│   ├── docs/       # This documentation site
│   └── storybook/  # UI component stories
├── packages/
│   ├── ui/         # Shared @repo/ui components
│   ├── tailwind-config/
│   ├── typescript-config/
│   └── eslint-config/
├── pnpm-workspace.yaml
└── turbo.json`}
        </pre>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-white">Workspace</h2>
        <p className="mt-2 text-neutral-400">
          <code className="rounded bg-neutral-800 px-1 py-0.5 text-sm">
            pnpm-workspace.yaml
          </code>{" "}
          defines <code className="rounded bg-neutral-800 px-1 py-0.5">apps/*</code> and{" "}
          <code className="rounded bg-neutral-800 px-1 py-0.5">packages/*</code>.
          Apps depend on packages via <Badge variant="default">workspace:*</Badge>.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-white">Tasks</h2>
        <p className="mt-2 text-neutral-400">
          <code className="rounded bg-neutral-800 px-1 py-0.5">turbo.json</code>{" "}
          defines build, lint, and dev. Build runs <code className="rounded bg-neutral-800 px-1 py-0.5">^build</code> so
          packages build before apps.
        </p>
        <Alert variant="info" title="Tip">
          Use <code>pnpm build</code> or <code>pnpm dev</code> at the root to
          run Turborepo tasks.
        </Alert>
      </section>
    </>
  );
}
