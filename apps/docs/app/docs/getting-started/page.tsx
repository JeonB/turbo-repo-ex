import { Alert } from "@repo/ui/alert";

export default function GettingStartedPage() {
  return (
    <>
      <h1 className="text-3xl font-bold text-white">Getting started</h1>
      <p className="mt-2 text-neutral-400">
        Install dependencies and run the monorepo with pnpm and Turborepo.
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-white">Prerequisites</h2>
        <ul className="mt-2 list-inside list-disc space-y-1 text-neutral-300">
          <li>Node.js 18+</li>
          <li>pnpm (recommended) or npm</li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-white">Install</h2>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-neutral-900 p-4 text-sm text-neutral-300">
          {`pnpm install`}
        </pre>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-white">Run</h2>
        <p className="mt-2 text-neutral-400">
          Start all apps in development mode with Turborepo:
        </p>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-neutral-900 p-4 text-sm text-neutral-300">
          {`pnpm dev`}
        </pre>
        <Alert variant="success" className="mt-4">
          Web runs on port 3001, Docs on 3002 (or configured port), Storybook on
          6006.
        </Alert>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-white">Build</h2>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-neutral-900 p-4 text-sm text-neutral-300">
          {`pnpm build`}
        </pre>
        <p className="mt-2 text-sm text-neutral-400">
          Builds packages first, then apps (web, docs, storybook).
        </p>
      </section>
    </>
  );
}
