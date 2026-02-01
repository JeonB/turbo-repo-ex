import { Alert } from "@repo/ui/alert";
import { Badge } from "@repo/ui/badge";

export default function AppsPage() {
  return (
    <>
      <h1 className="text-3xl font-bold text-white">Apps</h1>
      <p className="mt-2 text-neutral-400">
        The monorepo includes three apps that consume the shared UI package.
      </p>

      <section className="mt-10 space-y-8">
        <div>
          <h2 className="text-xl font-semibold text-white">web</h2>
          <Badge variant="default" className="ml-2">
            apps/web
          </Badge>
          <p className="mt-2 text-neutral-400">
            Main web application. Uses Next.js and imports @repo/ui for all UI.
            Run with <code className="rounded bg-neutral-800 px-1 py-0.5">pnpm dev</code> in{" "}
            <code className="rounded bg-neutral-800 px-1 py-0.5">apps/web</code> (e.g. port 3001).
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">docs</h2>
          <Badge variant="default" className="ml-2">
            apps/docs
          </Badge>
          <p className="mt-2 text-neutral-400">
            This documentation site. Next.js with sidebar navigation and @repo/ui
            for examples. Run with <code className="rounded bg-neutral-800 px-1 py-0.5">pnpm dev</code> in{" "}
            <code className="rounded bg-neutral-800 px-1 py-0.5">apps/docs</code>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">storybook</h2>
          <Badge variant="default" className="ml-2">
            apps/storybook
          </Badge>
          <p className="mt-2 text-neutral-400">
            Component development and documentation. Stories for Alert, Avatar,
            Badge, Button, Card, Gradient, TurborepoLogo. Run with{" "}
            <code className="rounded bg-neutral-800 px-1 py-0.5">pnpm dev</code> in{" "}
            <code className="rounded bg-neutral-800 px-1 py-0.5">apps/storybook</code> (port 6006).
          </p>
          <Alert variant="info" title="New components">
            When adding a new component to packages/ui, add a story in
            apps/storybook/stories and an alias in .storybook/main.ts.
          </Alert>
        </div>
      </section>
    </>
  );
}
