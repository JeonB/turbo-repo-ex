import { Alert } from "@repo/ui/alert";
import { Badge } from "@repo/ui/badge";

export default function PackagesUiPage() {
  return (
    <>
      <h1 className="text-3xl font-bold text-white">Packages / UI</h1>
      <p className="mt-2 text-neutral-400">
        <Badge variant="success">@repo/ui</Badge> is the shared UI package used
        by web and docs.
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-white">Usage</h2>
        <p className="mt-2 text-neutral-400">
          Add <code className="rounded bg-neutral-800 px-1 py-0.5">@repo/ui</code> as a
          dependency in your app:
        </p>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-neutral-900 p-4 text-sm text-neutral-300">
          {`"dependencies": {
  "@repo/ui": "workspace:*"
}`}
        </pre>
        <p className="mt-4 text-neutral-400">
          Import components and styles:
        </p>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-neutral-900 p-4 text-sm text-neutral-300">
          {`import "@repo/ui/styles.css";
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";`}
        </pre>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-white">Components</h2>
        <p className="mt-2 text-neutral-400">
          Available exports: Alert, Avatar, Badge, Button, Card, Gradient,
          TurborepoLogo. See the{" "}
          <a
            href="/docs/components"
            className="text-blue-1000 underline hover:no-underline"
          >
            Component reference
          </a>{" "}
          for examples and props.
        </p>
        <Alert variant="success" className="mt-4">
          Build the UI package with <code>pnpm build</code> in{" "}
          <code>packages/ui</code> or from root. Storybook uses source files via
          Vite aliases.
        </Alert>
      </section>
    </>
  );
}
